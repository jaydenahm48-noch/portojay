/**
 * GET /api/profile
 * Mengembalikan data profil publik (tanpa data sensitif).
 * Digunakan oleh public frontend section Home, About, Contact.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getProfile } from '../../lib/googleSheets';
import { getPublicUrl } from '../../lib/googleDrive';

// Key yang TIDAK boleh dikembalikan ke publik
const PRIVATE_KEYS = new Set(['cv_file']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const profile = await getProfile();

        // Hapus key private
        for (const key of PRIVATE_KEYS) {
            delete profile[key];
        }

        // Resolve profile_image ke URL publik
        if (profile.profile_image) {
            profile.profile_image_url = getPublicUrl(profile.profile_image);
        }

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('[/api/profile] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal memuat profile' });
    }
}
