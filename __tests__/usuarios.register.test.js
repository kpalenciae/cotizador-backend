// __tests__/usuarios.register.test.js
import { jest } from '@jest/globals';
import request from 'supertest';

let app;

// Payload de ejemplo
const payload = {
  nombre: 'Kevin',
  correo: 'kevin@test.com',
  password: '123456',
  rol_id: 2
};

describe('POST /api/usuarios (registro)', () => {
  beforeEach(() => jest.resetModules());

  describe('Integración', () => {
    beforeAll(async () => {
      // Mock DB: INSERT → SELECT del creado
      const queryMock = jest.fn()
        .mockResolvedValueOnce([{ insertId: 101 }, undefined]) // INSERT
        .mockResolvedValueOnce([[
          { id: 101, nombre: 'Kevin', correo: 'kevin@test.com', rol_id: 2, creado_en: null, actualizado_en: null }
        ], []]); // SELECT

      jest.unstable_mockModule('../db.js', () => ({ pool: { query: queryMock } }));
      ({ default: app } = await import('../app.js'));
    });

    it('201 y usuario creado (sin exponer password)', async () => {
      const res = await request(app).post('/api/usuarios').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 101, nombre: 'Kevin', correo: 'kevin@test.com', rol_id: 2 });
      expect(res.body.password).toBeUndefined(); // por seguridad
    });

    it('400/422 si falta "correo"', async () => {
      const res = await request(app).post('/api/usuarios').send({ ...payload, correo: undefined });
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Unitario (controlador) – error DB', () => {
    let crearUsuario;

    it('500 si la DB arroja error', async () => {
      jest.unstable_mockModule('../db.js', () => ({
        pool: { query: jest.fn().mockRejectedValue(new Error('SQL error')) }
      }));

      ({ crearUsuario } = await import('../controllers/usuarioController.js'));

      const req = { body: payload };
      const res = {
        status: jest.fn().mockReturnValueThis?.() || jest.fn().mockReturnValue(null),
        json: jest.fn().mockReturnValue(null)
      };

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
