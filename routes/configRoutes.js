// cotizador-backend/routes/configRoutes.js
import { Router } from 'express';
import {
  getAllConfig,
  getConfigByKey,
  upsertConfig,
  bulkUpsertConfig,
  exportConfig,
  importConfig
} from '../controllers/configController.js';

const router = Router();

// Leer
router.get('/', getAllConfig);
router.get('/:clave', getConfigByKey);

// Guardar
router.put('/', upsertConfig);
router.put('/bulk', bulkUpsertConfig);

// Import/Export
router.get('/export/json', exportConfig);
router.post('/import', importConfig);

export default router;
