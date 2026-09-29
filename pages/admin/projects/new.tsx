import { useState, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';

// Helper client-side — duplikat dari lib/googleDrive.ts tapi aman di browser
function getPublicUrl(fileIdOrUrl: string): string {
    if (!fileIdOrUrl) return '';
    // Jika sudah berupa URL lengkap, kembalikan apa adanya
    if (fileIdOrUrl.startsWith('http')) return fileIdOrUrl;
    // Jika berupa file ID, bentuk URL Drive
    return `https://drive.google.com/uc?export=view&id=${fileIdOrUrl}`;
}

interface FormData {
    title: string; slug: string; description: string; technologies: string;
    github_url: string; demo_url: string; featured: boolean; published: boolean; sort_order: string;
}

export default function NewProject() {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        title: '', slug: '', description: '', technologies: '',
        github_url: '', demo_url: '', featured: false, published: true, sort_order: '',
    });

    // State untuk Thumbnail
    const [thumbnailInput, setThumbnailInput] = useState('');

    // State untuk Gallery Images
    const [detailInput, setDetailInput] = useState('');
    const [detailCaption, setDetailCaption] = useState('');
    const [detailItems, setDetailItems] = useState<{ url: string; caption: string }[]>([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    function handleTitleChange(val: string) {
        setForm(p => ({
            ...p,
            title: val,
            slug: p.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }));
    }

    // Tambah link detail ke list
    function handleAddDetail() {
        if (!detailInput.trim()) return;
        setDetailItems(p => [...p, { url: detailInput.trim(), caption: detailCaption.trim() }]);
        setDetailInput('');
        setDetailCaption('');
    }

    function removeDetail(index: number) {
        setDetailItems(p => p.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title harus diisi'); return; }
        setSaving(true); setError('');

        try {
            const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            // Ubah link/ID Google Drive thumbnail menjadi URL Publik Direct CDN
            const formattedThumbnail = thumbnailInput.trim() ? getPublicUrl(thumbnailInput.trim()) : '';

            // 1. Buat project ke database
            const r = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, slug, thumbnail: formattedThumbnail }),
            });
            const d = await r.json();
            if (!d.success) throw new Error(d.error || 'Gagal membuat project');

            const projectId = d.data.id;

            // 2. Simpan gambar detail / gallery ke database
            for (let i = 0; i < detailItems.length; i++) {
                const { url, caption } = detailItems[i];
                const formattedDetailUrl = getPublicUrl(url);

                await fetch(`/api/admin/projects/${projectId}/images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: formattedDetailUrl, caption, sort_order: i + 1 }),
                });
            }

            router.push('/admin/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Head><title>Tambah Project — Admin</title></Head>
            <AdminLayout title="Tambah Project Baru">
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Info Dasar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h2 className="font-semibold text-gray-800">Informasi Project</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    placeholder="auto-generate dari title"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                                <input type="text" value={form.technologies} onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))}
                                    placeholder="Laravel, MySQL, Vue.js (pisahkan dengan koma)"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                    <input type="url" value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))}
                                        placeholder="https://github.com/..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
                                    <input type="url" value={form.demo_url} onChange={e => setForm(p => ({ ...p, demo_url: e.target.value }))}
                                        placeholder="https://..."
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

                        {/* Thumbnail Utama */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
                            <h2 className="font-semibold text-gray-800">Thumbnail Utama</h2>
                            <p className="text-xs text-gray-400">Tempel link/URL foto dari Google Drive (Pastikan hak akses file di Drive sudah "Anyone with the link").</p>

                            <input
                                type="text"
                                placeholder="https://drive.google.com/file/d/1x2y3z.../view"
                                value={thumbnailInput}
                                onChange={e => setThumbnailInput(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            {/* Live Preview */}
                            {thumbnailInput && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Preview Gambar:</p>
                                    <img
                                        src={getPublicUrl(thumbnailInput)}
                                        alt="Preview Thumbnail"
                                        className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Gallery Images */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div>
                                <h2 className="font-semibold text-gray-800">Gambar Detail / Gallery</h2>
                                <p className="text-xs text-gray-400">Tambahkan beberapa link foto Google Drive untuk galeri detail project.</p>
                            </div>

                            {/* Form Input Tambah Detail */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Link Google Drive..."
                                    value={detailInput}
                                    onChange={e => setDetailInput(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Caption (opsional)"
                                    value={detailCaption}
                                    onChange={e => setDetailCaption(e.target.value)}
                                    className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDetail}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    + Tambah
                                </button>
                            </div>

                            {/* Daftar Detail Gambar yang Ditambahkan */}
                            {detailItems.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                    {detailItems.map((item, i) => (
                                        <div key={i} className="relative group border border-gray-200 rounded-lg p-1 bg-gray-50">
                                            <img
                                                src={getPublicUrl(item.url)}
                                                alt={`Detail ${i + 1}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeDetail(i)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                                            >
                                                ×
                                            </button>
                                            {item.caption && (
                                                <p className="text-xs text-gray-600 mt-1 px-1 truncate">{item.caption}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
                        )}

                        <div className="flex gap-3">
                            <button type="submit" disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                {saving ? 'Menyimpan...' : 'Simpan Project'}
                            </button>
                            <button type="button" onClick={() => router.push('/admin/projects')}
                                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}