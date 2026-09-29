/**
 * GET    /api/admin/projects/[id]/images     → List gallery images project
 * POST   /api/admin/projects/[id]/images     → Tambah gallery image (sudah diupload ke Drive)
 * DELETE /api/admin/projects/[id]/images     → Hapus gallery image by imageId (di body)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../../lib/withAdminAuth';
import {
    getProjectById,
    getProjectImages,
    createProjectImage,
    deleteProjectImage,
    updateProjectImage,
} from '../../../../../lib/googleSheets';
import { deleteFile, getPublicUrl } from '../../../../../lib/googleDrive';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Project ID tidak valid' });
    }

    // Pastikan project ada
    const project = await getProjectById(id).catch(() => null);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });
    }

    // ── GET: list semua images ──────────────────────────────────────────────────
    if (req.method === 'GET') {
        try {
            const images = await getProjectImages(id);
            return res.status(200).json({
                success: true,
                data: images.map((img) => ({
                    ...img,
                    url: getPublicUrl(img.image),
                })),
            });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    // ── POST: tambah image baru (file sudah diupload, kirim fileId) ─────────────
    if (req.method === 'POST') {
        try {
            const { image, caption, sort_order } = req.body ?? {};

            if (!image || typeof image !== 'string' || image.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Image file ID harus diisi' });
            }

            // Hitung sort_order otomatis jika tidak diberikan
            let order = sort_order;
            if (!order) {
                const existing = await getProjectImages(id);
                order = existing.length + 1;
            }

            const img = await createProjectImage({
                project_id: id,
                image: image.trim(),
                caption: (caption ?? '').trim(),
                sort_order: String(order),
            });

            return res.status(201).json({
                success: true,
                data: { ...img, url: getPublicUrl(img.image) },
            });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    // ── PUT: update caption atau sort_order image tertentu ──────────────────────
    if (req.method === 'PUT') {
        try {
            const { imageId, caption, sort_order } = req.body ?? {};

            if (!imageId || typeof imageId !== 'string') {
                return res.status(400).json({ success: false, error: 'imageId harus diisi' });
            }

            const updates: Record<string, string> = {};
            if (caption !== undefined) updates.caption = String(caption).trim();
            if (sort_order !== undefined) updates.sort_order = String(sort_order);

            await updateProjectImage(imageId, updates);
            return res.status(200).json({ success: true, message: 'Image berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    // ── DELETE: hapus satu image ────────────────────────────────────────────────
    if (req.method === 'DELETE') {
        try {
            const { imageId } = req.body ?? {};

            if (!imageId || typeof imageId !== 'string') {
                return res.status(400).json({ success: false, error: 'imageId harus diisi' });
            }

            // Hapus dari Sheets dan dapatkan data (untuk file ID Drive)
            const deleted = await deleteProjectImage(imageId);

            // Hapus file dari Drive
            if (deleted.image) {
                try {
                    await deleteFile(deleted.image);
                } catch {
                    // Ignore jika file Drive sudah tidak ada
                }
            }

            return res.status(200).json({ success: true, message: 'Image berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
