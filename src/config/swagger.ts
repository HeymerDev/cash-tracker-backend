import type { JsonObject, SwaggerUiOptions } from "swagger-ui-express";

/**
 * Especificación OpenAPI 3.1 de la API de Cash Tracker.
 *
 * Se mantiene centralizada aquí (en lugar de anotaciones JSDoc en los routers)
 * para que los routers queden limpios y para que `tsc` compile la doc al `dist`
 * sin necesidad de copiar archivos extra en el build.
 *
 * Al agregar o cambiar un endpoint en `src/routes/`, actualiza `paths` aquí.
 */

const tags = [
  {
    name: "Auth",
    description:
      "Registro, verificación de cuenta, login y gestión del perfil del usuario. " +
      "Todas las rutas bajo `/api/auth` están protegidas por un rate limit por IP: 5 peticiones por minuto en producción, 20 fuera de ella.",
  },
  {
    name: "Budgets",
    description:
      "CRUD de presupuestos. Todas las rutas requieren autenticación y solo " +
      "operan sobre presupuestos que pertenecen al usuario del token.",
  },
  {
    name: "Expenses",
    description:
      "CRUD de gastos anidados dentro de un presupuesto. Además de la " +
      "autenticación, se valida que el gasto pertenezca al presupuesto de la URL.",
  },
];

const schemas: JsonObject = {
  UserProfile: {
    type: "object",
    description:
      "Datos públicos del usuario autenticado. La contraseña y los tokens nunca se exponen.",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Heymer Meza" },
      email: { type: "string", format: "email", example: "heymer@correo.com" },
    },
  },

  Budget: {
    type: "object",
    properties: {
      id: { type: "integer", example: 3 },
      name: { type: "string", maxLength: 100, example: "Vacaciones 2026" },
      amount: {
        type: "string",
        description:
          "Monto del presupuesto. Sequelize serializa las columnas DECIMAL como string para no perder precisión.",
        example: "1500.00",
      },
      userId: {
        type: "integer",
        description: "Propietario del presupuesto.",
        example: 1,
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  Expense: {
    type: "object",
    properties: {
      id: { type: "integer", example: 12 },
      name: { type: "string", maxLength: 100, example: "Hotel" },
      amount: {
        type: "string",
        description:
          "Monto del gasto. Sequelize serializa las columnas DECIMAL como string.",
        example: "320.50",
      },
      budgetId: {
        type: "integer",
        description: "Presupuesto al que pertenece el gasto.",
        example: 3,
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  BudgetWithExpenses: {
    allOf: [
      { $ref: "#/components/schemas/Budget" },
      {
        type: "object",
        properties: {
          expenses: {
            type: "array",
            items: { $ref: "#/components/schemas/Expense" },
          },
        },
      },
    ],
  },

  MessageResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Operation completed successfully" },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Something went wrong" },
      error: {
        description:
          "Detalle del error original. Solo se incluye en algunas respuestas 500.",
      },
    },
  },

  ValidationErrorResponse: {
    type: "object",
    description: "Formato de error que devuelve `express-validator`.",
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", example: "field" },
            value: { type: "string", example: "" },
            msg: { type: "string", example: "Password is required" },
            path: { type: "string", example: "password" },
            location: {
              type: "string",
              enum: ["body", "params", "query", "headers", "cookies"],
              example: "body",
            },
          },
        },
      },
    },
  },

  LoginResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Login successful" },
      token: {
        type: "string",
        description: "JWT firmado. Envíalo como `Authorization: Bearer <token>`.",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  },

  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        maxLength: 50,
        description:
          "Requerido por el modelo `User`. El router no lo valida, así que omitirlo produce un 500 en lugar de un 400.",
        example: "Heymer Meza",
      },
      email: {
        type: "string",
        format: "email",
        maxLength: 80,
        example: "heymer@correo.com",
      },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "password123",
      },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "heymer@correo.com" },
      password: { type: "string", format: "password", example: "password123" },
    },
  },

  EmailRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "heymer@correo.com" },
    },
  },

  TokenRequest: {
    type: "object",
    required: ["token"],
    properties: {
      token: {
        type: "string",
        minLength: 6,
        maxLength: 6,
        description: "Token de 6 dígitos enviado por correo.",
        example: "482913",
      },
    },
  },

  PasswordRequest: {
    type: "object",
    required: ["password"],
    properties: {
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "nuevaPassword123",
      },
    },
  },

  UpdateUserRequest: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string", maxLength: 50, example: "Heymer Meza" },
      email: {
        type: "string",
        format: "email",
        maxLength: 80,
        example: "heymer@correo.com",
      },
    },
  },

  UpdatePasswordRequest: {
    type: "object",
    required: ["current_password", "password"],
    properties: {
      current_password: {
        type: "string",
        format: "password",
        example: "password123",
      },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        description: "Nueva contraseña.",
        example: "nuevaPassword123",
      },
    },
  },

  CheckPasswordRequest: {
    type: "object",
    required: ["password"],
    properties: {
      password: { type: "string", format: "password", example: "password123" },
    },
  },

  BudgetInput: {
    type: "object",
    required: ["name", "amount"],
    properties: {
      name: { type: "string", maxLength: 100, example: "Vacaciones 2026" },
      amount: {
        type: "number",
        format: "float",
        exclusiveMinimum: 0,
        example: 1500,
      },
    },
  },

  BudgetPatchInput: {
    type: "object",
    description:
      "Ambos campos son opcionales, pero si se envían no pueden ir vacíos.",
    properties: {
      name: { type: "string", maxLength: 100, example: "Vacaciones 2026" },
      amount: {
        type: "number",
        format: "float",
        exclusiveMinimum: 0,
        example: 2000,
      },
    },
  },

  ExpenseInput: {
    type: "object",
    required: ["name", "amount"],
    properties: {
      name: { type: "string", maxLength: 100, example: "Hotel" },
      amount: {
        type: "number",
        format: "float",
        exclusiveMinimum: 0,
        example: 320.5,
      },
    },
  },

  ExpensePatchInput: {
    type: "object",
    description:
      "Ambos campos son opcionales, pero si se envían no pueden ir vacíos.",
    properties: {
      name: { type: "string", maxLength: 100, example: "Hotel" },
      amount: {
        type: "number",
        format: "float",
        exclusiveMinimum: 0,
        example: 400,
      },
    },
  },
};

/** Respuestas reutilizables entre endpoints. */
const responses: JsonObject = {
  ValidationError: {
    description: "Los datos enviados no pasaron la validación.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
      },
    },
  },
  Unauthorized: {
    description: [
      "No se pudo autenticar la petición. Ocurre cuando:",
      "",
      "- falta la cabecera `Authorization` o no trae un token después de `Bearer`;",
      "- el JWT es inválido, fue manipulado o expiró;",
      "- el JWT es válido pero su contenido no incluye un `userId`;",
      "- la cuenta asociada al token ya no existe.",
      "",
      "En todos los casos la respuesta es la misma, para no dar pistas sobre la causa.",
    ].join("\n"),
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: { message: "Unauthorized" },
      },
    },
  },
  RateLimited: {
    description:
      "Se superó el límite de peticiones por minuto por IP en las rutas de `/api/auth` (5 en producción, 20 fuera de ella).",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: {
          message:
            "Too many requests from this IP, please try again after a minute",
        },
      },
    },
  },
  BudgetForbidden: {
    description: "El presupuesto existe pero pertenece a otro usuario.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: { message: "Access denied" },
      },
    },
  },
  BudgetNotFound: {
    description: "No existe un presupuesto con ese ID.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: { message: "Budget entry not found" },
      },
    },
  },
  ExpenseForbidden: {
    description:
      "El gasto existe pero no pertenece al presupuesto indicado en la URL.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: { message: "Invalid Action" },
      },
    },
  },
  ExpenseNotFound: {
    description: "No existe un gasto con ese ID.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/MessageResponse" },
        example: { message: "Expense entry not found" },
      },
    },
  },
  ServerError: {
    description: "Error interno del servidor.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
};

/** Parámetros de ruta reutilizables. */
const parameters: JsonObject = {
  BudgetId: {
    name: "budgetId",
    in: "path",
    required: true,
    description: "ID del presupuesto. Debe ser un entero mayor que 0.",
    schema: { type: "integer", minimum: 1 },
    example: 3,
  },
  ExpenseId: {
    name: "expenseId",
    in: "path",
    required: true,
    description: "ID del gasto. Debe ser un entero mayor que 0.",
    schema: { type: "integer", minimum: 1 },
    example: 12,
  },
};

/** Atajo para el cuerpo JSON requerido de un request. */
const jsonBody = (schemaRef: string, required = true) => ({
  required,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaRef}` },
    },
  },
});

/** Atajo para una respuesta `{ message }` con un ejemplo concreto. */
const messageResponse = (description: string, message: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/MessageResponse" },
      example: { message },
    },
  },
});

const authPaths: JsonObject = {
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Registrar un nuevo usuario",
      description:
        "Crea la cuenta con la contraseña hasheada y envía un correo con un token de 6 dígitos " +
        "para confirmarla. La cuenta queda con `confirm: false` hasta verificar el correo.",
      operationId: "register",
      security: [],
      requestBody: jsonBody("RegisterRequest"),
      responses: {
        "201": messageResponse(
          "Usuario creado y correo de verificación enviado.",
          "User registered successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "409": messageResponse(
          "Ya existe una cuenta con ese correo.",
          "Email already in use",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": {
          description:
            "Error al crear el usuario (por ejemplo, si se omite `name`, que el modelo exige pero el router no valida).",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                message: "Error registering user",
                error: "notNull Violation: User.name cannot be null",
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Iniciar sesión",
      description:
        "Devuelve un JWT válido por el tiempo configurado. La cuenta debe estar verificada.",
      operationId: "login",
      security: [],
      requestBody: jsonBody("LoginRequest"),
      responses: {
        "200": {
          description: "Credenciales correctas.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": messageResponse(
          "El correo no existe o la contraseña es incorrecta.",
          "Invalid credentials",
        ),
        "403": messageResponse(
          "La cuenta existe pero aún no ha sido verificada.",
          "Please verify your email",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/verify-email": {
    post: {
      tags: ["Auth"],
      summary: "Confirmar la cuenta con el token del correo",
      description:
        "Marca la cuenta como verificada y consume el token, que queda invalidado.",
      operationId: "verifyEmail",
      security: [],
      requestBody: jsonBody("TokenRequest"),
      responses: {
        "200": messageResponse(
          "Cuenta verificada.",
          "Email verified successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": messageResponse(
          "El token no corresponde a ninguna cuenta pendiente.",
          "Invalid token",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Solicitar el restablecimiento de contraseña",
      description:
        "Si el correo corresponde a una cuenta, genera un token de 6 dígitos y lo envía por correo. " +
        "La respuesta es idéntica exista o no la cuenta, para que no se pueda averiguar qué correos están registrados.",
      operationId: "forgotPassword",
      security: [],
      requestBody: jsonBody("EmailRequest"),
      responses: {
        "200": messageResponse(
          "Petición procesada. No indica si la cuenta existe ni si se envió un correo.",
          "If an account exists with that email, we've sent password reset instructions",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/validate-reset-token": {
    post: {
      tags: ["Auth"],
      summary: "Validar el token de restablecimiento",
      description:
        "Comprueba que el token siga siendo válido antes de mostrar el formulario de nueva contraseña. No lo consume.",
      operationId: "validateResetToken",
      security: [],
      requestBody: jsonBody("TokenRequest"),
      responses: {
        "200": messageResponse("El token es válido.", "Token is valid"),
        "400": { $ref: "#/components/responses/ValidationError" },
        "404": messageResponse(
          "El token no existe o ya fue usado.",
          "Invalid token",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
      },
    },
  },

  "/api/auth/reset-password/{token}": {
    post: {
      tags: ["Auth"],
      summary: "Establecer una nueva contraseña con el token",
      description:
        "Reemplaza la contraseña y consume el token de recuperación.",
      operationId: "resetPassword",
      security: [],
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          description: "Token de 6 dígitos recibido por correo.",
          schema: { type: "string", minLength: 6, maxLength: 6 },
          example: "482913",
        },
      ],
      requestBody: jsonBody("PasswordRequest"),
      responses: {
        "200": messageResponse(
          "Contraseña actualizada.",
          "Password updated successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "404": messageResponse(
          "El token no existe o ya fue usado.",
          "Invalid token",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
      },
    },
  },

  "/api/auth/user": {
    get: {
      tags: ["Auth"],
      summary: "Obtener el perfil del usuario autenticado",
      operationId: "getUser",
      responses: {
        "200": {
          description: "Perfil del usuario del token.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserProfile" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "429": { $ref: "#/components/responses/RateLimited" },
      },
    },
    patch: {
      tags: ["Auth"],
      summary: "Actualizar nombre y correo",
      description:
        "Si el correo enviado ya pertenece a otro usuario responde 409. Si es el mismo correo del usuario, solo se actualiza el nombre.",
      operationId: "updateUser",
      requestBody: jsonBody("UpdateUserRequest"),
      responses: {
        "200": messageResponse(
          "Perfil actualizado.",
          "User updated successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": messageResponse(
          "El usuario del token ya no existe.",
          "User not found",
        ),
        "409": messageResponse(
          "El correo ya está en uso por otra cuenta.",
          "Email already in use",
        ),
        "429": { $ref: "#/components/responses/RateLimited" },
      },
    },
  },

  "/api/auth/update-password": {
    post: {
      tags: ["Auth"],
      summary: "Cambiar la contraseña estando autenticado",
      description: "Exige la contraseña actual antes de aplicar la nueva.",
      operationId: "updatePassword",
      requestBody: jsonBody("UpdatePasswordRequest"),
      responses: {
        "200": messageResponse(
          "Contraseña actualizada.",
          "Password updated successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": {
          description:
            "Falta el token (`Unauthorized`) o la contraseña actual es incorrecta.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageResponse" },
              example: { message: "Current password is incorrect" },
            },
          },
        },
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/auth/check-password": {
    post: {
      tags: ["Auth"],
      summary: "Confirmar la contraseña actual",
      description:
        "Se usa como paso de confirmación antes de acciones sensibles, sin modificar nada.",
      operationId: "checkPassword",
      requestBody: jsonBody("CheckPasswordRequest"),
      responses: {
        "200": messageResponse(
          "La contraseña coincide.",
          "Password is correct",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": {
          description:
            "Falta el token (`Unauthorized`) o la contraseña no coincide.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageResponse" },
              example: { message: "password is incorrect" },
            },
          },
        },
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },
};

const budgetPaths: JsonObject = {
  "/api/budgets": {
    get: {
      tags: ["Budgets"],
      summary: "Listar los presupuestos del usuario",
      description:
        "Devuelve solo los presupuestos del usuario del token, ordenados por fecha de creación descendente. No incluye los gastos.",
      operationId: "getBudgets",
      responses: {
        "200": {
          description: "Listado de presupuestos.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Budget" },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
    post: {
      tags: ["Budgets"],
      summary: "Crear un presupuesto",
      description:
        "El `userId` se toma del token; enviarlo en el cuerpo no tiene efecto. La respuesta no incluye el recurso creado.",
      operationId: "createBudget",
      requestBody: jsonBody("BudgetInput"),
      responses: {
        "201": messageResponse(
          "Presupuesto creado.",
          "Budget entry created successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/budgets/{budgetId}": {
    parameters: [{ $ref: "#/components/parameters/BudgetId" }],
    get: {
      tags: ["Budgets"],
      summary: "Obtener un presupuesto con sus gastos",
      operationId: "getBudgetById",
      responses: {
        "200": {
          description: "Presupuesto con la relación `expenses` incluida.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BudgetWithExpenses" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/BudgetForbidden" },
        "404": { $ref: "#/components/responses/BudgetNotFound" },
      },
    },
    patch: {
      tags: ["Budgets"],
      summary: "Actualizar un presupuesto",
      description: "Actualización parcial: envía solo los campos a modificar.",
      operationId: "updateBudget",
      requestBody: jsonBody("BudgetPatchInput"),
      responses: {
        "200": messageResponse(
          "Presupuesto actualizado.",
          "Budget entry updated successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/BudgetForbidden" },
        "404": { $ref: "#/components/responses/BudgetNotFound" },
      },
    },
    delete: {
      tags: ["Budgets"],
      summary: "Eliminar un presupuesto",
      description:
        "Elimina también todos sus gastos en cascada (`onDelete: CASCADE`).",
      operationId: "deleteBudget",
      responses: {
        "200": messageResponse(
          "Presupuesto eliminado.",
          "Budget entry deleted successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/BudgetForbidden" },
        "404": { $ref: "#/components/responses/BudgetNotFound" },
      },
    },
  },
};

const expensePaths: JsonObject = {
  "/api/budgets/{budgetId}/expenses": {
    parameters: [{ $ref: "#/components/parameters/BudgetId" }],
    get: {
      tags: ["Expenses"],
      summary: "Listar los gastos de un presupuesto (no implementado)",
      description:
        "**No usar.** La ruta está registrada pero `ExpenseController.getAll` no envía ninguna respuesta, " +
        "por lo que la petición queda colgada hasta el timeout del cliente. " +
        "Para obtener los gastos usa `GET /api/budgets/{budgetId}`, que los devuelve dentro del presupuesto.",
      operationId: "getExpenses",
      deprecated: true,
      responses: {
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/BudgetForbidden" },
        "404": { $ref: "#/components/responses/BudgetNotFound" },
      },
    },
    post: {
      tags: ["Expenses"],
      summary: "Crear un gasto dentro de un presupuesto",
      description:
        "El `budgetId` se toma de la URL. La respuesta no incluye el recurso creado.",
      operationId: "createExpense",
      requestBody: jsonBody("ExpenseInput"),
      responses: {
        "201": messageResponse(
          "Gasto creado.",
          "Expense entry created successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/BudgetForbidden" },
        "404": { $ref: "#/components/responses/BudgetNotFound" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  },

  "/api/budgets/{budgetId}/expenses/{expenseId}": {
    parameters: [
      { $ref: "#/components/parameters/BudgetId" },
      { $ref: "#/components/parameters/ExpenseId" },
    ],
    get: {
      tags: ["Expenses"],
      summary: "Obtener un gasto",
      operationId: "getExpenseById",
      responses: {
        "200": {
          description: "Gasto encontrado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Expense" },
            },
          },
        },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": {
          description:
            "El presupuesto es de otro usuario (`Access denied`) o el gasto no pertenece a ese presupuesto (`Invalid Action`).",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessageResponse" },
              example: { message: "Invalid Action" },
            },
          },
        },
        "404": { $ref: "#/components/responses/ExpenseNotFound" },
      },
    },
    patch: {
      tags: ["Expenses"],
      summary: "Actualizar un gasto",
      description: "Actualización parcial: envía solo los campos a modificar.",
      operationId: "updateExpense",
      requestBody: jsonBody("ExpensePatchInput"),
      responses: {
        "200": messageResponse(
          "Gasto actualizado.",
          "Expense entry updated successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/ExpenseForbidden" },
        "404": { $ref: "#/components/responses/ExpenseNotFound" },
      },
    },
    delete: {
      tags: ["Expenses"],
      summary: "Eliminar un gasto",
      operationId: "deleteExpense",
      responses: {
        "200": messageResponse(
          "Gasto eliminado.",
          "Expense entry deleted successfully",
        ),
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/ExpenseForbidden" },
        "404": { $ref: "#/components/responses/ExpenseNotFound" },
      },
    },
  },
};

export const swaggerSpec: JsonObject = {
  openapi: "3.1.0",
  info: {
    title: "Cash Tracker API",
    version: "1.0.0",
    description: [
      "API REST para la administración de presupuestos y gastos personales.",
      "",
      "## Autenticación",
      "",
      "Salvo el registro, el login y el flujo de recuperación de contraseña, todos los endpoints",
      "requieren un JWT en la cabecera `Authorization`:",
      "",
      "```",
      "Authorization: Bearer <token>",
      "```",
      "",
      "El token se obtiene en `POST /api/auth/login` y solo se emite si la cuenta ya fue verificada",
      "con el token de 6 dígitos que llega por correo tras el registro.",
      "Usa el botón **Authorize** de esta página para probar los endpoints protegidos.",
      "",
      "## Rate limiting",
      "",
      "Todas las rutas bajo `/api/auth` permiten 5 peticiones por minuto por IP en producción y 20 en desarrollo.",
      "Al superarlo la API responde `429`.",
      "",
      "## Notas sobre las respuestas",
      "",
      "- Los montos (`amount`) viajan como **string** en las respuestas porque son columnas `DECIMAL`,",
      "  pero deben enviarse como **number** en los cuerpos de las peticiones.",
      "- Las operaciones de escritura devuelven `{ message }` y no el recurso creado o modificado.",
      "- Cualquier fallo de autenticación (cabecera ausente, token inválido o expirado, cuenta",
      "  inexistente) devuelve siempre el mismo `401` con `{ message: \"Unauthorized\" }`.",
    ].join("\n"),
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    contact: {
      name: "Heymer Meza",
    },
  },
  servers: [
    {
      url: "http://localhost:{port}",
      description: "Servidor local de desarrollo",
      variables: {
        port: { default: "4000" },
      },
    },
  ],
  tags,
  security: [{ bearerAuth: [] }],
  paths: {
    "/": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        description: "Mensaje de bienvenida para comprobar que la API responde.",
        operationId: "root",
        security: [],
        responses: {
          "200": {
            description: "La API está activa.",
            content: {
              "text/html": {
                schema: { type: "string" },
                example: "Welcome to the Cash Tracker API",
              },
            },
          },
        },
      },
    },
    ...authPaths,
    ...budgetPaths,
    ...expensePaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT obtenido en `POST /api/auth/login`. Se envía como `Authorization: Bearer <token>`.",
      },
    },
    parameters,
    schemas,
    responses,
  },
};

export const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: "Cash Tracker API · Docs",
  swaggerOptions: {
    // Mantiene el token entre recargas de la página.
    persistAuthorization: true,
    docExpansion: "list",
    defaultModelsExpandDepth: 2,
    tagsSorter: "alpha",
  },
};
