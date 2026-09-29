import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

interface Message {
    id: string; name: string; email: string;
    subject: string; message: string; created_at: string; status: string;
}

const STATUS_LABELS: Record<string, string> = {
    unread: 'Belum dibaca',
    read: 'Sudah dibaca',
    archived: 'Diarsipkan',
};
const STATUS_COLORS: Record<string, string> = {
    unread: 'bg-blue-100 text-blue-700',
    read: 'bg-gray-100 text-gray-600',
    archived: 'bg-yellow-100 text-yellow-700',
};

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);

    async function load() {
        const r = await fetch('/api/admin/messages');
        const d = await r.json();
        if (d.success) setMessages(d.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function updateStatus(id: string, status: string) {
        await fetch(`/api/admin/messages/${id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        await load();
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    }

    async function handleDelete(id: string) {
        if (!confirm('Hapus pesan ini?')) return;
        await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        if (selected?.id === id) setSelected(null);
        load();
    }

    async function openMessage(m: Message) {
        setSelected(m);
        if (m.status === 'unread') await updateStatus(m.id, 'read');
    }

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <>
            <Head><title>Messages — Admin</title></Head>
            <AdminLayout title="Messages">
                <div className="flex items-center gap-3 mb-5">
                    <p className="text-sm text-gray-500">{messages.length} total pesan</p>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                            {unreadCount} belum dibaca
                        </span>
                    )}
                </div>

                <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[400px]">
                    {/* List Panel */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 ${selected ? 'hidden md:flex md:flex-col' : 'flex flex-col'} w-full md:w-80`}>
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Memuat...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">Belum ada pesan masuk.</div>
                        ) : (
                            <div className="overflow-y-auto divide-y divide-gray-50">
                                {messages.map((m) => (
                                    <button key={m.id}
                                        onClick={() => openMessage(m)}
                                        className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors ${selected?.id === m.id ? 'bg-indigo-50' : ''}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-semibold text-sm ${m.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {m.status === 'unread' && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5 align-middle"></span>}
                                                {m.name}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{m.subject}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{m.message}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selected && (
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <h3 className="font-semibold text-gray-900">{selected.subject}</h3>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {STATUS_LABELS[selected.status] ?? selected.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{selected.name} — <a href={`mailto:${selected.email}`} className="text-indigo-600 hover:underline">{selected.email}</a></p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(selected.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0">×</button>
                            </div>
                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                            </div>
                            {/* Actions */}
                            <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                                    className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
                                    ↩ Balas via Email
                                </a>
                                {selected.status !== 'archived' && (
                                    <button onClick={() => updateStatus(selected.id, 'archived')}
                                        className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                                        Arsipkan
                                    </button>
                                )}
                                {selected.status === 'archived' && (
                                    <button onClick={() => updateStatus(selected.id, 'read')}
                                        className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                                        Batalkan Arsip
                                    </button>
                                )}
                                <button onClick={() => handleDelete(selected.id)}
                                    className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto">
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
