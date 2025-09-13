import { Router } from 'express';
import {
  listarCotizaciones,
  listarCotizacionesRecientes,
  obtenerDetallesCotizacion,
  actualizarEstadoCotizacion
} from '../controllers/cotizacionController3.js';

const router = Router();

router.get('/cotizaciones3', listarCotizaciones);
router.get('/cotizaciones3/recientes', listarCotizacionesRecientes);
router.get('/cotizaciones3/:id/detalles', obtenerDetallesCotizacion);
router.put('/cotizaciones3/:id/estado', actualizarEstadoCotizacion);

export default router;
