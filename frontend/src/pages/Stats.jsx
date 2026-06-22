import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { getRecipes, getOrders, getRatingStats } from '../api';
import { Star, Trophy, Utensils, Heart } from 'lucide-react';

export default function Stats() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ recipes: 0, orders: 0, avgScore: 0, topRecipes: [] });
  const [loading, setLoading] = useState(true);
  const isChef = user?.role === 'chef';
  const isFoodie = user?.role === 'foodie';

  useEffect(() => {
    Promise.all([
      getRecipes(),
      getOrders(isChef ? 'chef' : ''),
      getRatingStats().catch(() => ({ data: { total_ratings: 0, avg_score: 0, top: [] } }))
    ]).then(([r, o, s]) => {
      setStats({
        recipes: r.data.length,
        orders: o.data.length,
        completedOrders: o.data.filter(x => x.status === 'completed').length,
        avgScore: Number(s.data.avg_score || 0),
        totalRatings: s.data.total_ratings || 0,
        topRecipes: s.data.top || []
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-light)' }}>加载中...</p>;

  return (
    <div>
      <h1>📊 数据统计</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Utensils size={28} style={{ color: 'var(--primary)', marginBottom: 6 }} />
          <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.recipes}</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{isChef ? '我的菜谱' : '全部菜谱'}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Heart size={28} style={{ color: 'var(--secondary)', marginBottom: 6 }} />
          <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.orders}</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{isChef ? '被点次数' : '点菜次数'}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Star size={28} style={{ color: '#f1c40f', marginBottom: 6 }} />
          <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.avgScore}</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)' }}>平均评分</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <Trophy size={28} style={{ color: '#27ae60', marginBottom: 6 }} />
          <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.completedOrders || 0}</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)' }}>已做</p>
        </div>
      </div>

      {stats.topRecipes.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>🏆 最受欢迎</h2>
          {stats.topRecipes.map((r, i) => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/recipes/' + r.id)}>
              <span style={{ fontSize: 20, fontWeight: 700, color: ['#e74c3c','#e67e22','#f1c40f'][i] || 'var(--text-light)', width: 30, textAlign: 'center' }}{...{}}>{['🥇','🥈','🥉'][i] || '#' + (i + 1)}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-light)' }}>⭐ {r.avg_score} · {r.count} 次评价</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.recipes === 0 && (
        <div className="empty-state">
          <div className="icon">📊</div>
          <p>还没有数据，快去上传菜谱吧！</p>
        </div>
      )}
    </div>
  );
}
