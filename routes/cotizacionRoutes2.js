// routes/cotizacionRoutes.js
import { Router } from 'express';
import { listarCotizacionesRecientes } from '../controllers/cotizacionController2.js';

const router = Router();

router.get('/cotizaciones/recientes', listarCotizacionesRecientes);

export default router;
