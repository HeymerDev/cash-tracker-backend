import express, { type Express } from "express";
import colors from "colors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { db } from "./config/db";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";

import budgetRouter from "./routes/budgetRouter";
import authRouter from "./routes/authRouter";

async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    console.log(colors.blue.bold("Database connected successfully"));
  } catch (error) {
    console.log(colors.red.bold("Error connecting to database:" + error));
  }
}

connectDB();

const app: Express = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/budgets", budgetRouter);
app.use("/api/auth", authRouter);

// Especificación OpenAPI cruda: útil para Postman, Insomnia o generadores de clientes.
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

// Documentación interactiva (Swagger UI).
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

app.get("/", (req, res) => {
  res.send("Welcome to the Cash Tracker API");
});

export default app;
