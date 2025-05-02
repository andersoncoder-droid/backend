// models/Asset.js
// Defines the Asset model for representing assets (well, motor, transformer) in the database.

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

/**
 * Asset model - represents a physical asset in the system.
 * Fields:
 *   - id: Primary key
 *   - name: Asset name
 *   - type: Asset type (well, motor, transformer)
 *   - latitude: Latitude coordinate
 *   - longitude: Longitude coordinate
 *   - comments: Optional comments
 *   - createdBy: User ID who created the asset
 */
const Asset = sequelize.define("Asset", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("well", "motor", "transformer"),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  comments: {
    type: DataTypes.TEXT,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
});

// Define relationships between Asset and User
Asset.belongsTo(User, { foreignKey: "createdBy", as: "creator" }); // Each asset is created by a user
User.hasMany(Asset, { foreignKey: "createdBy", as: "assets" }); // A user can create many assets

export default Asset;
