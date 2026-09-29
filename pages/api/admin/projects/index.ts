/**
 * GET  /api/admin/projects  → List semua projects (termasuk unpublished)
 * POST /api/admin/projects  → Tambah project baru
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getProjects, createProject } from '../../../../lib/googleSheets';
import { getPublicUrl } from '../../../../lib/googleDrive';
import slugify from 'slugify';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const projects = await getProjects();
            const sorted = projects.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
            const data = sorted.map((p) => ({
                ...p,
                thumbnail_url: p.thumbnail ? getPublicUrl(p.thumbnail) : null,
            }));
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
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

            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title harus diisi' });
            }

            // Auto-generate slug jika tidak diberikan
            const slug = rawSlug?.trim()
                ? slugify(rawSlug.trim(), { lower: true, strict: true })
                : slugify(title.trim(), { lower: true, strict: true });

            // Cek duplikat slug
            const existing = await getProjects();
            if (existing.some((p) => p.slug === slug)) {
                return res.status(400).json({ success: false, error: `Slug "${slug}" sudah digunakan` });
            }

            let order = sort_order;
            if (!order) {
                order = String(existing.length + 1);
            }

            const project = await createProject({
                title: title.trim(),
                slug,
                description: (description ?? '').trim(),
                technologies: (technologies ?? '').trim(),
                thumbnail: (thumbnail ?? '').trim(),
                github_url: (github_url ?? '').trim(),
                demo_url: (demo_url ?? '').trim(),
                featured: featured === true || featured === 'true' ? 'true' : 'false',
                published: published === false || published === 'false' ? 'false' : 'true',
                sort_order: String(order),
            });

            return res.status(201).json({ success: true, data: project });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
