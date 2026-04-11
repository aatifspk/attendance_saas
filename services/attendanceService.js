// services/attendanceService.js  (Redis-disabled version)
const db = require('../models');
const { AttendanceLog } = db;
const { Employee } = db;
const { Device } = db;
const logger = require('../utils/logger');

const processAttendancePush = async (payload) => {
  const { 
    tenantId, 
    deviceSN, 
    employeeCode, 
    punchTime, 
    verifyMode, 
    inOutStatus, 
    source = 'adms-direct-push' 
  } = payload;

  try {

    const currentEmp = await Employee.findOne({where: {employeeCode: employeeCode }});
    const currentDevice = await Device.findOne({where: {deviceSn: deviceSN }});

    const log = await AttendanceLog.create({
      tenantId,
      deviceSn: deviceSN,
      deviceId: currentDevice.dataValues.id,
      employeeCode,
      employeeId: currentEmp.dataValues.id,
      punchTime: new Date(punchTime),
      verifyMode,
      inOutStatus,
      source
    });

    logger.info(`✅ Attendance log saved | Device=${deviceSN} | Employee=${employeeCode} | name=${currentEmp.dataValues.fullName} | Time=${punchTime}`);
    return log;

  } catch (error) {
    logger.error('❌ Error saving attendance log', error);
    throw error;
  }
};

module.exports = { processAttendancePush };