const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const DB_PATH = path.join(__dirname, 'cook.db');
let db = null;

function save() { if (db) fs.writeFileSync(DB_PATH, Buffer.from(db.export())); }

function getTableName(sql) {
  var m = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  return m ? m[1] : null;
}

function getLastId(table) {
  if (!table) return 0;
  var r = db.exec('SELECT MAX(id) as id FROM ' + table);
  return r && r[0] && r[0].values ? Number(r[0].values[0][0]) : 0;
}

var dbModule = {
  prepare: function(sql) {
    var stmt = db.prepare(sql);
    return {
      run: function() {
        var params = Array.prototype.slice.call(arguments);
        stmt.bind(params);
        stmt.step();
        stmt.reset();
        save();
        return { lastInsertRowid: getLastId(getTableName(sql)) };
      },
      get: function() {
        var params = Array.prototype.slice.call(arguments);
        stmt.bind(params);
        if (stmt.step()) {
          var cols = stmt.getColumnNames(), vals = stmt.get(), obj = {};
          cols.forEach(function(c,i) { obj[c]=vals[i]; });
          stmt.reset(); return obj;
        }
        stmt.reset(); return null;
      },
      all: function() {
        var params = Array.prototype.slice.call(arguments);
        stmt.bind(params);
        var results = [];
        while (stmt.step()) {
          var cols = stmt.getColumnNames(), vals = stmt.get(), obj = {};
          cols.forEach(function(c,i) { obj[c]=vals[i]; });
          results.push(obj);
        }
        stmt.reset(); return results;
      }
    };
  },
  exec: function(sql) { return db.exec(sql); }
};

async function initDB() {
  var SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) { db = new SQL.Database(fs.readFileSync(DB_PATH)); }
  else { db = new SQL.Database(); }
  
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, nickname TEXT DEFAULT "", avatar TEXT DEFAULT "", role TEXT DEFAULT "chef", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS recipes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, cover TEXT DEFAULT "", tags TEXT DEFAULT "", nutrition TEXT DEFAULT "", ingredients TEXT DEFAULT "", steps TEXT DEFAULT "", is_signature INTEGER DEFAULT 0, status TEXT DEFAULT "active", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, recipe_id INTEGER, orderer_id INTEGER, chef_id INTEGER, status TEXT DEFAULT "pending", note TEXT DEFAULT "", created_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME)');
  db.run('CREATE TABLE IF NOT EXISTS ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER UNIQUE, recipe_id INTEGER, score INTEGER, comment TEXT DEFAULT "", created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  
  var cnt = db.exec('SELECT COUNT(*) as c FROM users');
  if (!cnt.length || !cnt[0].values[0][0]) {
    var h = bcrypt.hashSync('123456', 10);
    var s1 = db.prepare('INSERT INTO users (username,password,nickname,role) VALUES(?,?,?,?)');
    s1.bind(['chef', h, '\u5927\u53a8', 'chef']); s1.step(); s1.reset();
    var s2 = db.prepare('INSERT INTO users (username,password,nickname,role) VALUES(?,?,?,?)');
    s2.bind(['foodie', h, '\u5403\u8d27', 'foodie']); s2.step(); s2.reset();
    save();
    console.log('Users created');
  }
  save();
  console.log('DB ready');
}
module.exports = { ...dbModule, initDB };
