import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

interface Stats {
    projects: number;
    services: number;
    skills: number;
    messages: number;
    unread: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const [projRes, svcRes, skillRes, msgRes] = await Promise.all([
                    fetch('/api/admin/projects'),
                    fetch('/api/admin/services'),
                    fetch('/api/admin/skills'),
                    fetch('/api/admin/messages'),
                ]);
                const [proj, svc, skill, msg] = await Promise.all([
                    projRes.json(), svcRes.json(), skillRes.json(), msgRes.json(),
                ]);
                setStats({
                    projects: proj.data?.length ?? 0,
                    services: svc.data?.length ?? 0,
                    skills: skill.data?.length ?? 0,
                    messages: msg.data?.length ?? 0,
                    unread: msg.data?.filter((m: { status: string }) => m.status === 'unread').length ?? 0,
                });
            } catch {
                // silent
            }
        }
        loadStats();
    }, []);

    const cards = [
        { label: 'Projects', value: stats?.projects, href: '/admin/projects', emoji: '📁', color: 'bg-blue-50 text-blue-700' },
        { label: 'Services', value: stats?.services, href: '/admin/services', emoji: '⚙️', color: 'bg-purple-50 text-purple-700' },
        { label: 'Skills', value: stats?.skills, href: '/admin/skills', emoji: '⚡', color: 'bg-yellow-50 text-yellow-700' },
        {
            label: 'Messages', value: stats?.messages, href: '/admin/messages', emoji: '✉️', color: 'bg-green-50 text-green-700',
            badge: stats?.unread ? `${stats.unread} unread` : undefined
        },
    ];

    return (
        <>
            <Head><title>Dashboard — Admin</title></Head>
            <AdminLayout title="Dashboard">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {cards.map((card) => (
                        <a key={card.label} href={card.href}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-2xl rounded-lg p-2 ${card.color}`}>{card.emoji}</span>
                                {card.badge && (
                                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats === null ? '—' : card.value}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                        </a>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-semibold text-gray-800 mb-3">Quick Links</h2>
                    <div className="flex flex-wrap gap-3">
                        <a href="/admin/projects/new"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            + Tambah Project
                        </a>
                        <a href="/admin/services"
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            Kelola Services
                        </a>
                        <a href="/admin/messages"
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            Lihat Pesan
                        </a>
                        <a href="/" target="_blank"
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            🌐 Lihat Website
                        </a>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
