// services/attendanceService.js  (Redis-disabled version)
const db = require('../models');
const { AttendanceLog } = db;
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
    const log = await AttendanceLog.create({
      tenantId,
      deviceSn: deviceSN,
      employeeCode,
      punchTime: new Date(punchTime),
      verifyMode,
      inOutStatus,
      source
    });

    logger.info(`✅ Attendance log saved | Device=${deviceSN} | Employee=${employeeCode} | Time=${punchTime}`);
    return log;

  } catch (error) {
    logger.error('❌ Error saving attendance log', error);
    throw error;
  }
};

module.exports = { processAttendancePush };