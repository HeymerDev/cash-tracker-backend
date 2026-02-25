import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import path from "path";

dotenv.config();

export const db = new Sequelize(process.env.DATABASE_URL, {
  models: [path.join(__dirname, "..", "models")],
  dialectOptions: {
    ssl: {
      require: false,
    },
  },
});
