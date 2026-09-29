/**
 * GET /api/portfolio
 * Mengembalikan daftar project yang sudah published, diurutkan by sort_order.
 * Digunakan oleh public frontend.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjects } from '../../../lib/googleSheets';
import { getPublicUrl } from '../../../lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const allProjects = await getProjects();

        // Filter hanya yang published, sort by sort_order
        const published = allProjects
            .filter((p) => p.published === 'true')
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));

        // Transform: resolve thumbnail URL dari file ID
        const data = published.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            technologies: p.technologies,
            thumbnail: p.thumbnail ? getPublicUrl(p.thumbnail) : '/images/port.jpg',
            github_url: p.github_url,
            demo_url: p.demo_url,
            featured: p.featured === 'true',
        }));

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[/api/portfolio] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal memuat portfolio' });
    }
}
