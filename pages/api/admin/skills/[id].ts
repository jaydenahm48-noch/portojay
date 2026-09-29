/**
 * PUT    /api/admin/skills/[id]  → Update skill
 * DELETE /api/admin/skills/[id]  → Hapus skill
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { updateSkill, deleteSkill } from '../../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID tidak valid' });
    }

    if (req.method === 'PUT') {
        try {
            const { name, category, level, icon, sort_order, published } = req.body ?? {};
            const updates: Record<string, string> = {};

            if (name !== undefined) updates.name = String(name).trim();
            if (category !== undefined) updates.category = String(category).trim();
            if (level !== undefined) {
                if (Number(level) < 0 || Number(level) > 100) {
                    return res.status(400).json({ success: false, error: 'Level harus antara 0-100' });
                }
                updates.level = String(level);
            }
            if (icon !== undefined) updates.icon = String(icon).trim();
            if (sort_order !== undefined) updates.sort_order = String(sort_order);
            if (published !== undefined) updates.published = published === true || published === 'true' ? 'true' : 'false';

            await updateSkill(id, updates);
            return res.status(200).json({ success: true, message: 'Skill berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'DELETE') {
        try {
            await deleteSkill(id);
            return res.status(200).json({ success: true, message: 'Skill berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
