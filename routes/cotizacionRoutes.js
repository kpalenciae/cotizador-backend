// routes/cotizacionRoutes.js
import { Router } from 'express';
import { crearCotizacion, listarCotizaciones } from '../controllers/cotizacionController.js';

const router = Router();

router.post('/', crearCotizacion);     // POST /api/cotizaciones
router.get('/', listarCotizaciones);   // GET  /api/cotizaciones (opcional)

export default router;
