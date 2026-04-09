'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
    }
  }

  Device.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'tenants', key: 'id' } },
    deviceSn: { type: DataTypes.STRING(64), allowNull: false, unique: true, comment: 'ESSL/ZKTeco Serial Number' },
    deviceName: { type: DataTypes.STRING(100) },
    model: { type: DataTypes.STRING(50), defaultValue: 'SilkBio-101TC' },
    location: { type: DataTypes.STRING(150) },
    lastSeen: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('online', 'offline', 'error'), defaultValue: 'offline' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

    
  }, {
    sequelize,
    modelName: 'Device',
    tableName: 'devices',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['device_sn'] }]
  });

  return Device;
};