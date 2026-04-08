const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { processAttendancePush } = require('../services/attendanceService');
const db = require('../models');
const { Device } = db;

router.use(express.text({ type: 'text/plain' }));

router.all('/iclock/cdata.aspx', async (req, res) => {
  const deviceSN = req.query.SN || req.query.sn || 'UNKNOWN';
  const table = req.query.table || 'ATTLOG';

  try {
    const device = await Device.findOne({ where: { deviceSn: deviceSN, isActive: true } });

    if (!device) {
      logger.warn(`Unknown device SN: ${deviceSN}`);
      return res.status(200).send('OK\n');
    }

    await device.update({ lastSeen: new Date(), status: 'online' });

    if (req.method === 'POST' && req.body && table === 'ATTLOG') {
      const logs = req.body.trim().split('\n').map(line => {
        const fields = line.trim().split('\t');
        return fields.length >= 2 ? {
          employeeCode: fields[0],
          punchTime: fields[1],
          verifyMode: fields[2] || '0',
          inOutStatus: fields[3] || '0'
        } : null;
      }).filter(Boolean);

      for (const log of logs) {
        await processAttendancePush({
          tenantId: device.tenantId,
          deviceSN,
          employeeCode: log.employeeCode,
          punchTime: log.punchTime,
          verifyMode: log.verifyMode,
          inOutStatus: log.inOutStatus,
          source: 'adms-direct-push'
        });
      }
    }

    res.set('Content-Type', 'text/plain');
    res.send('OK\n');
  } catch (err) {
    logger.error('ADMS Push Error', err);
    res.status(200).send('OK\n'); // Always ACK
  }
});

module.exports = router;