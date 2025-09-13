# 🛒 Cotizador Backend

Backend desarrollado en **Node.js + Express** para gestionar productos, cotizaciones y usuarios.  
Incluye **pruebas unitarias e integración** con **Jest + Supertest**, y está configurado con **GitHub Actions** para ejecutar las pruebas automáticamente en cada `git push`.

---

## 🚀 Tecnologías principales
- **Node.js** (runtime de JavaScript)
- **Express** (framework backend)
- **MySQL2** (conexión a base de datos)
- **Jest** (framework de testing)
- **Supertest** (testing de endpoints HTTP)
- **GitHub Actions** (CI/CD)

---

## 📂 Estructura del proyecto
```
cotizador-backend/
├── controllers/        # Controladores de la lógica de negocio
├── models/             # Modelos y conexión a la base de datos
├── routes/             # Definición de rutas de la API
├── public/             # Archivos estáticos (HTML, imágenes, etc.)
├── __tests__/          # Pruebas unitarias y de integración
├── app.js              # Configuración principal de Express
├── index.js            # Punto de entrada del servidor
├── jest.config.cjs     # Configuración de Jest
├── package.json        # Dependencias y scripts de NPM
└── .github/workflows/  # Configuración de CI/CD con GitHub Actions
```

---

## ⚙️ Instalación

Clona el repositorio y entra en el directorio:

```bash
git clone https://github.com/kpalenciae/cotizador-backend.git
cd cotizador-backend
```

Instala dependencias:

```bash
npm install
```

---

## ▶️ Ejecución en desarrollo

```bash
npm run dev
```

El servidor se iniciará en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Ejecutar pruebas

```bash
npm test
```

Salida esperada:

```
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
```

---

## 🔄 Integración continua (CI/CD)

El proyecto incluye un flujo de trabajo de **GitHub Actions** (`.github/workflows/ci.yml`) que:

1. Instala dependencias.
2. Ejecuta las pruebas unitarias.
3. Verifica que todos los tests pasen antes de aceptar cambios.

Puedes ver los resultados en la pestaña **Actions** de GitHub.

---

## 📌 Recomendaciones

- No subir el archivo `.env` (ya está ignorado en `.gitignore`).
- Usar **ramas** (`feature/mi-funcion`) para nuevas funcionalidades.
- Mantener las pruebas actualizadas al agregar endpoints.

---

## ✨ Autor

👤 **Kevin Palencia**  
📧 kpalenciae@miumg.edu.gt  
🚀 Proyecto académico con fines de aprendizaje.
