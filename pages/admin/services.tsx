import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

interface Service {
    id: string; title: string; description: string;
    icon: string; image: string; sort_order: string; published: string;
}

const EMPTY: Omit<Service, 'id'> = { title: '', description: '', icon: 'fa-code', image: '', sort_order: '', published: 'true' };

export default function AdminServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);

    async function loadServices() {
        const r = await fetch('/api/admin/services');
        const d = await r.json();
        if (d.success) setServices(d.data);
        setLoading(false);
    }
    useEffect(() => { loadServices(); }, []);

    function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(''); }
    function openEdit(s: Service) {
        setForm({ title: s.title, description: s.description, icon: s.icon, image: s.image, sort_order: s.sort_order, published: s.published });
        setEditId(s.id); setShowForm(true); setMsg('');
    }

    async function handleSave() {
        setSaving(true); setMsg('');
        try {
            const url = editId ? `/api/admin/services/${editId}` : '/api/admin/services';
            const method = editId ? 'PUT' : 'POST';
            const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const d = await r.json();
            if (d.success) { setMsg('✅ Tersimpan!'); await loadServices(); setTimeout(() => setShowForm(false), 800); }
            else setMsg('❌ ' + (d.error || 'Gagal'));
        } catch { setMsg('❌ Terjadi kesalahan'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Hapus service "${title}"?`)) return;
        const r = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
        const d = await r.json();
        if (d.success) loadServices();
        else alert(d.error || 'Gagal menghapus');
    }

    async function togglePublish(s: Service) {
        const r = await fetch(`/api/admin/services/${s.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: s.published === 'true' ? 'false' : 'true' }),
        });
        const d = await r.json();
        if (d.success) loadServices();
    }

    return (
        <>
            <Head><title>Services — Admin</title></Head>
            <AdminLayout title="Services">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-sm text-gray-500">{services.length} service terdaftar</p>
                    <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Tambah Service
                    </button>
                </div>

                {loading ? <div className="text-gray-400 py-20 text-center">Memuat...</div> : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {services.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">Belum ada service. Klik &quot;+ Tambah Service&quot; untuk mulai.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="text-left px-4 py-3">Order</th>
                                        <th className="text-left px-4 py-3">Icon</th>
                                        <th className="text-left px-4 py-3">Title</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Deskripsi</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                        <th className="text-right px-4 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {services.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-400">{s.sort_order}</td>
                                            <td className="px-4 py-3"><i className={`fa ${s.icon} text-indigo-500`}></i></td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{s.title}</td>
                                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs line-clamp-2">{s.description}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => togglePublish(s)}
                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${s.published === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {s.published === 'true' ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => openEdit(s)} className="text-indigo-600 hover:underline text-xs mr-3">Edit</button>
                                                <button onClick={() => handleDelete(s.id, s.title)} className="text-red-500 hover:underline text-xs">Hapus</button>
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
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Service' : 'Tambah Service'}</h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Font Awesome class)</label>
                                    <input type="text" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="fa-code"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <p className="text-xs text-gray-400 mt-1">Contoh: fa-code, fa-mobile-alt, fa-palette</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        rows={3}
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
                                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
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
