/**
 * Next.js Middleware
 * Melindungi semua route /admin/* (kecuali /admin/login).
 * Dijalankan di edge runtime sebelum request mencapai halaman/API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromNextRequest, verifyAdminToken } from './lib/auth';

export async function middleware(req: NextRequest): Promise<NextResponse> {
    const { pathname } = req.nextUrl;

    // Hanya proteksi route /admin/* (kecuali login page)
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Halaman login tidak perlu auth
    if (pathname === '/admin/login') {
        // Jika sudah login, redirect ke dashboard
        const token = getTokenFromNextRequest(req);
        if (token) {
            try {
                await verifyAdminToken(token);
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            } catch {
                // Token invalid, biarkan lanjut ke login page
            }
        }
        return NextResponse.next();
    }

    // Untuk semua route admin lainnya, cek token
    const token = getTokenFromNextRequest(req);

    if (!token) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        await verifyAdminToken(token);
        return NextResponse.next();
    } catch {
        // Token expired atau invalid
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Clear cookie yang invalid
        response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
        return response;
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
