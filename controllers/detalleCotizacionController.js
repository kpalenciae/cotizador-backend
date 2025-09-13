import { pool } from '../db.js';

export const crearDetalleCotizacion = async (req, res) => {
  try {
    const { cotizacion_id, producto_id, cantidad, notas } = req.body;

    if (!cotizacion_id || !producto_id || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ message: 'Campos obligatorios: cotizacion_id, producto_id, cantidad>0.' });
    }

    const [result] = await pool.query(
      `INSERT INTO detalle_cotizaciones (cotizacion_id, producto_id, cantidad, notas)
       VALUES (?, ?, ?, ?)`,
      [cotizacion_id, producto_id, cantidad, notas ?? null]
    );

    const [rows] = await pool.query(
      `SELECT id, cotizacion_id, producto_id, cantidad, notas, creado_en
         FROM detalle_cotizaciones WHERE id=?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Detalle guardado', data: rows[0] });
  } catch (err) {
    console.error('crearDetalleCotizacion:', err);
    res.status(500).json({ message: 'Error interno' });
  }
};
