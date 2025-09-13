// controllers/usuarioController.js
// cotizador-backend/controllers/usuarioController.js
import { pool } from '../db.js';   // 👈 nota el "../db.js"

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pickUsuario = (u) => ({
  id: u.id,
  nombre: u.nombre,
  correo: u.correo,
  rol_id: u.rol_id,
  creado_en: u.creado_en,
  actualizado_en: u.actualizado_en
});

// POST /api/usuarios  (crear usuario)
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol_id } = req.body;
    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ message: 'nombre, correo, password y rol_id son requeridos' });
    }
    // ¿correo existente?
    const [dups] = await pool.query('SELECT id FROM usuarios WHERE correo=?', [correo]);
    if (dups.length) return res.status(409).json({ message: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol_id)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo, hash, rol_id]
    );
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [r.insertId]);
    return res.status(201).json(pickUsuario(rows[0]));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error creando usuario' });
  }
};

// GET /api/usuarios?search=&rol_id=&page=&size=
export const listarUsuarios = async (req, res) => {
  try {
    const { search = '', rol_id, page = 1, size = 10 } = req.query;
    const limit = Math.max(parseInt(size, 10) || 10, 1);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

    const filters = [];
    const params = [];

    if (search) {
      filters.push('(u.nombre LIKE ? OR u.correo LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (rol_id) {
      filters.push('u.rol_id = ?');
      params.push(rol_id);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [data] = await pool.query(
      `SELECT u.* FROM usuarios u ${where} ORDER BY u.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [tot] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios u ${where}`,
      params
    );

    res.json({
      items: data.map(pickUsuario),
      total: tot[0].total,
      page: parseInt(page, 10) || 1,
      size: limit
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error listando usuarios' });
  }
};

// GET /api/usuarios/:id
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(pickUsuario(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo usuario' });
  }
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol_id, password } = req.body;

    const [exists] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
    if (!exists.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    // validar correo duplicado (si cambia)
    if (correo && correo !== exists[0].correo) {
      const [dups] = await pool.query('SELECT id FROM usuarios WHERE correo=?', [correo]);
      if (dups.length) return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    let fields = [];
    let values = [];
    if (nombre) { fields.push('nombre=?'); values.push(nombre); }
    if (correo) { fields.push('correo=?'); values.push(correo); }
    if (rol_id) { fields.push('rol_id=?'); values.push(rol_id); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('contrasena_hash=?'); values.push(hash);
    }
    if (!fields.length) return res.json(pickUsuario(exists[0]));

    const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id=?`;
    values.push(id);
    await pool.query(sql, values);

    const [row] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
    res.json(pickUsuario(row[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error actualizando usuario' });
  }
};

// DELETE /api/usuarios/:id
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('DELETE FROM usuarios WHERE id=?', [id]);
    if (!rows.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};

// GET /api/usuarios/check-email?correo=
export const checkEmail = async (req, res) => {
  try {
    const { correo } = req.query;
    if (!correo) return res.status(400).json({ message: 'correo requerido' });
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE correo=?', [correo]);
    res.json({ existe: rows.length > 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error verificando correo' });
  }
};

// POST /api/usuarios/login
export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ message: 'correo y password son requeridos' });

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo=?', [correo]);
    if (!rows.length) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, rows[0].contrasena_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { sub: rows[0].id, rol_id: rows[0].rol_id },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: pickUsuario(rows[0])
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error en login' });
  }
};
