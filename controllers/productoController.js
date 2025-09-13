// controllers/productoController.js
// cotizador-backend/controllers/usuarioController.js
import { pool } from '../db.js';   // 👈 nota el "../db.js"

const pickProducto = (p) => ({
  id: p.id,
  codigo: p.codigo,
  nombre: p.nombre,
  descripcion: p.descripcion,
  contenido: p.contenido,
  dosificacion: p.dosificacion,
  imagen: p.imagen,
  creado_en: p.creado_en,
  actualizado_en: p.actualizado_en
});

// POST /api/productos
export const crearProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion=null, contenido=null, dosificacion=null, imagen=null } = req.body;
    if (!codigo || !nombre) {
      return res.status(400).json({ message: 'codigo y nombre son requeridos' });
    }
    // validar código único
    const [dups] = await pool.query('SELECT id FROM productos WHERE codigo=?', [codigo]);
    if (dups.length) return res.status(409).json({ message: 'El código ya existe' });

    const [r] = await pool.query(
      `INSERT INTO productos (codigo, nombre, descripcion, contenido, dosificacion, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, descripcion, contenido, dosificacion, imagen]
    );
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [r.insertId]);
    res.status(201).json(pickProducto(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error creando producto' });
  }
};

// GET /api/productos?search=&page=&size=&codigo=
export const listarProductos = async (req, res) => {
  try {
    const { search = '', codigo, page = 1, size = 12 } = req.query;
    const limit = Math.max(parseInt(size, 10) || 12, 1);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

    const filters = [];
    const params = [];

    if (search) {
      filters.push('(nombre LIKE ? OR descripcion LIKE ? OR codigo LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (codigo) {
      filters.push('codigo = ?');
      params.push(codigo);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [data] = await pool.query(
      `SELECT * FROM productos ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [tot] = await pool.query(`SELECT COUNT(*) AS total FROM productos ${where}`, params);

    res.json({
      items: data.map(pickProducto),
      total: tot[0].total,
      page: parseInt(page, 10) || 1,
      size: limit
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error listando productos' });
  }
};

// GET /api/productos/:id
export const obtenerProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(pickProducto(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo producto' });
  }
};

// GET /api/productos/by-codigo/:codigo
export const obtenerPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await pool.query('SELECT * FROM productos WHERE codigo=?', [codigo]);
    if (!rows.length) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(pickProducto(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo producto por código' });
  }
};

// PUT /api/productos/:id
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, contenido, dosificacion, imagen } = req.body;

    const [exists] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    if (!exists.length) return res.status(404).json({ message: 'Producto no encontrado' });

    // Si cambia el código, valida unicidad
    if (codigo && codigo !== exists[0].codigo) {
      const [dups] = await pool.query('SELECT id FROM productos WHERE codigo=?', [codigo]);
      if (dups.length) return res.status(409).json({ message: 'El código ya existe' });
    }

    const fields = [];
    const values = [];
    if (codigo)      { fields.push('codigo=?');      values.push(codigo); }
    if (nombre)      { fields.push('nombre=?');      values.push(nombre); }
    if (descripcion !== undefined) { fields.push('descripcion=?'); values.push(descripcion); }
    if (contenido   !== undefined) { fields.push('contenido=?');   values.push(contenido); }
    if (dosificacion!== undefined) { fields.push('dosificacion=?');values.push(dosificacion); }
    if (imagen      !== undefined) { fields.push('imagen=?');      values.push(imagen); }

    if (!fields.length) return res.json(pickProducto(exists[0]));

    const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id=?`;
    values.push(id);
    await pool.query(sql, values);

    const [row] = await pool.query('SELECT * FROM productos WHERE id=?', [id]);
    res.json(pickProducto(row[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error actualizando producto' });
  }
};

// DELETE /api/productos/:id
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await pool.query('DELETE FROM productos WHERE id=?', [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error eliminando producto' });
  }
};
