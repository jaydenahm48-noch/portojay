/**
 * GET /api/skills
 * Mengembalikan daftar skills yang published, diurutkan by sort_order.
 * Digunakan oleh public frontend section About.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSkills } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const all = await getSkills();
        const published = all
            .filter((s) => s.published === 'true')
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

        return res.status(200).json({ success: true, data: published });
    } catch (error) {
        console.error('[/api/skills] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal memuat skills' });
    }
}
