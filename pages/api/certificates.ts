/**
 * GET /api/certificates
 * Mengembalikan daftar sertifikat yang published, diurutkan by sort_order.
 * Digunakan oleh public frontend section Certificates.
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
        const published = all
            .filter((c) => c.published === 'true')
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
        return res.status(500).json({ success: false, error: 'Gagal memuat sertifikat' });
    }
}
