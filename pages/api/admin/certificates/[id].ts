/**
 * GET    /api/admin/certificates/[id]  → Detail certificate
 * PUT    /api/admin/certificates/[id]  → Update certificate
 * DELETE /api/admin/certificates/[id]  → Hapus certificate
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getCertificateById, updateCertificate, deleteCertificate } from '../../../../lib/googleSheets';
import { getPublicUrl } from '../../../../lib/googleDrive';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'ID tidak valid' });
    }

    if (req.method === 'GET') {
        try {
            const cert = await getCertificateById(id);
            if (!cert) return res.status(404).json({ success: false, error: 'Certificate tidak ditemukan' });
            return res.status(200).json({
                success: true,
                data: { ...cert, image_url: cert.image ? getPublicUrl(cert.image) : null },
            });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'PUT') {
        try {
            const { title, description, issuer, image, issued_date, credential_url, published, sort_order } = req.body ?? {};
            const updates: Record<string, string> = {};

            if (title !== undefined) updates.title = String(title).trim();
            if (description !== undefined) updates.description = String(description).trim();
            if (issuer !== undefined) updates.issuer = String(issuer).trim();
            if (image !== undefined) updates.image = String(image).trim();
            if (issued_date !== undefined) updates.issued_date = String(issued_date).trim();
            if (credential_url !== undefined) updates.credential_url = String(credential_url).trim();
            if (published !== undefined) updates.published = published === true || published === 'true' ? 'true' : 'false';
            if (sort_order !== undefined) updates.sort_order = String(sort_order);

            await updateCertificate(id, updates);
            return res.status(200).json({ success: true, message: 'Certificate berhasil diupdate' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'DELETE') {
        try {
            await deleteCertificate(id);
            return res.status(200).json({ success: true, message: 'Certificate berhasil dihapus' });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
