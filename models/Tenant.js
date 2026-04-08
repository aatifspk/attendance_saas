'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Tenant extends Model {
    static associate(models) {
      Tenant.hasMany(models.Device, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
      Tenant.hasMany(models.Employee, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
      Tenant.hasMany(models.AttendanceLog, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
      Tenant.hasMany(models.AttendanceRecord, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
      Tenant.hasMany(models.PayrollRun, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });
    }
  }

  Tenant.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    domain: { type: DataTypes.STRING(100), unique: true },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    subscriptionEnd: { type: DataTypes.DATE },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    timestamps: true,
    underscored: true
  });

  return Tenant;
};