const base = 'http://localhost:3001/api';

async function test() {
  // 1. Login as chef
  let r = await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'chef',password:'123456'})});
  let d = await r.json();
  console.log('1. Login chef:', d.user.nickname || d.user.username, '- role:', d.user.role);
  const chefToken = d.token;

  // 2. Login as foodie
  r = await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'foodie',password:'123456'})});
  d = await r.json();
  console.log('2. Login foodie:', d.user.nickname || d.user.username, '- role:', d.user.role);
  const foodieToken = d.token;

  // 3. List recipes (should be empty or have existing data)
  r = await fetch(base+'/recipes',{headers:{'Authorization':'Bearer '+chefToken}});
  d = await r.json();
  console.log('3. Recipes count:', d.length);

  // 4. Add recipe 1
  r = await fetch(base+'/recipes',{method:'POST',headers:{'Authorization':'Bearer '+chefToken,'Content-Type':'application/json'},body:JSON.stringify({name:'番茄炒蛋',tags:'家常菜,快手菜',nutrition:'热量:150大卡,蛋白质:10g',ingredients:'番茄2个,鸡蛋3个,盐适量,糖少许',steps:'1.番茄切块\n2.鸡蛋打散\n3.先炒鸡蛋\n4.加入番茄翻炒\n5.调味出锅',is_signature:true})});
  d = await r.json();
  console.log('4. Add recipe 1:', d.message, '- id:', d.id);

  // 5. Add recipe 2
  r = await fetch(base+'/recipes',{method:'POST',headers:{'Authorization':'Bearer '+chefToken,'Content-Type':'application/json'},body:JSON.stringify({name:'红烧肉',tags:'大菜,肉菜',nutrition:'热量:350大卡,蛋白质:20g',ingredients:'五花肉500g,酱油,冰糖,八角,桂皮',steps:'1.五花肉切块焯水\n2.炒糖色\n3.加调料炖煮1小时',is_signature:true})});
  d = await r.json();
  console.log('5. Add recipe 2:', d.message, '- id:', d.id);

  // 6. List all recipes
  r = await fetch(base+'/recipes',{headers:{'Authorization':'Bearer '+foodieToken}});
  d = await r.json();
  console.log('6. List recipes:', d.length, 'items');
  d.forEach((rec,i) => console.log('   ['+(i+1)+']', rec.name, '- 评分:', rec.avg_score, '- 订单数:', rec.order_count));

  // 7. Get recipe detail
  r = await fetch(base+'/recipes/1',{headers:{'Authorization':'Bearer '+foodieToken}});
  d = await r.json();
  console.log('7. Recipe detail:', d.name, '- tags:', d.tags);

  // 8. Foodie orders dish 1
  r = await fetch(base+'/orders',{method:'POST',headers:{'Authorization':'Bearer '+foodieToken,'Content-Type':'application/json'},body:JSON.stringify({recipe_id:1,note:'少放盐'})});
  d = await r.json();
  console.log('8. Order dish 1:', d.message);

  // 9. Chef completes order
  r = await fetch(base+'/orders/1/status',{method:'PUT',headers:{'Authorization':'Bearer '+chefToken,'Content-Type':'application/json'},body:JSON.stringify({status:'completed'})});
  d = await r.json();
  console.log('9. Complete order:', d.success ? 'OK' : 'FAILED');

  // 10. Foodie rates the dish
  r = await fetch(base+'/ratings',{method:'POST',headers:{'Authorization':'Bearer '+foodieToken,'Content-Type':'application/json'},body:JSON.stringify({order_id:1,recipe_id:1,score:5,comment:'超级好吃！'})});
  d = await r.json();
  console.log('10. Rate dish:', d.message || d.error);

  // 11. Check stats
  r = await fetch(base+'/ratings/stats',{headers:{'Authorization':'Bearer '+chefToken}});
  d = await r.json();
  console.log('11. Stats: avg='+d.avg_score+', total='+d.total_ratings);
  d.top.forEach((rec,i) => console.log('    Top '+(i+1)+':', rec.name, rec.avg_score+'分', rec.count+'个评价'));

  // 12. Chef views orders
  r = await fetch(base+'/orders?role=chef',{headers:{'Authorization':'Bearer '+chefToken}});
  d = await r.json();
  console.log('12. Chef orders:', d.length, 'orders');
  d.forEach((o,i) => console.log('    ['+(i+1)+']', o.recipe_name, '-', o.status, '- by', o.orderer_name));

  // 13. Foodie views orders
  r = await fetch(base+'/orders',{headers:{'Authorization':'Bearer '+foodieToken}});
  d = await r.json();
  console.log('13. Foodie orders:', d.length, 'orders');

  // 14. Unauthorized access test
  r = await fetch(base+'/orders',{headers:{'Authorization':'Bearer invalid_token'}});
  console.log('14. Auth guard:', r.status === 401 ? 'PASS (got 401)' : 'FAIL (got '+r.status+')');

  console.log('\n=== All API tests completed! ===');
}
test().catch(e => console.log('Error:', e));
