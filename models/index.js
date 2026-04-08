'use strict';
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = sequelize.Sequelize;

module.exports = db;



// 'use strict';
// const fs = require('fs');
// const path = require('path');
// const sequelize = require('../config/database');
// const db = {};

// fs.readdirSync(__dirname)
//   .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js')
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) db[modelName].associate(db);
// });

// db.sequelize = sequelize;
// db.Sequelize = sequelize.Sequelize;

// // =============================================
// // ALTER TABLE LOGIC (Safe Version - NO top-level await)
// // =============================================

// async function alterDatabase() {
//   console.log('🔧 Starting database schema alteration...');

//   const queryInterface = sequelize.getQueryInterface();

//   try {
//     const tables = ['tenants', 'devices', 'employees', 'attendance_logs', 'attendance_records', 'shifts', 'payroll_runs'];

//     for (const table of tables) {
//       console.log(`📌 Processing table: ${table}`);

//       // Add created_at if missing
//       await queryInterface.addColumn(table, 'created_at', {
//         type: sequelize.Sequelize.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
//       }).catch(() => console.log(`   ✅ created_at already exists in ${table}`));

//       // Add updated_at if missing
//       await queryInterface.addColumn(table, 'updated_at', {
//         type: sequelize.Sequelize.DATE,
//         allowNull: false,
//         defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
//       }).catch(() => console.log(`   ✅ updated_at already exists in ${table}`));

//       // Make updated_at auto-update on every change
//       await sequelize.query(`
//         ALTER TABLE ${table}
//         MODIFY updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       `).catch(() => {});
//     }

//     // Fix device_sn column in attendance_logs
//     await queryInterface.addColumn('attendance_logs', 'device_sn', {
//       type: sequelize.Sequelize.STRING(64),
//       allowNull: true
//     }).catch(() => console.log('   ✅ device_sn already exists'));

//     console.log('✅ All tables altered successfully!');

//   } catch (error) {
//     console.error('❌ Error while altering tables:', error.message);
//   }
// }

// // ==================== HOW TO RUN ALTER ====================
// // 1. Uncomment the line below → Save → Run `npm run dev` once
// // 2. After you see "All tables altered successfully!" in console,
// //    comment the line again and restart the server.

// // await alterDatabase();     // ←←← UNCOMMENT ONLY WHEN YOU WANT TO ALTER

// module.exports = db;