


// routes/adms.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { processAttendancePush } = require('../services/attendanceService');
const db = require('../models');
const { Device } = db;

// Custom raw body middleware (most reliable for ESSL devices with no Content-Type)
const rawBodyMiddleware = (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    return next();
  }

  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = Buffer.from(data);
    next();
  });
};

// Use raw middleware ONLY for this route
router.all('/iclock/cdata.aspx', rawBodyMiddleware, async (req, res) => {
  const deviceSN = req.query.SN || req.query.sn || 'UNKNOWN';
  const table = req.query.table || 'ATTLOG';

  console.log(`📥 ADMS Push | SN=${deviceSN} | Table=${table} | Method=${req.method}`);

  try {
    const device = await Device.findOne({
      where: { deviceSn: deviceSN, isActive: true }
    });

    if (!device) {
      logger.warn(`Unknown or inactive device SN: ${deviceSN}`);
      return res.status(200).send('OK\n');
    }

    await device.update({ lastSeen: new Date(), status: 'online' });

    if (req.method === 'POST' && req.rawBody && table === 'ATTLOG') {

      const bodyStr = req.rawBody.toString('utf8');

      if (!bodyStr.trim()) {
        console.log('⚠️ Empty raw body received');
        return res.status(200).send('OK\n');
      }

      // Parse standard ESSL/ZKTeco ATTLOG format
      const logs = bodyStr
        .trim()
        .split('\n')
        .map(line => {
          const fields = line.trim().split('\t');
          return fields.length >= 2 ? {
            employeeCode: fields[0]?.trim(),
            punchTime: fields[1]?.trim(),
            verifyMode: fields[2] || '0',
            inOutStatus: fields[3] || '0'
          } : null;
        })
        .filter(Boolean);

      console.log(`✅ Parsed ${logs.length} punch(es) from SilkBio-101TC (SN: ${deviceSN})`);

      for (const log of logs) {
        console.log("✅ Log received:", log);
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
    logger.error('ADMS Push Error', { deviceSN, error: err.message, stack: err.stack });
    res.status(200).send('OK\n');
  }
});

module.exports = router;