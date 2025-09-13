// controllers/cotizacionController.js
import { pool } from '../db.js';

/* Helpers */
const fmtId = (id) => `COT-${String(id).padStart(3, '0')}`;
const allowEstados = new Set(['Pendiente', 'Enviada', 'Completada']);

/**
 * GET /api/cotizaciones?page=1&pageSize=10&q=&estado=&fecha=YYYY-MM-DD
 * Lista paginada con filtros.
 * Respuesta:
 *  { total, page, pageSize, data: [{ id, id_fmt, cliente, fecha, estado }] }
 */
export async function listarCotizaciones(req, res) {
  const page     = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
  const q        = (req.query.q || '').trim();
  const estado   = (req.query.estado || '').trim();
  const fecha    = (req.query.fecha || '').trim(); // YYYY-MM-DD

  const where = [];
  const args  = [];

  if (q) {
    where.push(`(
      COALESCE(NULLIF(TRIM(c.negocio_nombre), ''),
               TRIM(CONCAT_WS(' ', c.cliente_nombre, c.cliente_apellido)))
      LIKE ?
    )`);
    args.push(`%${q}%`);
  }
  if (estado) { where.push(`c.estado = ?`); args.push(estado); }
  if (fecha)  { where.push(`DATE(c.fecha) = ?`); args.push(fecha); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset   = (page - 1) * pageSize;

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM cotizaciones c ${whereSql}`,
      args
    );

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        COALESCE(NULLIF(TRIM(c.negocio_nombre), ''),
                 TRIM(CONCAT_WS(' ', c.cliente_nombre, c.cliente_apellido))) AS cliente,
        c.fecha,
        c.estado
      FROM cotizaciones c
      ${whereSql}
      ORDER BY c.fecha DESC, c.id DESC
      LIMIT ? OFFSET ?
      `,
      [...args, pageSize, offset]
    );

    const data = rows.map(r => ({
      id: r.id,
      id_fmt: fmtId(r.id),
      cliente: r.cliente,
      fecha: r.fecha,
      estado: r.estado
    }));

    res.json({ total, page, pageSize, data });
  } catch (err) {
    console.error('listarCotizaciones error:', err);
    res.status(500).json({ error: 'Error al listar cotizaciones' });
  }
}

/**
 * GET /api/cotizaciones/recientes?limit=4
 * Para el dashboard (ya usado por tu HTML).
 */
export async function listarCotizacionesRecientes(req, res) {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 4));
  try {
    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        COALESCE(NULLIF(TRIM(c.negocio_nombre), ''),
                 TRIM(CONCAT_WS(' ', c.cliente_nombre, c.cliente_apellido))) AS cliente,
        DATE(c.fecha) AS fecha,
        c.estado
      FROM cotizaciones c
      ORDER BY c.fecha DESC, c.id DESC
      LIMIT ?
      `,
      [limit]
    );

    const data = rows.map(r => ({
      id: fmtId(r.id),     // el dashboard espera el prefijo COT-###
      cliente: r.cliente,
      fecha: r.fecha,      // YYYY-MM-DD
      estado: r.estado
    }));

    res.json(data);
  } catch (err) {
    console.error('listarCotizacionesRecientes error:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones recientes' });
  }
}

/**
 * GET /api/cotizaciones/:id/detalles
 * Devuelve líneas de la cotización con nombre/código de producto.
 * Respuesta: [{ producto, codigo, cantidad, notas }]
 */
export async function obtenerDetallesCotizacion(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.nombre AS producto,
        p.codigo AS codigo,
        d.cantidad,
        d.notas
      FROM detalle_cotizaciones d
      JOIN productos p  ON p.id = d.producto_id
      WHERE d.cotizacion_id = ?
      ORDER BY d.id ASC
      `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('obtenerDetallesCotizacion error:', err);
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
}

/**
 * PUT /api/cotizaciones/:id/estado
 * Body: { estado: 'Pendiente' | 'Enviada' | 'Completada' }
 * Notas:
 *  - Para marcar 'Completada' validamos que tenga >=1 detalle.
 */
export async function actualizarEstadoCotizacion(req, res) {
  const id = Number(req.params.id);
  const estado = (req.body?.estado || '').trim();

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  if (!allowEstados.has(estado)) {
    return res.status(400).json({ error: 'Estado no permitido' });
  }

  try {
    // Si se va a completar, validar que tenga al menos 1 detalle
    if (estado === 'Completada') {
      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM detalle_cotizaciones WHERE cotizacion_id = ?`,
        [id]
      );
      if (cnt === 0) {
        return res.status(409).json({ error: 'No se puede completar: la cotización no tiene detalles.' });
      }
    }

    const [upd] = await pool.query(
      `UPDATE cotizaciones SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    res.json({ id, estado, id_fmt: fmtId(id), ok: true });
  } catch (err) {
    console.error('actualizarEstadoCotizacion error:', err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
}
