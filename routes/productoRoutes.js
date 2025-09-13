// routes/productoRoutes.js
import { Router } from 'express';
import {
  crearProducto, listarProductos, obtenerProducto,
  actualizarProducto, eliminarProducto, obtenerPorCodigo
} from '../controllers/productoController.js';

const router = Router();

router.post('/', crearProducto);
router.get('/', listarProductos);
router.get('/by-codigo/:codigo', obtenerPorCodigo);

router.get('/:id', obtenerProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;
