import express, { type Express } from "express";
import colors from "colors";
import morgan from "morgan";

import { db } from "./config/db";

import budgetRouter from "./routes/budgetRouter";

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

app.use("/api/budget", budgetRouter);

export default app;
