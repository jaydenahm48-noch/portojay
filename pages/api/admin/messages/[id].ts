/**
 * GET    /api/admin/messages/[id]  → Detail message
 * PUT    /api/admin/messages/[id]  → Update status
 * DELETE /api/admin/messages/[id]  → Hapus message
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getMessageById, updateMessageStatus, deleteMessage } from '../../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID tidak valid' });
    }

    if (req.method === 'GET') {
        try {
            const message = await getMessageById(id);
            if (!message) return res.status(404).json({ success: false, error: 'Pesan tidak ditemukan' });
            return res.status(200).json({ success: true, data: message });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'PUT') {
        try {
            const { status } = req.body ?? {};
            const validStatuses = ['unread', 'read', 'archived'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({ success: false, error: `Status harus salah satu dari: ${validStatuses.join(', ')}` });
            }
            await updateMessageStatus(id, status);
            return res.status(200).json({ success: true, message: 'Status berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'DELETE') {
        try {
            await deleteMessage(id);
            return res.status(200).json({ success: true, message: 'Pesan berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
