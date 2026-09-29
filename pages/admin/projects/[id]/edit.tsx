import { useEffect, useState, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/admin/AdminLayout';

interface ProjectImage { id: string; image: string; url: string; caption: string; sort_order: string; }
interface Project {
    id: string; title: string; slug: string; description: string; technologies: string;
    thumbnail: string; thumbnail_url: string | null; github_url: string; demo_url: string;
    featured: string; published: string; sort_order: string; images: ProjectImage[];
}

// ── Helper: ubah link/ID Drive jadi URL gambar langsung ──────────────────────
function getPublicUrl(inputUrlOrId: string): string {
    if (!inputUrlOrId) return '';
    const input = inputUrlOrId.trim();
    if (input.startsWith('http') && !input.includes('drive.google.com') && !input.includes('googleusercontent.com')) {
        return input;
    }
    if (input.includes('lh3.googleusercontent.com')) return input;
    const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : input;
    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export default function EditProject() {
    const router = useRouter();
    const { id } = router.query as { id: string };

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '', slug: '', description: '', technologies: '',
        github_url: '', demo_url: '', featured: false, published: true, sort_order: '',
    });

    // Thumbnail — pakai input link, bukan file upload
    const [newThumbLink, setNewThumbLink] = useState('');   // input baru (belum disimpan)
    const [thumbPreview, setThumbPreview] = useState('');   // URL yang ditampilkan sebagai preview

    // Tambah detail — input link baru
    const [newDetailLink, setNewDetailLink] = useState('');
    const [newDetailCaption, setNewDetailCaption] = useState('');

    // Edit caption untuk gambar yang sudah ada
    const [editingCaption, setEditingCaption] = useState<Record<string, string>>({});

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ── Load project ───────────────────────────────────────────────────────
    useEffect(() => { if (id) loadProject(); }, [id]);

    async function loadProject() {
        try {
            const r = await fetch(`/api/admin/projects/${id}`);
            const d = await r.json();
            if (d.success) {
                const p: Project = d.data;
                setProject(p);
                setForm({
                    title: p.title, slug: p.slug, description: p.description,
                    technologies: p.technologies, github_url: p.github_url, demo_url: p.demo_url,
                    featured: p.featured === 'true', published: p.published === 'true', sort_order: p.sort_order,
                });
                setThumbPreview(p.thumbnail_url ?? '');
                const caps: Record<string, string> = {};
                p.images.forEach(img => { caps[img.id] = img.caption; });
                setEditingCaption(caps);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }

    // ── Tambah detail link ke antrian ──────────────────────────────────────
    function handleAddDetail() {
        if (!newDetailLink.trim()) return;
        // Langsung simpan ke Sheet (akan dilakukan saat save)
        // Simpan dulu di state lokal sebagai antrian
        setProject(p => {
            if (!p) return p;
            const tempId = `__new__${Date.now()}`;
            return {
                ...p,
                images: [...p.images, {
                    id: tempId,
                    image: newDetailLink.trim(),
                    url: getPublicUrl(newDetailLink.trim()),
                    caption: newDetailCaption.trim(),
                    sort_order: String(p.images.length + 1),
                }],
            };
        });
        setEditingCaption(prev => ({ ...prev, [`__new__${Date.now() - 1}`]: newDetailCaption.trim() }));
        setNewDetailLink('');
        setNewDetailCaption('');
    }

    // ── Save ───────────────────────────────────────────────────────────────
    async function handleSaveInfo(e: FormEvent) {
        e.preventDefault();
        setSaving(true); setError(''); setSuccessMsg('');
        try {
            // 1. Simpan info project
            const r = await fetch(`/api/admin/projects/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.error);

            // 2. Ganti thumbnail jika ada input baru
            if (newThumbLink.trim()) {
                const thumbUrl = getPublicUrl(newThumbLink.trim());
                await fetch(`/api/admin/projects/${id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ thumbnail: thumbUrl }),
                });
                setNewThumbLink('');
            }

            // 3. Simpan perubahan caption gambar yang sudah ada
            if (project) {
                const captionUpdates = Object.entries(editingCaption).filter(([imgId, caption]) => {
                    if (imgId.startsWith('__new__')) return false; // skip antrian baru
                    const original = project.images.find(i => i.id === imgId);
                    return original && original.caption !== caption;
                });
                await Promise.all(captionUpdates.map(([imgId, caption]) =>
                    fetch(`/api/admin/projects/${id}/images`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageId: imgId, caption }),
                    })
                ));

                // 4. Simpan gambar detail baru (yang id-nya __new__)
                const newImages = project.images.filter(img => img.id.startsWith('__new__'));
                for (let i = 0; i < newImages.length; i++) {
                    const img = newImages[i];
                    const imageUrl = getPublicUrl(img.image);
                    await fetch(`/api/admin/projects/${id}/images`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: imageUrl,
                            caption: editingCaption[img.id] ?? img.caption,
                            sort_order: (project.images.filter(x => !x.id.startsWith('__new__')).length) + i + 1,
                        }),
                    });
                }
            }

            setSuccessMsg('Project berhasil disimpan!');
            await loadProject();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    }

    // ── Hapus gambar detail ────────────────────────────────────────────────
    async function deleteImage(imgId: string) {
        // Jika masih antrian lokal (belum disimpan), hapus dari state saja
        if (imgId.startsWith('__new__')) {
            setProject(p => p ? { ...p, images: p.images.filter(i => i.id !== imgId) } : p);
            return;
        }
        if (!confirm('Hapus gambar ini?')) return;
        const r = await fetch(`/api/admin/projects/${id}/images`, {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId: imgId }),
        });
        const d = await r.json();
        if (d.success) {
            setProject(p => p ? { ...p, images: p.images.filter(i => i.id !== imgId) } : p);
            setEditingCaption(prev => { const n = { ...prev }; delete n[imgId]; return n; });
        } else alert(d.error || 'Gagal menghapus');
    }

    // ── Reorder gambar ─────────────────────────────────────────────────────
    async function moveImage(imgId: string, direction: 'up' | 'down') {
        if (!project) return;
        const images = [...project.images].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
        const idx = images.findIndex(i => i.id === imgId);
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === images.length - 1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        await Promise.all([
            fetch(`/api/admin/projects/${id}/images`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId: imgId, sort_order: images[swapIdx].sort_order }),
            }),
            fetch(`/api/admin/projects/${id}/images`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId: images[swapIdx].id, sort_order: images[idx].sort_order }),
            }),
        ]);
        await loadProject();
    }

    // ── Render ─────────────────────────────────────────────────────────────
    if (loading) return <AdminLayout title="Edit Project"><div className="text-gray-400 py-20 text-center">Memuat...</div></AdminLayout>;
    if (!project) return <AdminLayout title="Edit Project"><div className="text-gray-400 py-20 text-center">Project tidak ditemukan.</div></AdminLayout>;

    const sortedImages = [...project.images].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

    return (
        <>
            <Head><title>Edit {project.title} — Admin</title></Head>
            <AdminLayout title={`Edit: ${project.title}`}>
                <div className="max-w-2xl space-y-6">
                    <form onSubmit={handleSaveInfo} className="space-y-6">

                        {/* ── Informasi Project ─────────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h2 className="font-semibold text-gray-800">Informasi Project</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                                <input type="text" value={form.technologies} onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))}
                                    placeholder="Laravel, MySQL, Vue.js"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                    <input type="url" value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                                    <input type="url" value={form.demo_url} onChange={e => setForm(p => ({ ...p, demo_url: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium text-gray-700">Published</span>
                                    </label>
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium text-gray-700">⭐ Featured</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ── Thumbnail ─────────────────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
                            <h2 className="font-semibold text-gray-800">Thumbnail</h2>

                            {/* Preview thumbnail saat ini */}
                            {thumbPreview && !newThumbLink && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-1.5">Thumbnail saat ini:</p>
                                    <img src={thumbPreview} alt="Thumbnail"
                                        className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200" />
                                </div>
                            )}

                            {/* Input ganti thumbnail — paste link baru */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ganti Thumbnail <span className="text-gray-400 font-normal">(opsional — kosongkan jika tidak diganti)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Paste link Google Drive baru... https://drive.google.com/file/d/..."
                                    value={newThumbLink}
                                    onChange={e => setNewThumbLink(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Pastikan file di Drive sudah di-share &quot;Anyone with the link&quot;</p>
                            </div>

                            {/* Preview thumbnail baru */}
                            {newThumbLink && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5">Preview thumbnail baru:</p>
                                    <img
                                        src={getPublicUrl(newThumbLink)}
                                        alt="Preview baru"
                                        className="w-full max-w-xs h-40 object-cover rounded-lg border border-indigo-200"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <button type="button" onClick={() => setNewThumbLink('')}
                                        className="mt-1.5 text-xs text-red-500 hover:underline">
                                        × Batal ganti
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Gallery / Detail Images ───────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">Gallery / Detail Images</h2>
                                <span className="text-xs text-gray-400">{sortedImages.length} gambar</span>
                            </div>

                            {/* Daftar gambar yang sudah ada */}
                            {sortedImages.length > 0 ? (
                                <div className="space-y-2">
                                    {sortedImages.map((img, i) => (
                                        <div key={img.id}
                                            className={`flex gap-3 p-3 border rounded-xl transition-colors ${
                                                img.id.startsWith('__new__')
                                                    ? 'border-indigo-200 bg-indigo-50'
                                                    : 'border-gray-100 bg-gray-50 hover:bg-white'
                                            }`}>

                                            {/* Thumbnail kecil */}
                                            <img src={img.url || getPublicUrl(img.image)} alt={img.caption || `#${i + 1}`}
                                                className="w-20 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />

                                            {/* Caption editable */}
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="text"
                                                    value={editingCaption[img.id] ?? img.caption}
                                                    onChange={e => setEditingCaption(prev => ({ ...prev, [img.id]: e.target.value }))}
                                                    placeholder="Caption (opsional)"
                                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                                                />
                                                {img.id.startsWith('__new__') && (
                                                    <span className="text-xs text-indigo-500 mt-0.5 block">Belum disimpan — klik Simpan Perubahan</span>
                                                )}
                                            </div>

                                            {/* Kontrol kanan */}
                                            <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                                <button type="button" onClick={() => moveImage(img.id, 'up')}
                                                    disabled={i === 0 || img.id.startsWith('__new__')}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 text-xs rounded hover:bg-gray-200 transition-colors">▲</button>
                                                <span className="text-xs text-gray-300 font-mono">#{i + 1}</span>
                                                <button type="button" onClick={() => moveImage(img.id, 'down')}
                                                    disabled={i === sortedImages.length - 1 || img.id.startsWith('__new__')}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 text-xs rounded hover:bg-gray-200 transition-colors">▼</button>
                                                <button type="button" onClick={() => deleteImage(img.id)}
                                                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
                                                    title="Hapus">🗑</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">Belum ada gambar detail.</p>
                            )}

                            {/* Form tambah gambar detail baru — input link */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Tambah Gambar Detail</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Paste link Google Drive... https://drive.google.com/file/d/..."
                                        value={newDetailLink}
                                        onChange={e => setNewDetailLink(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Caption (opsional)"
                                        value={newDetailCaption}
                                        onChange={e => setNewDetailCaption(e.target.value)}
                                        className="w-full sm:w-44 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDetail}
                                        disabled={!newDetailLink.trim()}
                                        className="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        + Tambah
                                    </button>
                                </div>

                                {/* Preview link yang baru dimasukkan */}
                                {newDetailLink && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-1">Preview:</p>
                                        <img
                                            src={getPublicUrl(newDetailLink)}
                                            alt="Preview"
                                            className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}

                                <p className="text-xs text-gray-400 mt-2">
                                    Pastikan file sudah di-share &quot;Anyone with the link&quot; di Google Drive.
                                </p>
                            </div>
                        </div>

                        {/* ── Feedback ──────────────────────────────────────── */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">❌ {error}</div>
                        )}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">✅ {successMsg}</div>
                        )}

                        {/* ── Tombol aksi ───────────────────────────────────── */}
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                            <button type="button" onClick={() => router.push('/admin/projects')}
                                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Kembali
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
