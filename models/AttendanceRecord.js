'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AttendanceRecord extends Model {
    static associate(models) {
      AttendanceRecord.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
      AttendanceRecord.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    }
  }

  AttendanceRecord.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    employeeId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    firstIn: { type: DataTypes.DATE },
    lastOut: { type: DataTypes.DATE },
    totalHours: { type: DataTypes.DECIMAL(5,2) },
    status: { type: DataTypes.ENUM('present', 'absent', 'half-day', 'late', 'early-departure') },
    lateMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    overtimeMinutes: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'AttendanceRecord',
    tableName: 'attendance_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['tenant_id', 'employee_id', 'date'] }
    ]
  });

  return AttendanceRecord;
};