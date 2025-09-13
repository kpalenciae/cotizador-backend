// cotizador-backend/controllers/configController.js
import { pool } from '../db.js';

/** Convierte filas [ {clave, valor} ] a objeto { clave: JSON.parse(valor) } */
function rowsToObject(rows) {
  const out = {};
  for (const r of rows) {
    try { out[r.clave] = JSON.parse(r.valor); }
    catch { out[r.clave] = r.valor; } // fallback si no es JSON
  }
  return out;
}

/** GET /api/config  -> todas las claves */
export const getAllConfig = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM configuraciones ORDER BY clave');
    res.json(rowsToObject(rows));
  } catch (err) {
    console.error('[config] getAll:', err);
    res.status(500).send('Error al obtener configuración');
  }
};

/** GET /api/config/:clave  -> una clave */
export const getConfigByKey = async (req, res) => {
  const { clave } = req.params;
  try {
    const [rows] = await pool.query('SELECT valor FROM configuraciones WHERE clave = ?', [clave]);
    if (!rows.length) return res.status(404).send('Clave no encontrada');
    let valor = rows[0].valor;
    try { valor = JSON.parse(valor); } catch {}
    res.json({ clave, valor });
  } catch (err) {
    console.error('[config] getByKey:', err);
    res.status(500).send('Error al obtener la clave');
  }
};

/** PUT /api/config  body: { clave: string, valor: any }  -> upsert */
export const upsertConfig = async (req, res) => {
  const { clave, valor } = req.body || {};
  if (!clave) return res.status(400).send('Falta "clave"');
  try {
    const str = typeof valor === 'string' ? valor : JSON.stringify(valor);
    await pool.query(
      `INSERT INTO configuraciones (clave, valor)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [clave, str]
    );
    res.json({ ok: true, clave });
  } catch (err) {
    console.error('[config] upsert:', err);
    res.status(500).send('Error al guardar configuración');
  }
};

/** PUT /api/config/bulk  body: [ {clave, valor}, ... ]  */
export const bulkUpsertConfig = async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : null;
  if (!items || !items.length) return res.status(400).send('Se requiere un arreglo de items');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const it of items) {
      if (!it?.clave) throw new Error('Item sin "clave"');
      const str = typeof it.valor === 'string' ? it.valor : JSON.stringify(it.valor);
      await conn.query(
        `INSERT INTO configuraciones (clave, valor)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
        [it.clave, str]
      );
    }
    await conn.commit();
    res.json({ ok: true, count: items.length });
  } catch (err) {
    await conn.rollback();
    console.error('[config] bulk:', err);
    res.status(500).send('Error al guardar configuración en bloque');
  } finally {
    conn.release();
  }
};

/** GET /api/config/export -> exporta todo como JSON (descargable) */
export const exportConfig = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM configuraciones');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="configuracion.json"');
    res.send(JSON.stringify(rowsToObject(rows), null, 2));
  } catch (err) {
    console.error('[config] export:', err);
    res.status(500).send('Error al exportar configuración');
  }
};

/** POST /api/config/import  body: { data: object } -> pisa claves existentes */
export const importConfig = async (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== 'object') return res.status(400).send('Body debe incluir "data" objeto');

  const entries = Object.entries(data).map(([clave, valor]) => ({ clave, valor }));
  req.body = entries;               // reutilizamos bulk
  return bulkUpsertConfig(req, res);
};
