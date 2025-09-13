# Pruebas unitarias e integración (Visual Studio 2022 + Node.js)

## Requisitos
- Visual Studio 2022 con el **Node.js development** workload o VS Code si prefieres.
- Node.js 18+ y npm.
- Este proyecto ya está configurado para usar **Jest** (ESM) y **Supertest**.

## Instalar dependencias de test
```bash
npm install --save-dev jest @jest/globals supertest
```

## Ejecutar pruebas
```bash
npm test
```
- Modo watch:
```bash
npm run test:watch
```

## Qué cambié
- **app.js**: configura y exporta `app` (Express) sin abrir el puerto.
- **index.js**: ahora solo arranca el servidor con `app.listen(...)`.
- **jest.config.cjs**: configuración mínima para soportar ESM en Jest.
- **package.json**: agregué scripts `test` y `test:watch`, y devDependencies.
- **__tests__/productoController.test.js**: prueba **unitaria** del controlador con *mock* del pool MySQL.
- **__tests__/productos.e2e.test.js**: prueba **de integración** con `supertest` para `GET /api/productos` (también con *mock* de DB).

## Notas
- Las pruebas **no** se conectan a la base de datos real; se *mockea* `pool.query` de `db.js` con `jest.unstable_mockModule` (necesario para ES Modules).
- Si cambias rutas o controladores, ajusta las importaciones en los tests.
- Puedes ver resultados en el **Test Explorer** de Visual Studio si tienes la extensión de Jest o ejecutando `npm test` en la Terminal integrada.
