import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../App';
import { createRecipe } from '../api';
import { ImagePlus, ChefHat } from 'lucide-react';

export default function AddRecipe() {
  const showToast = useContext(ToastContext);
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ name: '', nutrition: '', tags: '', calories: '', cook_time: '', flavor: '', ingredients: '', steps: '' });
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setCover(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    if (!form.name) return showToast('请输入菜名', 'error');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('nutrition', form.nutrition);
      fd.append('tags', form.tags);
      fd.append('ingredients', form.ingredients);
      fd.append('steps', form.steps);
      fd.append('calories', form.calories);
      fd.append('cook_time', form.cook_time);
      fd.append('flavor', form.flavor);
      if (cover) fd.append('cover', cover);
      const res = await createRecipe(fd);
      showToast('添加成功！');
      navigate('/recipes/' + res.data.id);
    } catch (err) { showToast('添加失败', 'error'); } finally { setLoading(false); }
  };

  return (
    <div>
      <h1>🍳 上传新菜</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }} onClick={() => fileRef.current.click()} />
          ) : (
            <div style={{ width: '100%', height: 180, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => fileRef.current.click()}>
              <ImagePlus size={36} />
              <p style={{ fontSize: 14, marginTop: 6 }}>点击上传封面图</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div className="form-group">
          <label>菜名 *</label>
          <input className="input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="比如：番茄炒蛋" />
        </div>
        <div className="form-group">
          <label>营养标签</label>
          <select className="input" value={form.nutrition} onChange={e => handleChange('nutrition', e.target.value)}>
            <option value="">不选择</option>
            <option value="light">清淡</option><option value="heavy">重口味</option><option value="protein">高蛋白</option>
            <option value="lowcal">低卡</option><option value="soup">汤类</option><option value="quick">快手菜</option>
          </select>
        </div>
        <div className="form-group">
          <label>热量（千卡）</label>
          <input className="input" type="number" value={form.calories} onChange={e => handleChange('calories', e.target.value)} placeholder="例如：250" min="0" />
        </div>
        <div className="form-group">
          <label>做菜总时间</label>
          <input className="input" value={form.cook_time} onChange={e => handleChange('cook_time', e.target.value)} placeholder="例如：30分钟" />
        </div>
        <div className="form-group">
          <label>口味</label>
          <input className="input" value={form.flavor} onChange={e => handleChange('flavor', e.target.value)} placeholder="例如：酸甜、麻辣、清淡" />
        </div>
        <div className="form-group">
          <label>食材清单 (每行一种)</label>
          <textarea className="input" value={form.ingredients} onChange={e => handleChange('ingredients', e.target.value)} placeholder="鸡蛋 3个&#10;番茄 2个&#10;盐 适量" style={{ minHeight: 100 }} />
        </div>
        <div className="form-group">
          <label>烹饪步骤 (每行一步)</label>
          <textarea className="input" value={form.steps} onChange={e => handleChange('steps', e.target.value)} placeholder="1. 番茄切块&#10;2. 鸡蛋打散&#10;3. 炒熟出锅" style={{ minHeight: 120 }} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
          <ChefHat size={18} /> {loading ? '上传中...' : '发布菜谱'}
        </button>
      </div>
    </div>
  );
}
