/**
 * GET    /api/admin/projects/[id]  → Detail project + images
 * PUT    /api/admin/projects/[id]  → Update project
 * DELETE /api/admin/projects/[id]  → Hapus project + semua images
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import {
    getProjectById,
    updateProject,
    deleteProject,
    getProjectImages,
    deleteProjectImagesByProjectId,
} from '../../../../lib/googleSheets';
import { deleteFile, deleteFiles, getPublicUrl } from '../../../../lib/googleDrive';
import slugify from 'slugify';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID tidak valid' });
    }

    if (req.method === 'GET') {
        try {
            const project = await getProjectById(id);
            if (!project) return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });

            const images = await getProjectImages(id);
            return res.status(200).json({
                success: true,
                data: {
                    ...project,
                    thumbnail_url: project.thumbnail ? getPublicUrl(project.thumbnail) : null,
                    images: images.map((img) => ({
                        ...img,
                        url: getPublicUrl(img.image),
                    })),
                },
            });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'PUT') {
        try {
            const project = await getProjectById(id);
            if (!project) return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });

            const {
                title,
                slug: rawSlug,
                description,
                technologies,
                thumbnail,
                github_url,
                demo_url,
                featured,
                published,
                sort_order,
            } = req.body ?? {};

            const updates: Record<string, string> = {};

            if (title !== undefined) updates.title = String(title).trim();
            if (rawSlug !== undefined) {
                updates.slug = slugify(String(rawSlug).trim(), { lower: true, strict: true });
            }
            if (description !== undefined) updates.description = String(description).trim();
            if (technologies !== undefined) updates.technologies = String(technologies).trim();
            if (thumbnail !== undefined) updates.thumbnail = String(thumbnail).trim();
            if (github_url !== undefined) updates.github_url = String(github_url).trim();
            if (demo_url !== undefined) updates.demo_url = String(demo_url).trim();
            if (featured !== undefined) updates.featured = featured === true || featured === 'true' ? 'true' : 'false';
            if (published !== undefined) updates.published = published === true || published === 'true' ? 'true' : 'false';
            if (sort_order !== undefined) updates.sort_order = String(sort_order);

            await updateProject(id, updates);
            return res.status(200).json({ success: true, message: 'Project berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'DELETE') {
        try {
            const project = await getProjectById(id);
            if (!project) return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });

            // Ambil semua gallery images
            const images = await getProjectImages(id);

            // Kumpulkan semua file ID yang perlu dihapus dari Drive
            const fileIdsToDelete: string[] = [];
            if (project.thumbnail) fileIdsToDelete.push(project.thumbnail);
            images.forEach((img) => { if (img.image) fileIdsToDelete.push(img.image); });

            // Hapus semua file dari Drive (parallel, error per file tidak menghentikan proses)
            if (fileIdsToDelete.length > 0) {
                await deleteFiles(fileIdsToDelete);
            }

            // Hapus semua Project_Images dari Sheets
            await deleteProjectImagesByProjectId(id);

            // Hapus project dari Sheets
            await deleteProject(id);

            return res.status(200).json({ success: true, message: 'Project berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
