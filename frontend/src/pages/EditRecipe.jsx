import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../App';
import { getRecipe, updateRecipe } from '../api';
import { ChefHat } from 'lucide-react';

export default function EditRecipe() {
  const { id } = useParams();
  const showToast = useContext(ToastContext);
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ name: '', nutrition: '', tags: '', calories: '', cook_time: '', flavor: '', ingredients: '', steps: '' });
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRecipe(id).then(r => {
      const d = r.data;
      setForm({ name: d.name, nutrition: d.nutrition || '', tags: d.tags || '', calories: d.calories || '', cook_time: d.cook_time || '', flavor: d.flavor || '', ingredients: d.ingredients || '', steps: d.steps || '' });
      setPreview(d.cover || '');
      setLoading(false);
    }).catch(() => { showToast('加载失败', 'error'); navigate('/recipes'); });
  }, [id]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setCover(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    if (!form.name) return showToast('请输入菜名', 'error');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('nutrition', form.nutrition); fd.append('tags', form.tags);
      fd.append('ingredients', form.ingredients); fd.append('steps', form.steps);
      fd.append('calories', form.calories);
      fd.append('cook_time', form.cook_time);
      fd.append('flavor', form.flavor);
      if (cover) fd.append('cover', cover);
      await updateRecipe(id, fd);
      showToast('更新成功！');
      navigate('/recipes/' + id);
    } catch (err) { showToast('更新失败', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <p>加载中...</p>;

  return (
    <div>
      <h1>✏️ 编辑菜谱</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {preview ? (
            <img src={preview} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }} onClick={() => fileRef.current.click()} />
          ) : (
            <div style={{ width: '100%', height: 180, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => fileRef.current.click()}>点击上传封面</div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <div className="form-group"><label>菜名</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="form-group">
          <label>营养标签</label>
          <select className="input" value={form.nutrition} onChange={e => setForm(f => ({ ...f, nutrition: e.target.value }))}>
            <option value="">不选择</option>
            <option value="light">清淡</option><option value="heavy">重口味</option><option value="protein">高蛋白</option>
            <option value="lowcal">低卡</option><option value="soup">汤类</option><option value="quick">快手菜</option>
          </select>
        </div>
        <div className="form-group">
          <label>热量（千卡）</label>
          <input className="input" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="例如：250" min="0" />
        </div>
        <div className="form-group">
          <label>做菜总时间</label>
          <input className="input" value={form.cook_time} onChange={e => setForm(f => ({ ...f, cook_time: e.target.value }))} placeholder="例如：30分钟" />
        </div>
        <div className="form-group">
          <label>口味</label>
          <input className="input" value={form.flavor} onChange={e => setForm(f => ({ ...f, flavor: e.target.value }))} placeholder="例如：酸甜、麻辣、清淡" />
        </div>
        <div className="form-group"><label>食材清单</label><textarea className="input" value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} style={{ minHeight: 100 }} /></div>
        <div className="form-group"><label>烹饪步骤</label><textarea className="input" value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} style={{ minHeight: 120 }} /></div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={saving}>
          <ChefHat size={18} /> {saving ? '保存中...' : '保存修改'}
        </button>
      </div>
    </div>
  );
}
