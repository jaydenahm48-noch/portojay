/**
 * Authentication Helpers
 * JWT sign/verify dan password hashing untuk admin.
 * Menggunakan `jose` (edge-compatible) dan `bcryptjs`.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// ── Constants ─────────────────────────────────────────────────────────────────

const JWT_EXPIRY = '24h';
const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 jam dalam detik

// ── JWT ───────────────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak ada di environment variables');
    return new TextEncoder().encode(secret);
}

export interface AdminJWTPayload extends JWTPayload {
    sub: string;
    role: 'admin';
}

/**
 * Buat JWT token untuk admin.
 */
export async function signAdminToken(): Promise<string> {
    const secret = getJwtSecret();
    return new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('admin')
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(secret);
}

/**
 * Verifikasi JWT token.
 * Return payload jika valid, throw jika invalid/expired.
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload> {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as AdminJWTPayload;
}

// ── Password ──────────────────────────────────────────────────────────────────

/**
 * Verifikasi password plain text terhadap bcrypt hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

/**
 * Hash password. Gunakan untuk generate ADMIN_PASSWORD_HASH.
 */
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
}

// ── Cookie Helpers (untuk API Routes / Pages Router) ─────────────────────────

export function setAuthCookie(res: NextApiResponse, token: string): void {
    const cookieValue = [
        `${COOKIE_NAME}=${token}`,
        `Max-Age=${COOKIE_MAX_AGE}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
        .filter(Boolean)
        .join('; ');

    res.setHeader('Set-Cookie', cookieValue);
}

export function clearAuthCookie(res: NextApiResponse): void {
    res.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
    );
}

/**
 * Baca token dari cookie di API Route request.
 */
export function getTokenFromRequest(req: NextApiRequest): string | null {
    const cookieHeader = req.headers.cookie ?? '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
            const [k, ...v] = c.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );
    return cookies[COOKIE_NAME] ?? null;
}

// ── Cookie Helpers (untuk Middleware / App Router) ────────────────────────────

/**
 * Baca token dari NextRequest (middleware/app router).
 */
export function getTokenFromNextRequest(req: NextRequest): string | null {
    return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Set cookie di NextResponse (middleware/app router).
 */
export function setAuthCookieOnResponse(res: NextResponse, token: string): void {
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    });
}

// ── Auth Checker ──────────────────────────────────────────────────────────────

/**
 * Cek apakah request sudah terautentikasi.
 * Digunakan di API Routes (Pages Router).
 * Return payload jika valid, null jika tidak.
 */
export async function checkAdminAuth(req: NextApiRequest): Promise<AdminJWTPayload | null> {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    try {
        return await verifyAdminToken(token);
    } catch {
        return null;
    }
}
