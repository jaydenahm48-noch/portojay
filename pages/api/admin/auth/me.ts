/**
 * GET /api/admin/auth/me
 * Cek apakah user sudah login (untuk client-side auth check).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAdminAuth } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const payload = await checkAdminAuth(req);
    if (!payload) {
        return res.status(401).json({ success: false, authenticated: false });
    }

    return res.status(200).json({ success: true, authenticated: true });
}
