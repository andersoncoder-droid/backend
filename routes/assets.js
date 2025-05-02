// routes/assets.js
// Provides API endpoints for managing assets (CRUD operations).
// Includes real-time updates via Socket.io events.

import express from "express";
import Asset from "../models/Asset.js";
import { verifyToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/assets
 * Get all assets. Admins get all, operators get only their own.
 * Protected route.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    let assets;

    // If user is admin, get all assets
    if (req.user.role === "admin") {
      assets = await Asset.findAll();
    } else {
      // If user is operator, get only their assets
      assets = await Asset.findAll({
        where: { createdBy: req.user.id },
      });
    }

    res.json(assets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * POST /api/assets
 * Create a new asset. Emits a real-time event on creation.
 * Protected route.
 */
router.post("/", verifyToken, async (req, res) => {
  const { name, type, latitude, longitude, comments } = req.body;

  try {
    const newAsset = await Asset.create({
      name,
      type,
      latitude,
      longitude,
      comments,
      createdBy: req.user.id,
    });

    // Emit socket event for real-time update (we'll implement this later)
    req.app.get("io").emit("newAsset", newAsset);

    res.json(newAsset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * GET /api/assets/:id
 * Get asset by ID. Only accessible by owner or admin.
 * Protected route.
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    // Check if user has permission to view this asset
    if (req.user.role !== "admin" && asset.createdBy !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to view this asset" });
    }

    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * PUT /api/assets/:id
 * Update an asset. Only accessible by owner or admin. Emits a real-time event on update.
 * Protected route.
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { name, type, latitude, longitude, comments } = req.body;

  try {
    let asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    // Check if user has permission to update this asset
    if (req.user.role !== "admin" && asset.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this asset" });
    }

    // Update asset
    await asset.update({
      name: name || asset.name,
      type: type || asset.type,
      latitude: latitude || asset.latitude,
      longitude: longitude || asset.longitude,
      comments: comments || asset.comments,
    });

    // Emit socket event for real-time update
    req.app.get("io").emit("updateAsset", asset);

    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * DELETE /api/assets/:id
 * Delete an asset. Only accessible by owner or admin. Emits a real-time event on deletion.
 * Protected route.
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);

    if (!asset) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    // Check if user has permission to delete this asset
    if (req.user.role !== "admin" && asset.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this asset" });
    }

    await asset.destroy();

    // Emit socket event for real-time update
    req.app.get("io").emit("deleteAsset", req.params.id);

    res.json({ msg: "Asset removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
