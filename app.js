import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import cotizacionRoutes from './routes/cotizacionRoutes.js';
import detalleCotizacionRoutes from './routes/detalleCotizacionRoutes.js';
import cotizacionRoutes2 from './routes/cotizacionRoutes2.js';
import cotizacionRoutes3 from './routes/cotizacionRoutes3.js';
import configRoutes from './routes/configRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api', detalleCotizacionRoutes); // /api/crearDetalleCotizacion
app.use('/api', cotizacionRoutes2);
app.use('/api', cotizacionRoutes3);
app.use('/api/config', configRoutes);

export default app;
