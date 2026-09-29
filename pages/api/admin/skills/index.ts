/**
 * GET  /api/admin/skills  → List semua skills
 * POST /api/admin/skills  → Tambah skill baru
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getSkills, createSkill } from '../../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const skills = await getSkills();
            const sorted = skills.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
            return res.status(200).json({ success: true, data: sorted });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, category, level, icon, sort_order, published } = req.body ?? {};

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Name harus diisi' });
            }
            if (level !== undefined && (Number(level) < 0 || Number(level) > 100)) {
                return res.status(400).json({ success: false, error: 'Level harus antara 0-100' });
            }

            let order = sort_order;
            if (!order) {
                const existing = await getSkills();
                order = String(existing.length + 1);
            }

            const skill = await createSkill({
                name: name.trim(),
                category: (category ?? '').trim(),
                level: String(level ?? 0),
                icon: (icon ?? '').trim(),
                sort_order: String(order),
                published: published === false ? 'false' : 'true',
            });

            return res.status(201).json({ success: true, data: skill });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
