import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';

interface Project {
    id: string; title: string; slug: string; description: string;
    technologies: string; thumbnail: string; thumbnail_url: string | null;
    github_url: string; demo_url: string; featured: string;
    published: string; sort_order: string; created_at: string;
}

export default function AdminProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        const r = await fetch('/api/admin/projects');
        const d = await r.json();
        if (d.success) setProjects(d.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function toggleField(id: string, field: 'published' | 'featured', current: string) {
        const newVal = current === 'true' ? 'false' : 'true';
        await fetch(`/api/admin/projects/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: newVal }),
        });
        load();
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Hapus project "${title}"?\n\nSemua gambar di Google Drive juga akan dihapus.`)) return;
        const r = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
        const d = await r.json();
        if (d.success) load();
        else alert(d.error || 'Gagal menghapus');
    }

    return (
        <>
            <Head><title>Projects — Admin</title></Head>
            <AdminLayout title="Projects">
                <div className="flex justify-between items-center mb-5">
                    <p className="text-sm text-gray-500">{projects.length} project terdaftar</p>
                    <Link href="/admin/projects/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Tambah Project
                    </Link>
                </div>

                {loading ? (
                    <div className="text-gray-400 py-20 text-center">Memuat...</div>
                ) : projects.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-400">
                        Belum ada project. <Link href="/admin/projects/new" className="text-indigo-600 hover:underline">Tambah sekarang →</Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-4 py-3 w-12">Order</th>
                                    <th className="text-left px-4 py-3 w-16">Thumb</th>
                                    <th className="text-left px-4 py-3">Title</th>
                                    <th className="text-left px-4 py-3 hidden lg:table-cell">Technologies</th>
                                    <th className="text-left px-4 py-3">Published</th>
                                    <th className="text-left px-4 py-3">Featured</th>
                                    <th className="text-right px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {projects.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{p.sort_order}</td>
                                        <td className="px-4 py-3">
                                            {p.thumbnail_url ? (
                                                <img src={p.thumbnail_url} alt={p.title}
                                                    className="w-12 h-9 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">No img</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{p.title}</p>
                                            <p className="text-xs text-gray-400">/{p.slug}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {p.technologies?.split(',').slice(0, 3).map(t => (
                                                    <span key={t} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{t.trim()}</span>
                                                ))}
                                                {p.technologies?.split(',').length > 3 && (
                                                    <span className="text-gray-400 text-xs">+{p.technologies.split(',').length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleField(p.id, 'published', p.published)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.published === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {p.published === 'true' ? 'Live' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleField(p.id, 'featured', p.featured)}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.featured === 'true' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {p.featured === 'true' ? '⭐ Featured' : 'Normal'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <Link href={`/admin/projects/${p.id}/edit`} className="text-indigo-600 hover:underline text-xs mr-3">Edit</Link>
                                            <button onClick={() => handleDelete(p.id, p.title)} className="text-red-500 hover:underline text-xs">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
