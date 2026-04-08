'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AttendanceLog extends Model {
    static associate(models) {
      AttendanceLog.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
      AttendanceLog.belongsTo(models.Device, { foreignKey: 'device_id' });
      AttendanceLog.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    }
  }

  AttendanceLog.init({
    id: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    tenantId: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      allowNull: false 
    },
    deviceId: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      allowNull: true 
    },
    employeeId: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      allowNull: true 
    },
    deviceSn: { 
      type: DataTypes.STRING(64), 
      allowNull: true,
      comment: 'ESSL Device Serial Number'
    },
    employeeCode: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    punchTime: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    verifyMode: { 
      type: DataTypes.STRING(20) 
    },
    inOutStatus: { 
      type: DataTypes.STRING(10) 
    },
    source: { 
      type: DataTypes.ENUM('adms-direct-push', 'gateway', 'historical'), 
      defaultValue: 'adms-direct-push' 
    }
  }, {
    sequelize,
    modelName: 'AttendanceLog',
    tableName: 'attendance_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { 
        unique: true, 
        fields: ['device_sn', 'employee_code', 'punch_time']   // This was causing the error
      },
      { fields: ['tenant_id', 'punch_time'] }
    ]
  });

  return AttendanceLog;
};