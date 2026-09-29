import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

interface Skill {
    id: string; name: string; category: string;
    level: string; icon: string; sort_order: string; published: string;
}

const EMPTY: Omit<Skill, 'id'> = { name: '', category: '', level: '70', icon: '', sort_order: '', published: 'true' };

export default function AdminSkills() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Omit<Skill, 'id'>>(EMPTY);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);

    async function load() {
        const r = await fetch('/api/admin/skills');
        const d = await r.json();
        if (d.success) setSkills(d.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(''); }
    function openEdit(s: Skill) {
        setForm({ name: s.name, category: s.category, level: s.level, icon: s.icon, sort_order: s.sort_order, published: s.published });
        setEditId(s.id); setShowForm(true); setMsg('');
    }

    async function handleSave() {
        setSaving(true); setMsg('');
        try {
            const url = editId ? `/api/admin/skills/${editId}` : '/api/admin/skills';
            const method = editId ? 'PUT' : 'POST';
            const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const d = await r.json();
            if (d.success) { setMsg('✅ Tersimpan!'); await load(); setTimeout(() => setShowForm(false), 800); }
            else setMsg('❌ ' + (d.error || 'Gagal'));
        } catch { setMsg('❌ Terjadi kesalahan'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Hapus skill "${name}"?`)) return;
        const r = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
        const d = await r.json();
        if (d.success) load();
        else alert(d.error || 'Gagal');
    }

    async function togglePublish(s: Skill) {
        const r = await fetch(`/api/admin/skills/${s.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: s.published === 'true' ? 'false' : 'true' }),
        });
        const d = await r.json();
        if (d.success) load();
    }

    const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];

    return (
        <>
            <Head><title>Skills — Admin</title></Head>
            <AdminLayout title="Skills">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-sm text-gray-500">{skills.length} skill terdaftar</p>
                    <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Tambah Skill
                    </button>
                </div>

                {loading ? <div className="text-gray-400 py-20 text-center">Memuat...</div> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {skills.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">Belum ada skill.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-left px-4 py-3">Order</th>
                                        <th className="text-left px-4 py-3">Name</th>
                                        <th className="text-left px-4 py-3">Category</th>
                                        <th className="text-left px-4 py-3">Level</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                        <th className="text-right px-4 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {skills.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-400">{s.sort_order}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{s.category}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${s.level}%` }}></div>
                                                    </div>
                                                    <span className="text-gray-500 text-xs">{s.level}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => togglePublish(s)}
                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${s.published === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {s.published === 'true' ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => openEdit(s)} className="text-indigo-600 hover:underline text-xs mr-3">Edit</button>
                                                <button onClick={() => handleDelete(s.id, s.name)} className="text-red-500 hover:underline text-xs">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Modal Form */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Skill' : 'Tambah Skill'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Skill *</label>
                                        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input type="text" value={form.category}
                                            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            list="categories"
                                            placeholder="frontend, backend, ..."
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level: {form.level}%</label>
                                    <input type="range" min="0" max="100" value={form.level}
                                        onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                                        className="w-full accent-indigo-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Font Awesome)</label>
                                    <input type="text" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="fa-js, fa-css3, fa-python"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                        <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="true">Published</option>
                                            <option value="false">Draft</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
                            <div className="mt-5 flex gap-3 justify-end">
                                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
