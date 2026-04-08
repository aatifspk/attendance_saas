'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Employee extends Model {
    static associate(models) {
      Employee.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
      Employee.hasMany(models.AttendanceRecord, { foreignKey: 'employee_id' });
    }
  }

  Employee.init({
    id: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    tenantId: { 
      type: DataTypes.BIGINT.UNSIGNED, 
      allowNull: false 
    },
    employeeCode: { 
      type: DataTypes.STRING(50), 
      allowNull: false, 
      comment: 'PIN / Employee Code used in device' 
    },
    fullName: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING(100) 
    },
    department: { 
      type: DataTypes.STRING(50) 
    },
    designation: { 
      type: DataTypes.STRING(50) 
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    joinDate: { 
      type: DataTypes.DATEONLY 
    },

    // ✅ Auto-managed timestamps (explicitly defined)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true,          // Sequelize will automatically update these fields
    underscored: true,         // DB columns will be created_at and updated_at
    indexes: [
      { unique: true, fields: ['tenant_id', 'employee_code'] }
    ]
  });

  return Employee;
};