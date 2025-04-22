import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('well', 'motor', 'transformer'),
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Define relationships
Asset.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Asset, { foreignKey: 'createdBy', as: 'assets' });

export default Asset;
