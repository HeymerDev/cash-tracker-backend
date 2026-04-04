📦 API REST - Express + Sequelize + TypeScript

API REST construida con Express, Sequelize y TypeScript, que incluye autenticación con JWT, encriptación con bcrypt, validaciones con express-validator y envío de correos con Nodemailer.

🚀 Tecnologías utilizadas
Node.js
Express
TypeScript
Sequelize (ORM)
JWT (JSON Web Tokens)
bcrypt
express-validator
Nodemailer
PNPM
📁 Estructura del proyecto
src/
│
├── config/ # Configuraciones (DB, limiter, nodemailer)
│ ├── db.ts
│ ├── limiter.ts
│ └── nodemailer.ts
│
├── controllers/ # Lógica de negocio
│
├── Emails/ # Manejo de correos
│ └── AuthEmail.ts
│
├── helpers/ # Funciones reutilizables
│ ├── auth.ts
│ ├── jwt.ts
│ └── token.ts
│
├── middlewares/ # Middlewares personalizados
│ ├── auth.ts
│ ├── budget.ts
│ ├── expense.ts
│ └── validations.ts
│
├── models/ # Modelos Sequelize
│
├── routes/ # Definición de rutas
│ ├── authRouter.ts
│ ├── budgetRouter.ts
│ └── index.ts
│
├── index.ts # Punto de entrada
│
.env # Variables de entorno
.gitignore
⚙️ Configuración del entorno

Crea un archivo .env en la raíz del proyecto:

PORT=3000

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos

JWT_SECRET=tu_secreto

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
📦 Instalación

Instala las dependencias con pnpm:

pnpm install
▶️ Ejecución del proyecto
🔧 Modo desarrollo
pnpm run dev
🔧 Modo desarrollo (API)
pnpm run dev:api

Este modo permite ejecutar el servidor con una flag adicional --api (útil si manejas lógica condicional en tu app).

🏗️ Build del proyecto
pnpm run build

Esto compila el proyecto de TypeScript a JavaScript en la carpeta dist.

🚀 Producción
pnpm start

Ejecuta el proyecto desde:

dist/index.js
🔐 Autenticación

La API utiliza JWT para proteger rutas.

📌 Uso del token

El cliente debe enviar el token en los headers:

Authorization: Bearer TU_TOKEN
🔄 Flujo de autenticación
Usuario inicia sesión
Se valida la contraseña con bcrypt
Se genera un JWT
Se accede a rutas protegidas mediante middleware
🔑 Seguridad
🔒 Contraseñas encriptadas con bcrypt
🛡️ Validaciones con express-validator
🔑 Autenticación con JWT
🚫 Rate limiting (limiter.ts)
🧱 Middlewares para protección de rutas
📬 Sistema de correos

Se usa Nodemailer para:

Confirmación de cuenta
Recuperación de contraseña

Configuración en:

src/config/nodemailer.ts
✅ Validaciones

Centralizadas en:

src/middlewares/validations.ts

Ejemplo:

check("email").isEmail().withMessage("Email inválido")
🧠 Arquitectura

El proyecto sigue una arquitectura modular:

Capa Responsabilidad
Routes Definen endpoints
Controllers Lógica de negocio
Models Base de datos (Sequelize)
Middlewares Validaciones y seguridad
Helpers Funciones reutilizables
📌 Buenas prácticas
✔️ Uso de TypeScript
✔️ Separación de responsabilidades
✔️ Variables de entorno
✔️ Código escalable
✔️ Estructura modular
📄 Licencia

MIT

✍️ Autor

Heymer Meza

🔥 Siguientes mejoras (opcional)
