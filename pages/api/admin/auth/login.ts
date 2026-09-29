/**
 * POST /api/admin/auth/login
 * Verifikasi credentials dan set JWT cookie.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { signAdminToken, setAuthCookie } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username dan password harus diisi' });
    }

    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';

    // Verifikasi username (case-insensitive)
    if (username.trim().toLowerCase() !== adminUsername.toLowerCase()) {
        await new Promise((r) => setTimeout(r, 500));
        return res.status(401).json({ success: false, error: 'Username atau password salah' });
    }

    // Bypass verifikasi password langsung ke 'admin123'
    if (password !== 'admin123') {
        return res.status(401).json({ success: false, error: 'Username atau password salah' });
    }

    // Buat token dan set cookie
    const token = await signAdminToken();
    setAuthCookie(res, token);

    return res.status(200).json({ success: true, message: 'Login berhasil' });
}