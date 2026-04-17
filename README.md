# 📦 API REST - Express + Sequelize + TypeScript

Una API REST robusta construida con **Express**, **Sequelize** y **TypeScript**. Este proyecto implementa estándares modernos de seguridad, incluyendo autenticación JWT, encriptación de datos, validaciones estrictas y un sistema de notificaciones por correo electrónico.

---

## 🚀 Tecnologías Utilizadas

- **Entorno:** Node.js
- **Framework:** Express
- **Lenguaje:** TypeScript
- **ORM:** Sequelize
- **Seguridad:** \* JWT (JSON Web Tokens)
  - bcrypt (Hashing de contraseñas)
  - Rate Limiting
- **Validación:** express-validator
- **Productividad:** PNPM, Nodemailer

---

## 📁 Estructura del Proyecto

```text
src/
│
├── config/           # Configuraciones (DB, limiter, nodemailer)
│   ├── db.ts
│   ├── limiter.ts
│   └── nodemailer.ts
│
├── controllers/      # Lógica de negocio (Controladores)
│
├── Emails/           # Plantillas y manejo de correos (AuthEmail.ts)
│
├── helpers/          # Funciones de utilidad (Auth, JWT, Tokens)
│
├── middlewares/      # Middlewares (Auth, Validaciones, Entidades)
│
├── models/           # Modelos de datos (Sequelize)
│
├── routes/           # Definición de Endpoints
│   ├── authRouter.ts
│   ├── budgetRouter.ts
│   └── index.ts
│
├── index.ts          # Punto de entrada de la aplicación
└── .env              # Variables de entorno (no trackeado)
```
````

---

## ⚙️ Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto y completa los siguientes campos:

```env
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos

# Seguridad
JWT_SECRET=tu_secreto_super_seguro

# Nodemailer / Email Service
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
```

---

## 📦 Instalación y Uso

### 1. Instalación de dependencias

Asegúrate de tener [PNPM](https://pnpm.io/) instalado:

```bash
pnpm install
```

### 2. Ejecución en Desarrollo

Para iniciar el servidor con recarga automática:

```bash
pnpm run dev
```

_Opcional (Modo API):_

```bash
pnpm run dev:api
```

### 3. Construcción y Producción

Compila el código TypeScript a JavaScript:

```bash
pnpm run build
```

Inicia el servidor en producción:

```bash
pnpm start
```

---

## 🔐 Seguridad y Autenticación

### Flujo de Acceso

1.  **Registro/Login:** Los datos son validados y la contraseña se encripta con `bcrypt`.
2.  **JWT:** Tras el login exitoso, se genera un token firmado.
3.  **Middleware:** Las rutas protegidas requieren el token en los headers.

**Ejemplo de Header:**

> `Authorization: Bearer TU_TOKEN_AQUÍ`

### Características de Seguridad

- ✅ **Encriptación:** Passwords nunca se almacenan en texto plano.
- ✅ **Rate Limiting:** Protección contra ataques de fuerza bruta.
- ✅ **Validación:** Sanitización de datos de entrada en cada request.

---

## 📬 Sistema de Correos

La API utiliza **Nodemailer** para gestionar procesos críticos:

- Confirmación de cuenta mediante tokens únicos.
- Recuperación de contraseñas olvidadas.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

## ✍️ Autor

**Heymer Meza** - _Full Stack Developer_

---

### 🔥 Próximas Mejoras (Roadmap)

- [ ] Implementación de Testing Unitario (Jest/Supertest).
- [ ] Documentación de API con Swagger/OpenAPI.

```

```
