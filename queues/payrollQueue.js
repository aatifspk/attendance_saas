const { Queue, Worker } = require('bullmq');
const redis = new (require('ioredis'))(process.env.REDIS_URL);
const db = require('../models');
const { AttendanceRecord } = db;

const payrollQueue = new Queue('payroll', { connection: redis });

const worker = new Worker('payroll', async (job) => {
  const { tenantId, employeeCode, punchTime } = job.data;
  const date = new Date(punchTime).toISOString().split('T')[0];

  // Simple logic: create/update daily record (expand as per your rules)
  await AttendanceRecord.upsert({
    tenantId,
    employeeCode,
    date,
    status: 'present',
    // Add totalHours, lateMinutes etc. calculation here
  });
}, { connection: redis });

worker.on('completed', job => console.log(`✅ Payroll job completed: ${job.id}`));
worker.on('failed', (job, err) => console.error(`❌ Payroll job failed: ${job.id}`, err));

module.exports = payrollQueue;