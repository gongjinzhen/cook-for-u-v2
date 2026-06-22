const initSqlJs = require('sql.js'); initSqlJs().then(s => { console.log('SQL.JS OK'); process.exit(0); }).catch(e => { console.log('FAIL:', e.message); process.exit(1); });
