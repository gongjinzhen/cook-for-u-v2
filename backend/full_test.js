const { fork } = require('child_process');
const http = require('http');
function api(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: '127.0.0.1', port: 3001, path, method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) { var d = JSON.stringify(body); opts.headers['Content-Length'] = Buffer.byteLength(d); }
    var req = http.request(opts, res => {
      var data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, body: data }); } });
    });
    req.on('error', e => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
async function test() {
  console.log('=== Starting server ===');
  var svr = fork('./server.js', [], { silent: true });
  await new Promise(function(ok) { svr.stdout.on('data', function(d) { var m = d.toString(); if (m.includes('Server on')) ok(); }); });
  console.log('Server ready!\n');
  
  var r = await api('POST', '/api/auth/login', { username: 'chef', password: '123456' });
  var t = r.body.token; console.log('1. Login chef:', r.status, 'token:', t ? 'OK' : 'FAIL');
  if (!t) { svr.kill(); return; }
  
  r = await api('POST', '/api/auth/login', { username: 'foodie', password: '123456' });
  var ft = r.body.token; console.log('2. Login foodie:', r.status, 'token:', ft ? 'OK' : 'FAIL');
  if (!ft) { svr.kill(); return; }
  
  r = await api('POST', '/api/recipes', { name: 'Tomato Egg Stir-fry', nutrition: 'light', ingredients: 'egg 3\ntomato 2\nsalt', steps: '1.Cut tomatoes\n2.Soften eggs\n3.Mix and cook' }, t);
  console.log('3. Create recipe:', r.status, JSON.stringify(r.body));
  var rid = r.body.id; if (typeof rid === 'number' && rid > 0) console.log('   ID:', rid); else { console.log('   ID is 0 - checking if insert worked...'); r = await api('GET', '/api/recipes', null, t); console.log('   Recipes:', Array.isArray(r.body) ? r.body.length + ' items' : JSON.stringify(r.body)); if (Array.isArray(r.body) && r.body.length > 0) rid = r.body[0].id; }
  
  console.log('\n4. Order & Rate flow');
  if (rid && typeof rid === 'number' && rid > 0) {
    r = await api('POST', '/api/orders', { recipe_id: rid }, ft); console.log('   Order:', r.status, r.body.message || JSON.stringify(r.body));
    r = await api('GET', '/api/orders?role=chef', null, t);
    var oid = Array.isArray(r.body) && r.body.length > 0 ? r.body[0].id : null;
    if (oid) {
      r = await api('PUT', '/api/orders/' + oid + '/status', { status: 'completed' }, t); console.log('   Complete:', r.status);
      r = await api('POST', '/api/ratings', { order_id: oid, recipe_id: rid, score: 5, comment: 'Delicious!' }, ft); console.log('   Rate:', r.status, r.body.message || JSON.stringify(r.body));
    }
  }
  
  console.log('\n5. Stats');
  r = await api('GET', '/api/ratings/stats', null, t);
  console.log('   ', r.status, JSON.stringify(r.body));
  
  console.log('\n=== DONE ===');
  svr.kill(); process.exit(0);
}
test().catch(function(e) { console.log('TEST FAILED:', e.message); process.exit(1); });
