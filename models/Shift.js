'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Shift extends Model {
    static associate(models) {
      Shift.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
      Shift.hasMany(models.Employee, { foreignKey: 'default_shift_id' });
    }
  }

  Shift.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    shiftName: { type: DataTypes.STRING(50), allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    graceMinutes: { type: DataTypes.INTEGER, defaultValue: 15 },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Shift',
    tableName: 'shifts',
    timestamps: true,
    underscored: true
  });

  return Shift;
};