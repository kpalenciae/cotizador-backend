// controllers/cotizacionController.js
import { pool } from '../db.js';

export const crearCotizacion = async (req, res) => {
  try {
    const {
      cliente_nombre,
      cliente_apellido,
      negocio_nombre,
      departamento,
      municipio,
      creado_por // puede venir null/undefined
    } = req.body;

    // Validación mínima (lado servidor)
    if (!cliente_nombre || !cliente_apellido || !negocio_nombre || !departamento || !municipio) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const sql = `
      INSERT INTO cotizaciones
      (cliente_nombre, cliente_apellido, negocio_nombre, departamento, municipio, creado_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      cliente_nombre.trim(),
      cliente_apellido.trim(),
      negocio_nombre.trim(),
      departamento,
      municipio.trim(),
      (Number.isInteger(creado_por) ? creado_por : null)
    ];

    const [result] = await pool.query(sql, params);

    // Traer registro recién creado (opcional)
    const [rows] = await pool.query(
      'SELECT id, cliente_nombre, cliente_apellido, negocio_nombre, departamento, municipio, estado, fecha, creado_por FROM cotizaciones WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Cotización creada correctamente',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error al crear cotización:', err);
    return res.status(500).json({ message: 'Error interno al crear la cotización' });
  }
};

// (Opcional) listar últimas cotizaciones
export const listarCotizaciones = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, cliente_nombre, cliente_apellido, negocio_nombre, departamento, municipio, estado, fecha, creado_por FROM cotizaciones ORDER BY fecha DESC LIMIT 50'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Error al listar cotizaciones:', err);
    return res.status(500).json({ message: 'Error interno' });
  }
};
