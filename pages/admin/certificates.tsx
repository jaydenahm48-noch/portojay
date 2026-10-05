import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

interface Certificate {
    id: string; title: string; description: string; issuer: string;
    image: string; image_url: string | null; issued_date: string;
    credential_url: string; published: string; sort_order: string;
}

// Helper client-side untuk preview gambar Drive
function getPublicUrl(input: string): string {
    if (!input) return '';
    if (input.startsWith('http') && !input.includes('drive.google.com') && !input.includes('googleusercontent.com')) return input;
    if (input.includes('lh3.googleusercontent.com')) return input;
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : input;
    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

type FormState = Omit<Certificate, 'id' | 'image_url'>;
const EMPTY: FormState = {
    title: '', description: '', issuer: '', image: '',
    issued_date: '', credential_url: '', published: 'true', sort_order: '',
};

export default function AdminCertificates() {
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);

    async function load() {
        const r = await fetch('/api/admin/certificates');
        const d = await r.json();
        if (d.success) setCerts(d.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openNew() { setForm(EMPTY); setEditId(null); setMsg(''); setShowForm(true); }
    function openEdit(c: Certificate) {
        setForm({
            title: c.title, description: c.description, issuer: c.issuer,
            image: c.image, issued_date: c.issued_date, credential_url: c.credential_url,
            published: c.published, sort_order: c.sort_order,
        });
        setEditId(c.id); setMsg(''); setShowForm(true);
    }

    async function handleSave() {
        if (!form.title.trim()) { setMsg('❌ Title harus diisi'); return; }
        setSaving(true); setMsg('');
        try {
            const url = editId ? `/api/admin/certificates/${editId}` : '/api/admin/certificates';
            const method = editId ? 'PUT' : 'POST';
            const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const d = await r.json();
            if (d.success) { setMsg('✅ Tersimpan!'); await load(); setTimeout(() => setShowForm(false), 800); }
            else setMsg('❌ ' + (d.error || 'Gagal'));
        } catch { setMsg('❌ Terjadi kesalahan'); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Hapus sertifikat "${title}"?`)) return;
        const r = await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE' });
        const d = await r.json();
        if (d.success) load();
        else alert(d.error || 'Gagal menghapus');
    }

    async function togglePublish(c: Certificate) {
        await fetch(`/api/admin/certificates/${c.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: c.published === 'true' ? 'false' : 'true' }),
        });
        load();
    }

    return (
        <>
            <Head><title>Certificates — Admin</title></Head>
            <AdminLayout title="Certificates">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-sm text-gray-500">{certs.length} sertifikat terdaftar</p>
                    <button onClick={openNew}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Tambah Sertifikat
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-400 py-20 text-center">Memuat...</div>
                ) : certs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-400">
                        Belum ada sertifikat.
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-4 py-3 w-12">Order</th>
                                    <th className="text-left px-4 py-3 w-16">Gambar</th>
                                    <th className="text-left px-4 py-3">Title</th>
                                    <th className="text-left px-4 py-3 hidden md:table-cell">Issuer</th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">Tanggal</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {certs.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{c.sort_order}</td>
                                        <td className="px-4 py-3">
                                            {c.image_url ? (
                                                <img src={c.image_url} alt={c.title}
                                                    className="w-12 h-9 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">—</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.issuer}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{c.issued_date}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => togglePublish(c)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${c.published === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.published === 'true' ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline text-xs mr-3">Edit</button>
                                            <button onClick={() => handleDelete(c.id, c.title)} className="text-red-500 hover:underline text-xs">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Modal Form ──────────────────────────────────────────── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editId ? 'Edit Sertifikat' : 'Tambah Sertifikat'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" value={form.title}
                                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Nama sertifikat..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                {/* Issuer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuer (Dari mana)</label>
                                    <input type="text" value={form.issuer}
                                        onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))}
                                        placeholder="Contoh: Dicoding, Google, Coursera..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        rows={3}
                                        placeholder="Deskripsi singkat tentang sertifikat ini..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                {/* Gambar sertifikat — paste link Drive */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Sertifikat</label>
                                    <input type="text" value={form.image}
                                        onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                                        placeholder="Paste link Google Drive... https://drive.google.com/file/d/..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <p className="text-xs text-gray-400 mt-1">Pastikan file di Drive sudah di-share &quot;Anyone with the link&quot;</p>

                                    {/* Preview */}
                                    {form.image && (
                                        <img src={getPublicUrl(form.image)} alt="Preview"
                                            className="mt-2 h-28 w-auto object-cover rounded-lg border border-gray-200"
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Tanggal */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terbit</label>
                                        <input type="text" value={form.issued_date}
                                            onChange={e => setForm(p => ({ ...p, issued_date: e.target.value }))}
                                            placeholder="Januari 2024"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>

                                    {/* Sort Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                        <input type="number" value={form.sort_order}
                                            onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>

                                {/* Credential URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Verifikasi (opsional)</label>
                                    <input type="url" value={form.credential_url}
                                        onChange={e => setForm(p => ({ ...p, credential_url: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={form.published}
                                        onChange={e => setForm(p => ({ ...p, published: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="true">Published</option>
                                        <option value="false">Draft</option>
                                    </select>
                                </div>
                            </div>

                            {msg && <p className="mt-3 text-sm text-center">{msg}</p>}

                            <div className="mt-5 flex gap-3 justify-end">
                                <button onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                                    Batal
                                </button>
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
