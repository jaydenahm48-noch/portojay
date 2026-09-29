/**
 * GET /api/portfolio/[slug]
 * Mengembalikan detail project + gallery images berdasarkan slug.
 * Digunakan oleh public frontend untuk modal detail portfolio.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectBySlug, getProjectImages } from '../../../lib/googleSheets';
import { getPublicUrl } from '../../../lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ success: false, error: 'Slug tidak valid' });
    }

    try {
        const project = await getProjectBySlug(slug);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });
        }

        if (project.published !== 'true') {
            return res.status(404).json({ success: false, error: 'Project tidak ditemukan' });
        }

        // Ambil gallery images
        const images = await getProjectImages(project.id);

        const data = {
            id: project.id,
            title: project.title,
            slug: project.slug,
            description: project.description,
            technologies: project.technologies,
            thumbnail: project.thumbnail ? getPublicUrl(project.thumbnail) : '/images/port.jpg',
            github_url: project.github_url,
            demo_url: project.demo_url,
            featured: project.featured === 'true',
            images: images.map((img) => ({
                id: img.id,
                url: getPublicUrl(img.image),
                caption: img.caption,
                sort_order: Number(img.sort_order),
            })),
        };

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[/api/portfolio/[slug]] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal memuat detail project' });
    }
}
