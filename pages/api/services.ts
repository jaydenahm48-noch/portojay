/**
 * GET /api/services
 * Mengembalikan daftar services yang published, diurutkan by sort_order.
 * Digunakan oleh public frontend section Services.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServices } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const all = await getServices();
        const published = all
            .filter((s) => s.published === 'true')
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

        return res.status(200).json({ success: true, data: published });
    } catch (error) {
        console.error('[/api/services] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal memuat services' });
    }
}
