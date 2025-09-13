// __tests__/productos.e2e.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

let app;

beforeAll(async () => {
  // Mock de DB antes de importar la app
  jest.unstable_mockModule('../db.js', () => ({
    pool: {
      query: jest.fn().mockResolvedValue([
        [
          {
            id: 1,
            codigo: 'P001',
            nombre: 'Aspirina',
            descripcion: null,
            contenido: null,
            dosificacion: null,
            imagen: null,
            creado_en: null,
            actualizado_en: null
          }
        ],
        []
      ])
    }
  }));

  // Importa la app después del mock
  ({ default: app } = await import('../app.js'));
});

describe('GET /api/productos', () => {
  it('responde 200 y un objeto con items', async () => {
    const res = await request(app).get('/api/productos');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toMatchObject({ codigo: 'P001' });
  });
});
