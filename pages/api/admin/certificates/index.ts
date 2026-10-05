/**
 * GET  /api/admin/certificates  → List semua certificates
 * POST /api/admin/certificates  → Tambah certificate baru
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getCertificates, createCertificate } from '../../../../lib/googleSheets';
import { getPublicUrl } from '../../../../lib/googleDrive';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const certs = await getCertificates();
            const sorted = certs.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
            const data = sorted.map((c) => ({
                ...c,
                image_url: c.image ? getPublicUrl(c.image) : null,
            }));
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, description, issuer, image, issued_date, credential_url, published, sort_order } = req.body ?? {};

            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title harus diisi' });
            }

            let order = sort_order;
            if (!order) {
                const existing = await getCertificates();
                order = String(existing.length + 1);
            }

            const cert = await createCertificate({
                title: title.trim(),
                description: (description ?? '').trim(),
                issuer: (issuer ?? '').trim(),
                image: (image ?? '').trim(),
                issued_date: (issued_date ?? '').trim(),
                credential_url: (credential_url ?? '').trim(),
                published: published === false || published === 'false' ? 'false' : 'true',
                sort_order: String(order),
            });

            return res.status(201).json({ success: true, data: cert });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
