/**
 * AdminLayout
 * Layout utama admin panel — sidebar + main content.
 * Digunakan oleh semua halaman /admin/* (kecuali login).
 */

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/profile', label: 'Profile', icon: '👤' },
    { href: '/admin/services', label: 'Services', icon: '⚙️' },
    { href: '/admin/projects', label: 'Projects', icon: '📁' },
    { href: '/admin/certificates', label: 'Certificates', icon: '🏆' },
    { href: '/admin/skills', label: 'Skills', icon: '⚡' },
    { href: '/admin/messages', label: 'Messages', icon: '✉️' },
];

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    async function handleLogout() {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    }

    return (
        <div className="admin-root min-h-screen bg-gray-50 flex">
            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-white shadow-md flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-lg">Noch Admin</p>
                    <p className="text-xs text-gray-400">Portfolio Manager</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = router.pathname === item.href ||
                            (item.href !== '/admin/dashboard' && router.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                `}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-gray-100 space-y-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <span>🌐</span> Lihat Website
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* ── Overlay mobile ───────────────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Main ─────────────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4">
                    <button
                        className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Buka sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {title && (
                        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                    )}
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
