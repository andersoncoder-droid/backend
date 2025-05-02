// models/User.js
// Defines the User model for representing application users in the database.

import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

/**
 * User model - represents a user in the system.
 * Fields:
 *   - id: Primary key
 *   - name: User's full name
 *   - email: User's email (unique)
 *   - password: Hashed password
 *   - role: User role (admin or operator)
 *
 * Includes a hook to hash the password before creating a user and a method to compare passwords.
 */
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "operator"),
      defaultValue: "operator",
    },
  },
  {
    hooks: {
      // Hash password before creating a user
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

/**
 * Compares a plain text password with the user's hashed password.
 * @param {string} password - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default User;
