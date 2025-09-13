// __tests__/productoController.test.js
import { jest } from '@jest/globals';

let listarProductos;

beforeAll(async () => {
  // Mock de la capa de DB ANTES de importar el controlador
  jest.unstable_mockModule('../db.js', () => ({
    pool: {
      query: jest.fn().mockResolvedValue([
        [
          {
            id: 1,
            codigo: 'P001',
            nombre: 'Aspirina',
            descripcion: 'Analgésico',
            contenido: '500mg',
            dosificacion: '1 tableta cada 8 horas',
            imagen: 'aspirina.jpg',
            creado_en: '2025-01-01',
            actualizado_en: '2025-01-02'
          }
        ],
        []
      ])
    }
  }));

  // Importa el controlador DESPUÉS del mock
  ({ listarProductos } = await import('../controllers/productoController.js'));
});

// Helpers para simular req/res de Express
const mockReq = (overrides = {}) => ({ params: {}, body: {}, query: {}, ...overrides });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json  = jest.fn().mockReturnValue(res);
  res.send  = jest.fn().mockReturnValue(res);
  return res;
};

describe('productoController.listarProductos', () => {
  it('devuelve objeto paginado con items', async () => {
    const req = mockReq(); // sin query -> usa defaults (page=1,size=12, etc.)
    const res = mockRes();

    await listarProductos(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledTimes(1);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('items');
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.items[0]).toMatchObject({
      id: 1,
      codigo: 'P001',
      nombre: 'Aspirina'
    });
    expect(payload).toHaveProperty('total');
    expect(payload).toHaveProperty('page');
    expect(payload).toHaveProperty('size');
  });
});
