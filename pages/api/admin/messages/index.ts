/**
 * GET /api/admin/messages → List semua messages (newest first)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getMessages } from '../../../../lib/googleSheets';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const messages = await getMessages();
        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        return handleApiError(res, error);
    }
});
