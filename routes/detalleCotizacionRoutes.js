import { Router } from 'express';
import { crearDetalleCotizacion } from '../controllers/detalleCotizacionController.js';

const router = Router();

// GET opcional para listar por cotización (?cotizacion_id=)
router.get('/crearDetalleCotizacion', async (req, res) => {
  const { cotizacion_id } = req.query;
  if (!cotizacion_id) return res.json([]);
  const [rows] = await pool.query(
    'SELECT id, cotizacion_id, producto_id, cantidad, notas, creado_en FROM detalle_cotizaciones WHERE cotizacion_id=?',
    [cotizacion_id]
  );
  res.json(rows);
});

// *** ESTE ES EL QUE NECESITAS ***
router.post('/crearDetalleCotizacion', crearDetalleCotizacion);

export default router;
