/**
 * GET  /api/admin/profile  → Ambil semua data profile
 * PUT  /api/admin/profile  → Update satu atau lebih key profile
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../lib/withAdminAuth';
import { getProfile, updateProfileBulk } from '../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const profile = await getProfile();
            return res.status(200).json({ success: true, data: profile });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'PUT') {
        try {
            const data = req.body;
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                return res.status(400).json({ success: false, error: 'Body tidak valid' });
            }
            // Filter hanya field yang diizinkan
            const allowedKeys = [
                'name', 'role', 'bio', 'email', 'phone', 'location',
                'website', 'instagram', 'github', 'linkedin',
                'profile_image', 'cv_file', 'freelance',
            ];
            const filtered: Record<string, string> = {};
            for (const key of allowedKeys) {
                if (key in data && typeof data[key] === 'string') {
                    filtered[key] = data[key];
                }
            }
            await updateProfileBulk(filtered);
            return res.status(200).json({ success: true, message: 'Profile berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
