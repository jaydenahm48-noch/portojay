/**
 * GET  /api/admin/services  → List semua services
 * POST /api/admin/services  → Tambah service baru
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getServices, createService } from '../../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const services = await getServices();
            const sorted = services.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
            return res.status(200).json({ success: true, data: sorted });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, description, icon, image, sort_order, published } = req.body ?? {};

            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title harus diisi' });
            }

            // Hitung sort_order otomatis jika tidak diberikan
            let order = sort_order;
            if (!order) {
                const existing = await getServices();
                order = String(existing.length + 1);
            }

            const service = await createService({
                title: title.trim(),
                description: (description ?? '').trim(),
                icon: (icon ?? '').trim(),
                image: (image ?? '').trim(),
                sort_order: String(order),
                published: published === false ? 'false' : 'true',
            });

            return res.status(201).json({ success: true, data: service });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
