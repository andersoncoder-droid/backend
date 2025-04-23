import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isRailway =
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL;

let sequelize;

if (isRailway) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
