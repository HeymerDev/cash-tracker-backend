# 💸 Cash Tracker API

API REST para la administración de presupuestos y gastos personales, construida con **Express 5**, **Sequelize** y **TypeScript**.

Incluye autenticación con JWT, verificación de cuenta por correo, recuperación de contraseña, rate limiting, validación de entrada en cada request y **documentación interactiva con Swagger / OpenAPI 3.1**.

---

## 📑 Tabla de contenidos

- [Tecnologías](#-tecnologías)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Documentación interactiva (Swagger)](#-documentación-interactiva-swagger)
- [Autenticación](#-autenticación)
- [Endpoints](#-endpoints)
- [Ejemplos con curl](#-ejemplos-con-curl)
- [Formato de respuestas](#-formato-de-respuestas)
- [Rate limiting](#-rate-limiting)
- [Modelo de datos](#-modelo-de-datos)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## 🚀 Tecnologías

| Categoría        | Herramienta                                       |
| ---------------- | ------------------------------------------------- |
| Entorno          | Node.js                                           |
| Framework        | Express 5                                         |
| Lenguaje         | TypeScript                                        |
| ORM              | Sequelize (`sequelize-typescript`) sobre PostgreSQL |
| Autenticación    | JSON Web Tokens (`jsonwebtoken`)                  |
| Hashing          | bcrypt                                            |
| Validación       | express-validator                                 |
| Rate limiting    | express-rate-limit                                |
| Correos          | Nodemailer (servicio Gmail)                        |
| Documentación    | OpenAPI 3.1 + Swagger UI (`swagger-ui-express`)   |
| Testing          | Jest + Supertest + ts-jest                        |
| Gestor paquetes  | PNPM                                              |

---

## 📋 Requisitos previos

- **Node.js 18 o superior** (Express 5 lo exige; el proyecto se desarrolla sobre Node 22).
- **PNPM** — `npm install -g pnpm`
- Una base de datos **PostgreSQL** accesible (local o remota).
- Una cuenta de **Gmail con contraseña de aplicación** para el envío de correos de verificación y recuperación.

---

## 📦 Instalación

```bash
pnpm install
```

Crea el archivo `.env` en la raíz (ver la sección siguiente) y levanta el servidor:

```bash
pnpm run dev
```

La API queda disponible en `http://localhost:4000` y la documentación en `http://localhost:4000/api/docs`.

Las tablas se crean solas: al arrancar, `server.ts` ejecuta `db.sync()` contra la base de datos configurada.

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos (cadena de conexión completa de PostgreSQL)
DATABASE_URL=postgres://usuario:password@localhost:5432/cash_tracker

# Seguridad
JWT_SECRET=tu_secreto_super_seguro

# Correo (Nodemailer con servicio Gmail)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion

# Frontend (se usa para armar los enlaces de los correos)
FRONTEND_URL=http://localhost:3000
```

### Detalle de cada variable

| Variable         | Obligatoria | Usada en                        | Descripción                                                                                     |
| ---------------- | ----------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PORT`           | No          | `src/index.ts`                  | Puerto del servidor. Si se omite, se usa **4000**.                                                |
| `NODE_ENV`       | No          | `src/config/limiter.ts`, `AuthController` | Fuera de `production`, el token de confirmación del registro se guarda además en `globalThis.cashTrackerConfirmationToken` (lo usan los tests). |
| `DATABASE_URL`   | **Sí**      | `src/config/db.ts`              | Cadena de conexión de PostgreSQL. Se conecta con `ssl.require: false`.                            |
| `JWT_SECRET`     | **Sí**      | `src/helpers/jwt.ts`            | Secreto para firmar y verificar los JWT. Los tokens expiran a los **30 días**.                     |
| `EMAIL_USER`     | **Sí**      | `src/config/nodemailer.ts`      | Cuenta de Gmail que envía los correos.                                                            |
| `EMAIL_PASSWORD` | **Sí**      | `src/config/nodemailer.ts`      | Contraseña de aplicación de esa cuenta (no la contraseña normal de Gmail).                        |
| `FRONTEND_URL`   | **Sí**      | `src/Emails/AuthEmail.ts`       | Base de los enlaces incluidos en los correos de verificación y recuperación.                       |

> ⚠️ El `.env` no está trackeado por git. No subas credenciales al repositorio.

---

## 📜 Scripts disponibles

| Script                  | Descripción                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `pnpm run dev`          | Servidor en desarrollo con recarga automática (nodemon + ts-node). |
| `pnpm run dev:api`      | Igual que `dev`, pasando el flag `--api` al proceso.               |
| `pnpm run build`        | Compila TypeScript a JavaScript en `./dist`.                       |
| `pnpm start`            | Ejecuta la build de producción (`node ./dist/index.js`).           |
| `pnpm test`             | Corre la suite de Jest.                                            |
| `pnpm run test:coverage`| Corre los tests generando el reporte de cobertura.                 |

---

## 📖 Documentación interactiva (Swagger)

La especificación **OpenAPI 3.1** vive centralizada en [`src/config/swagger.ts`](src/config/swagger.ts) y se sirve en dos formatos:

| Ruta              | Qué devuelve                                                                    |
| ----------------- | ------------------------------------------------------------------------------- |
| `/api/docs`       | **Swagger UI**: documentación navegable donde puedes probar cada endpoint.       |
| `/api/docs.json`  | La especificación cruda en JSON, lista para importar en Postman, Insomnia o generadores de clientes. |

Con el servidor levantado:

```bash
pnpm run dev
```

Abre **http://localhost:4000/api/docs**. o **https://cash-tracker-backend-b5ku.onrender.com/api/docs/**

Para probar los endpoints protegidos desde la UI: haz login, copia el `token` de la respuesta, pulsa el botón **Authorize** 🔓 y pégalo. La sesión se conserva entre recargas de la página (`persistAuthorization`).

> Al agregar o modificar un endpoint en `src/routes/`, actualiza el objeto `paths` de `src/config/swagger.ts` para que la documentación no se desincronice.

---

## 🔐 Autenticación

El esquema es **Bearer JWT**. Todos los endpoints marcados con 🔒 requieren la cabecera:

```
Authorization: Bearer <token>
```

### Flujo completo

1. **Registro** — `POST /api/auth/register`. La contraseña se hashea con bcrypt y la cuenta queda con `confirm: false`. Se envía un correo con un **token de 6 dígitos**.
2. **Verificación** — `POST /api/auth/verify-email` con ese token. La cuenta pasa a `confirm: true` y el token se invalida.
3. **Login** — `POST /api/auth/login`. Solo funciona con la cuenta ya verificada; devuelve un JWT válido por **30 días**.
4. **Peticiones protegidas** — envía el JWT en la cabecera `Authorization`.

### Recuperación de contraseña

1. `POST /api/auth/forgot-password` — envía un token de 6 dígitos al correo. Responde siempre `200` con el mismo mensaje, exista o no la cuenta, para que no se pueda averiguar qué correos están registrados.
2. `POST /api/auth/validate-reset-token` — comprueba que el token sigue vigente (no lo consume).
3. `POST /api/auth/reset-password/{token}` — establece la nueva contraseña y consume el token.

---

## 🛣️ Endpoints

Prefijos: `/api/auth` para la autenticación y `/api/budgets` para presupuestos y gastos.
🔒 = requiere JWT · ⏱️ = sujeto a rate limiting.

### General

| Método | Ruta             | Auth | Descripción                                   |
| ------ | ---------------- | :--: | --------------------------------------------- |
| `GET`  | `/`              |  —   | Health check. Devuelve un mensaje de bienvenida. |
| `GET`  | `/api/docs`      |  —   | Swagger UI.                                    |
| `GET`  | `/api/docs.json` |  —   | Especificación OpenAPI en JSON.                |

### Auth ⏱️

| Método  | Ruta                                 | Auth | Descripción                                              |
| ------- | ------------------------------------ | :--: | -------------------------------------------------------- |
| `POST`  | `/api/auth/register`                 |  —   | Crea la cuenta y envía el correo de verificación.         |
| `POST`  | `/api/auth/login`                    |  —   | Devuelve el JWT. Exige la cuenta verificada.              |
| `POST`  | `/api/auth/verify-email`             |  —   | Confirma la cuenta con el token de 6 dígitos.             |
| `POST`  | `/api/auth/forgot-password`          |  —   | Envía el token de recuperación al correo.                 |
| `POST`  | `/api/auth/validate-reset-token`     |  —   | Verifica que el token de recuperación siga siendo válido. |
| `POST`  | `/api/auth/reset-password/{token}`   |  —   | Establece la nueva contraseña.                            |
| `GET`   | `/api/auth/user`                     |  🔒  | Perfil del usuario autenticado (`id`, `name`, `email`).   |
| `PATCH` | `/api/auth/user`                     |  🔒  | Actualiza nombre y correo.                                |
| `POST`  | `/api/auth/update-password`          |  🔒  | Cambia la contraseña exigiendo la actual.                 |
| `POST`  | `/api/auth/check-password`           |  🔒  | Confirma la contraseña actual sin modificar nada.         |

### Budgets

| Método   | Ruta                       | Auth | Descripción                                                     |
| -------- | -------------------------- | :--: | --------------------------------------------------------------- |
| `GET`    | `/api/budgets`             |  🔒  | Lista los presupuestos del usuario (más recientes primero).      |
| `POST`   | `/api/budgets`             |  🔒  | Crea un presupuesto. El `userId` sale del token.                 |
| `GET`    | `/api/budgets/{budgetId}`  |  🔒  | Devuelve el presupuesto **con sus gastos** incluidos.            |
| `PATCH`  | `/api/budgets/{budgetId}`  |  🔒  | Actualiza nombre y/o monto.                                      |
| `DELETE` | `/api/budgets/{budgetId}`  |  🔒  | Elimina el presupuesto y sus gastos en cascada.                  |

### Expenses

| Método   | Ruta                                                | Auth | Descripción                                            |
| -------- | --------------------------------------------------- | :--: | ------------------------------------------------------ |
| `GET`    | `/api/budgets/{budgetId}/expenses`                  |  🔒  | ⚠️ **No implementado** (ver [Roadmap](#-roadmap)). Usa `GET /api/budgets/{budgetId}`, que ya incluye los gastos. |
| `POST`   | `/api/budgets/{budgetId}/expenses`                  |  🔒  | Crea un gasto dentro del presupuesto.                   |
| `GET`    | `/api/budgets/{budgetId}/expenses/{expenseId}`      |  🔒  | Devuelve un gasto.                                      |
| `PATCH`  | `/api/budgets/{budgetId}/expenses/{expenseId}`      |  🔒  | Actualiza nombre y/o monto del gasto.                   |
| `DELETE` | `/api/budgets/{budgetId}/expenses/{expenseId}`      |  🔒  | Elimina el gasto.                                       |

Además de la autenticación, las rutas anidadas validan que el presupuesto **pertenezca al usuario del token** (`403 Access denied`) y que el gasto **pertenezca al presupuesto de la URL** (`403 Invalid Action`).

---

## 🧪 Ejemplos con curl

> Los ejemplos usan sintaxis de **bash**. En PowerShell, reemplaza `\` por acentos graves (`` ` ``) al partir líneas y usa comillas dobles escapadas en el `-d`.

### 1. Registrar una cuenta

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Heymer Meza","email":"heymer@correo.com","password":"password123"}'
```

```json
{ "message": "User registered successfully" }
```

Revisa tu bandeja de entrada: llegará un token de **6 dígitos**.

### 2. Verificar el correo

```bash
curl -X POST http://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"482913"}'
```

```json
{ "message": "Email verified successfully" }
```

### 3. Iniciar sesión y guardar el token

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"heymer@correo.com","password":"password123"}'
```

```json
{ "message": "Login successful", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Guárdalo en una variable para los siguientes pasos:

```bash
TOKEN="pega_aqui_tu_jwt"
```

### 4. Consultar el perfil

```bash
curl http://localhost:4000/api/auth/user \
  -H "Authorization: Bearer $TOKEN"
```

```json
{ "id": 1, "name": "Heymer Meza", "email": "heymer@correo.com" }
```

### 5. Crear un presupuesto

```bash
curl -X POST http://localhost:4000/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Vacaciones 2026","amount":1500}'
```

```json
{ "message": "Budget entry created successfully" }
```

### 6. Listar los presupuestos

```bash
curl http://localhost:4000/api/budgets \
  -H "Authorization: Bearer $TOKEN"
```

```json
[
  {
    "id": 3,
    "name": "Vacaciones 2026",
    "amount": "1500.00",
    "userId": 1,
    "createdAt": "2026-09-08T14:12:03.101Z",
    "updatedAt": "2026-09-08T14:12:03.101Z"
  }
]
```

### 7. Agregar un gasto al presupuesto

```bash
curl -X POST http://localhost:4000/api/budgets/3/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Hotel","amount":320.50}'
```

```json
{ "message": "Expense entry created successfully" }
```

### 8. Consultar el presupuesto con sus gastos

```bash
curl http://localhost:4000/api/budgets/3 \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "id": 3,
  "name": "Vacaciones 2026",
  "amount": "1500.00",
  "userId": 1,
  "createdAt": "2026-09-08T14:12:03.101Z",
  "updatedAt": "2026-09-08T14:12:03.101Z",
  "expenses": [
    {
      "id": 12,
      "name": "Hotel",
      "amount": "320.50",
      "budgetId": 3,
      "createdAt": "2026-09-08T14:15:40.882Z",
      "updatedAt": "2026-09-08T14:15:40.882Z"
    }
  ]
}
```

---

## 📤 Formato de respuestas

### Operaciones de escritura

`POST`, `PATCH` y `DELETE` devuelven un mensaje, **no el recurso** creado o modificado:

```json
{ "message": "Budget entry created successfully" }
```

### Errores de validación (`400`)

Vienen de `express-validator` con la forma:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Password is required",
      "path": "password",
      "location": "body"
    }
  ]
}
```

### Errores de negocio

```json
{ "message": "Budget entry not found" }
```

### Códigos de estado usados

| Código | Significado                                                                 |
| :----: | --------------------------------------------------------------------------- |
| `200`  | Operación correcta.                                                          |
| `201`  | Recurso creado.                                                              |
| `400`  | Fallo de validación del cuerpo o de los parámetros de la ruta.                |
| `401`  | Credenciales inválidas, contraseña incorrecta o fallo de autenticación: cabecera `Authorization` ausente, JWT inválido o expirado, o cuenta inexistente. |
| `403`  | Cuenta sin verificar, presupuesto de otro usuario o gasto ajeno al presupuesto. |
| `404`  | El recurso o el token no existe.                                             |
| `409`  | El correo ya está en uso.                                                    |
| `429`  | Se superó el rate limit en `/api/auth`.                                      |
| `500`  | Error interno.                                                               |

> ⚠️ **Montos como string:** `amount` se devuelve como texto (`"1500.00"`) porque es una columna `DECIMAL` de PostgreSQL y Sequelize la serializa así para no perder precisión. En las peticiones debe enviarse como **número**.

---

## ⏱️ Rate limiting

Todas las rutas bajo `/api/auth` están limitadas **por IP y por minuto**, con un margen mayor fuera de producción para no estorbar durante el desarrollo y las pruebas:

| `NODE_ENV`      | Peticiones por minuto |
| --------------- | :-------------------: |
| `production`    | 5                     |
| cualquier otro  | 20                    |

Al superar el límite:

```json
{ "message": "Too many requests from this IP, please try again after a minute" }
```

Se configura en [`src/config/limiter.ts`](src/config/limiter.ts).

---

## 🗄️ Modelo de datos

```
User (users)
 ├── id, name, email (único), password (hash)
 ├── token           → verificación de cuenta (6 dígitos)
 ├── token_password  → recuperación de contraseña (6 dígitos)
 ├── confirm         → boolean, false hasta verificar el correo
 └── budgets 1───N

Budget (budgets)
 ├── id, name, amount (DECIMAL), userId
 └── expenses 1───N

Expense (expenses)
 └── id, name, amount (DECIMAL), budgetId
```

Ambas relaciones usan `onDelete: CASCADE`: borrar un usuario elimina sus presupuestos, y borrar un presupuesto elimina sus gastos.

---

## 📁 Estructura del proyecto

```text
src/
│
├── config/           # Configuración de infraestructura
│   ├── db.ts             # Conexión Sequelize
│   ├── limiter.ts        # Rate limiter de /api/auth
│   ├── nodemailer.ts     # Transporte de correo (Gmail)
│   └── swagger.ts        # Especificación OpenAPI 3.1
│
├── controllers/      # Lógica de negocio
│   ├── AuthController.ts
│   ├── BudgetController.ts
│   └── ExpenseController.ts
│
├── Emails/           # Plantillas y envío de correos
│   └── AuthEmail.ts
│
├── helpers/          # Utilidades
│   ├── auth.ts           # hash y comparación de contraseñas
│   ├── jwt.ts            # firma y verificación de JWT
│   └── token.ts          # generación de tokens de 6 dígitos
│
├── middlewares/      # Autenticación, validación y carga de entidades
│   ├── auth.ts
│   ├── budget.ts
│   ├── expense.ts
│   └── validation.ts
│
├── models/           # Modelos de Sequelize
│   ├── Budget.ts
│   ├── Expense.ts
│   └── User.ts
│
├── routes/           # Definición de endpoints
│   ├── authRouter.ts
│   └── budgetRouter.ts
│
├── test/             # Pruebas
│   ├── integration/
│   ├── mocks/
│   └── unit/
│
├── index.ts          # Arranque del servidor (listen)
└── server.ts         # Configuración de Express y montaje de rutas
```

Los routers cargan las entidades con `router.param`: `validateBudgetId` → `validateBudgetExists` → `hasAccess` para `budgetId`, y `validateExpenseId` → `validateExpenseExists` → `belongsToBudget` para `expenseId`. Por eso los controladores reciben `req.budget` y `req.expense` ya validados.

---

## 🧾 Testing

```bash
pnpm test
```

Con reporte de cobertura:

```bash
pnpm run test:coverage
```

La suite combina **pruebas unitarias** de controladores y middlewares (con `node-mocks-http`) y **pruebas de integración** sobre la app de Express (con `supertest`), sin necesidad de levantar el servidor en un puerto.

---

## 🗺️ Roadmap

### Hecho

- [x] Autenticación con JWT, verificación de cuenta y recuperación de contraseña.
- [x] Testing unitario y de integración con Jest y Supertest.
- [x] Documentación de la API con Swagger / OpenAPI 3.1.
- [x] Respuesta genérica en `forgot-password` para impedir la enumeración de cuentas.
- [x] `401` coherente en todos los fallos de autenticación.
- [x] Rate limit diferenciado: 5 peticiones por minuto en producción y 20 en desarrollo.

### Pendiente

- [ ] **Implementar `ExpenseController.getAll`.** La ruta `GET /api/budgets/{budgetId}/expenses` está registrada, pero el controlador no envía respuesta, así que la petición queda colgada hasta el timeout del cliente. Está marcada como `deprecated` en Swagger.
- [ ] **Validar `name` en el registro.** El modelo `User` lo exige pero el router no lo valida, así que omitirlo produce un `500` de Sequelize en lugar de un `400` de validación.
- [ ] **Aislar las pruebas de integración de la base de datos real.** `src/test/integration/app.test.ts` registra y autentica un usuario contra la base de datos de `DATABASE_URL` sin limpiar al terminar, así que en la segunda ejecución el registro devuelve `409` y el login `403` (cuenta sin verificar), lo que hace fallar la suite en cascada. Conviene una base de datos de test con `beforeAll`/`afterAll`.
- [ ] **Unificar la licencia.** El archivo `LICENSE` es MIT, pero `package.json` declara `"license": "ISC"`.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE).

## ✍️ Autor

**Heymer Meza** — _Full Stack Developer_
