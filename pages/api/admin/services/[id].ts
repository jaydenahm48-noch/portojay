/**
 * PUT    /api/admin/services/[id]  → Update service
 * DELETE /api/admin/services/[id]  → Hapus service
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { updateService, deleteService, getServices } from '../../../../lib/googleSheets';
import { deleteFile } from '../../../../lib/googleDrive';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID tidak valid' });
    }

    if (req.method === 'GET') {
        try {
            const services = await getServices();
            const service = services.find((s) => s.id === id);
            if (!service) return res.status(404).json({ success: false, error: 'Service tidak ditemukan' });
            return res.status(200).json({ success: true, data: service });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'PUT') {
        try {
            const { title, description, icon, image, sort_order, published } = req.body ?? {};
            const updates: Record<string, string> = {};

            if (title !== undefined) updates.title = String(title).trim();
            if (description !== undefined) updates.description = String(description).trim();
            if (icon !== undefined) updates.icon = String(icon).trim();
            if (image !== undefined) updates.image = String(image).trim();
            if (sort_order !== undefined) updates.sort_order = String(sort_order);
            if (published !== undefined) updates.published = published === true || published === 'true' ? 'true' : 'false';

            await updateService(id, updates);
            return res.status(200).json({ success: true, message: 'Service berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Ambil data service untuk hapus image di Drive jika ada
            const services = await getServices();
            const service = services.find((s) => s.id === id);
            if (!service) return res.status(404).json({ success: false, error: 'Service tidak ditemukan' });

            // Hapus image dari Drive jika ada
            if (service.image) {
                try {
                    await deleteFile(service.image);
                } catch {
                    // Ignore error hapus file
                }
            }

            await deleteService(id);
            return res.status(200).json({ success: true, message: 'Service berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
