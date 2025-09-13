// controllers/cotizacionController.js
import { pool } from '../db.js';

// GET /api/cotizaciones/recientes?limit=4
export async function listarCotizacionesRecientes(req, res) {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 4));
  try {
    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        -- si existe nombre de negocio lo tomamos, si no el nombre completo del cliente
        COALESCE(NULLIF(TRIM(c.negocio_nombre), ''), 
                 TRIM(CONCAT_WS(' ', c.cliente_nombre, c.cliente_apellido)))   AS cliente,
        DATE(c.fecha)                                                          AS fecha,
        c.estado
      FROM cotizaciones c
      ORDER BY c.fecha DESC
      LIMIT ?
      `,
      [limit]
    );

    // Normalizamos al formato que ya usa tu dashboard
    const data = rows.map(r => ({
      id: `COT-${String(r.id).padStart(3, '0')}`, // si prefieres el ID "crudo", usa r.id
      cliente: r.cliente,
      fecha: r.fecha,       // "YYYY-MM-DD"
      estado: r.estado
    }));

    res.json(data);
  } catch (err) {
    console.error('Error listando cotizaciones recientes:', err);
    res.status(500).json({ error: 'Error al obtener cotizaciones recientes' });
  }
}
