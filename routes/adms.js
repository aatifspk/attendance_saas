// // const express = require('express');
// // const router = express.Router();
// // const logger = require('../utils/logger');
// // const { processAttendancePush } = require('../services/attendanceService');
// // const db = require('../models');
// // const { Device } = db;

// // router.use(express.text({ type: 'text/plain' }));

// // router.all('/iclock/cdata.aspx', async (req, res) => {
// //   const deviceSN = req.query.SN || req.query.sn || 'UNKNOWN';
// //   const table = req.query.table || 'ATTLOG';

// //   console.log("deviceSN", deviceSN);
// //   console.log("table", table);


// //   try {
// //     const device = await Device.findOne({ where: { deviceSn: deviceSN, isActive: true } });

// //     if (!device) {
// //       logger.warn(`Unknown device SN: ${deviceSN}`);
// //       return res.status(200).send('OK\n');
// //     }

// //     await device.update({ lastSeen: new Date(), status: 'online' });

// //     if (req.method === 'POST' && req.body && table === 'ATTLOG') {
// //       const logs = req.body.trim().split('\n').map(line => {
// //         const fields = line.trim().split('\t');
// //         return fields.length >= 2 ? {
// //           employeeCode: fields[0],
// //           punchTime: fields[1],
// //           verifyMode: fields[2] || '0',
// //           inOutStatus: fields[3] || '0'
// //         } : null;
// //       }).filter(Boolean);

// //       for (const log of logs) {

// //         console.log("log", log);

// //         await processAttendancePush({
// //           tenantId: device.tenantId,
// //           deviceSN,
// //           employeeCode: log.employeeCode,
// //           punchTime: log.punchTime,
// //           verifyMode: log.verifyMode,
// //           inOutStatus: log.inOutStatus,
// //           source: 'adms-direct-push'
// //         });
// //       }
// //     }

// //     res.set('Content-Type', 'text/plain');
// //     res.send('OK\n');
// //   } catch (err) {
// //     logger.error('ADMS Push Error', err);
// //     res.status(200).send('OK\n'); // Always ACK
// //   }
// // });

// // module.exports = router;



// // routes/adms.js
// const express = require('express');
// const router = express.Router();
// const logger = require('../utils/logger');
// const { processAttendancePush } = require('../services/attendanceService');
// const db = require('../models');
// const { Device } = db;

// // ✅ MOST RELIABLE FOR ESSL/ZKTeco (SilkBio-101TC)
// router.use(express.raw({ type: '*/*' }));   // catches ALL content-types

// router.all('/iclock/cdata.aspx', async (req, res) => {
//   const deviceSN = req.query.SN || req.query.sn || 'UNKNOWN';
//   const table = req.query.table || 'ATTLOG';

//   console.log("req.body", req.body);
  

//   // Debug logs (you can remove after testing)
//   console.log(`📥 ADMS Push | SN=${deviceSN} | Table=${table} | Method=${req.method}`);
//   console.log(`Content-Type: ${req.headers['content-type']}`);
//   console.log(`Body received as: ${Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body}`);

//   try {
//     // 1. Find active device
//     const device = await Device.findOne({
//       where: { deviceSn: deviceSN, isActive: true }
//     });

//     if (!device) {
//       logger.warn(`Unknown or inactive device SN: ${deviceSN}`);
//       return res.status(200).send('OK\n'); // Always acknowledge
//     }

//     // 2. Update last seen status
//      const a =  await device.update({ lastSeen: new Date(), status: 'online' });

//     // 3. Process attendance logs (POST + ATTLOG)
//     if (req.method === 'POST' && req.body && table === 'ATTLOG') {

//       // 🔥 SAFE BUFFER → STRING CONVERSION (this fixes your error)
//       let bodyStr = '';
//       if (Buffer.isBuffer(req.body)) {
//         bodyStr = req.body.toString('utf8');
//       } else if (typeof req.body === 'string') {
//         bodyStr = req.body;
//       }

//       if (!bodyStr.trim()) {
//         console.log('⚠️ Empty body received from device');
//         return res.status(200).send('OK\n');
//       }

//       // Parse the tab-separated ATTLOG format (standard for SilkBio)
//       const logs = bodyStr
//         .trim()
//         .split('\n')
//         .map(line => {
//           const fields = line.trim().split('\t');
//           return fields.length >= 2 ? {
//             employeeCode: fields[0]?.trim(),
//             punchTime: fields[1]?.trim(),
//             verifyMode: fields[2] || '0',
//             inOutStatus: fields[3] || '0'
//           } : null;
//         })
//         .filter(Boolean);

//       console.log(`✅ Parsed ${logs.length} punch(es) from SilkBio-101TC (SN: ${deviceSN})`);

//       for (const log of logs) {
//         console.log("log", log);

//         await processAttendancePush({
//           tenantId: device.tenantId,
//           deviceSN,
//           employeeCode: log.employeeCode,
//           punchTime: log.punchTime,
//           verifyMode: log.verifyMode,
//           inOutStatus: log.inOutStatus,
//           source: 'adms-direct-push'
//         });
//       }
//     }

//     // 4. Always respond with OK (device requirement)
//     res.set('Content-Type', 'text/plain');
//     res.send('OK\n');

//   } catch (err) {
//     logger.error('ADMS Push Error', {
//       deviceSN,
//       error: err.message,
//       stack: err.stack
//     });
//     res.status(200).send('OK\n'); // Never break device connection
//   }
// });

// module.exports = router;



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