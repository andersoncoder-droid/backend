// config/db.js
// Configures and exports the Sequelize instance for connecting to the PostgreSQL database.
// Supports both Railway and local environments.

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Determine if running on Railway or local environment
const isRailway =
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL;

let sequelize;

// Create Sequelize instance based on environment variables
if (isRailway) {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    });
  } else {
    sequelize = new Sequelize({
      dialect: "postgres",
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    });
  }
  console.log("Using Railway PostgreSQL configuration");
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      dialectOptions: {
        ssl:
          process.env.DB_SSL === "true"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
      logging: false,
    }
  );
  console.log("Using local PostgreSQL configuration");
}

export default sequelize;
