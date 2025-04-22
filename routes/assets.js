import express from 'express';
import Asset from '../models/Asset.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/assets
// @desc    Get all assets (filtered by user role)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    let assets;
    
    // If user is admin, get all assets
    if (req.user.role === 'admin') {
      assets = await Asset.findAll();
    } else {
      // If user is operator, get only their assets
      assets = await Asset.findAll({
        where: { createdBy: req.user.id }
      });
    }
    
    res.json(assets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/assets
// @desc    Create a new asset
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { name, type, latitude, longitude, comments } = req.body;

  try {
    const newAsset = await Asset.create({
      name,
      type,
      latitude,
      longitude,
      comments,
      createdBy: req.user.id
    });

    // Emit socket event for real-time update (we'll implement this later)
    req.app.get('io').emit('newAsset', newAsset);

    res.json(newAsset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/assets/:id
// @desc    Get asset by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ msg: 'Asset not found' });
    }

    // Check if user has permission to view this asset
    if (req.user.role !== 'admin' && asset.createdBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this asset' });
    }

    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/assets/:id
// @desc    Update an asset
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  const { name, type, latitude, longitude, comments } = req.body;

  try {
    let asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ msg: 'Asset not found' });
    }

    // Check if user has permission to update this asset
    if (req.user.role !== 'admin' && asset.createdBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this asset' });
    }

    // Update asset
    await asset.update({
      name: name || asset.name,
      type: type || asset.type,
      latitude: latitude || asset.latitude,
      longitude: longitude || asset.longitude,
      comments: comments || asset.comments
    });

    // Emit socket event for real-time update
    req.app.get('io').emit('updateAsset', asset);

    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/assets/:id
// @desc    Delete an asset
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ msg: 'Asset not found' });
    }

    // Check if user has permission to delete this asset
    if (req.user.role !== 'admin' && asset.createdBy !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this asset' });
    }

    await asset.destroy();

    // Emit socket event for real-time update
    req.app.get('io').emit('deleteAsset', req.params.id);

    res.json({ msg: 'Asset removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
