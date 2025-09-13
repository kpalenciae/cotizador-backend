// routes/usuarioRoutes.js
import { Router } from 'express';
import {
  crearUsuario, listarUsuarios, obtenerUsuario,
  actualizarUsuario, eliminarUsuario, checkEmail, login
} from '../controllers/usuarioController.js';

const router = Router();

router.post('/', crearUsuario);
router.get('/', listarUsuarios);
router.get('/check-email', checkEmail);
router.post('/login', login);

router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
