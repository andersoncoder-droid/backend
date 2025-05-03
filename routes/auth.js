// routes/auth.js
// Provides authentication endpoints for user registration and login.

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Función para crear usuarios básicos
async function createBasicUsers() {
  try {
    // Crear usuario administrador si no existe
    let admin = await User.findOne({ where: { email: "admin@decimetrix.com" } });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin123!", salt);
      await User.create({
        username: "Administrador",
        email: "admin@decimetrix.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Usuario administrador creado");
    }

    // Crear usuario operador si no existe
    let operator = await User.findOne({ where: { email: "operator@decimetrix.com" } });
    if (!operator) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Operator123!", salt);
      await User.create({
        username: "Operador",
        email: "operator@decimetrix.com",
        password: hashedPassword,
        role: "operator",
      });
      console.log("Usuario operador creado");
    }
  } catch (err) {
    console.error("Error al crear usuarios básicos:", err);
  }
}

// Llamar a la función para crear usuarios básicos
createBasicUsers();

/**
 * POST /api/auth/register
 * Register a new user. Returns a JWT token on success.
 * Public route.
 */
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with encrypted password
    user = await User.create({
      username,
      email,
      password: hashedPassword, // Use hashed password
      role: role || "operator", // Default to operator if no role provided
    });

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return a JWT token if credentials are valid.
 * Public route.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`Intento de login con email: ${email}`);

    // Buscar usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    console.log(`Usuario encontrado: ${user.email}, role: ${user.role}`);
    console.log(`Contraseña almacenada (hash): ${user.password}`);

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Resultado de comparación de contraseñas: ${isMatch}`);

    if (!isMatch) {
      console.log("Contraseña incorrecta");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Crear JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Firmar token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).send("❌ Server error");
  }
});

export default router;
