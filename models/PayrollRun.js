'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PayrollRun extends Model {
    static associate(models) {
      PayrollRun.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
    }
  }

  PayrollRun.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    month: { type: DataTypes.DATEONLY, allowNull: false }, // YYYY-MM-01
    status: { type: DataTypes.ENUM('pending', 'processed', 'paid'), defaultValue: 'pending' },
    totalEmployees: { type: DataTypes.INTEGER },
    totalSalary: { type: DataTypes.DECIMAL(15,2) },
    processedAt: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'PayrollRun',
    tableName: 'payroll_runs',
    timestamps: true,
    underscored: true
  });

  return PayrollRun;
};