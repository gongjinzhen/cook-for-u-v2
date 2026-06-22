import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext, ToastContext } from '../App';
import { login } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const showToast = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return showToast('请填写完整信息', 'error');
    setLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      showToast('登录成功，' + res.data.user.nickname + '！');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.error || '登录失败', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24 }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>🍳</div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>给你做顿饭</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 14 }}>专属于你们的私房菜谱</p>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        <div className="form-group">
          <label>用户名</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="输入用户名" />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入密码" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-light)' }}>
          默认账号: chef / foodie &nbsp; 密码: 123456
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--text-light)' }}>
          没有账号？<Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>去注册</Link>
        </p>
      </form>
    </div>
  );
}
