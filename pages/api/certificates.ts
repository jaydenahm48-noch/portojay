/**
 * GET /api/certificates
 * Mengembalikan daftar sertifikat yang published, diurutkan by sort_order.
 * Jika sheet Certificates belum ada, return array kosong (bukan error).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getCertificates } from '../../lib/googleSheets';
import { getPublicUrl } from '../../lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const all = await getCertificates();

        // Sheet baru / kosong — return empty array, bukan error
        if (!all || all.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const published = all
            .filter((c) => c.published !== 'false')  // tampilkan semua kecuali yang eksplisit draft
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

        const data = published.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            issuer: c.issuer,
            image: c.image ? getPublicUrl(c.image) : '',
            issued_date: c.issued_date,
            credential_url: c.credential_url,
        }));

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[/api/certificates] Error:', error);
        // Return empty array agar frontend tidak crash, bukan 500
        return res.status(200).json({ success: true, data: [] });
    }
}
