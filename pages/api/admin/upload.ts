import type { NextApiRequest, NextApiResponse } from 'next';
import { getPublicUrl } from '@/lib/googleDrive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { driveUrl } = req.body;

        if (!driveUrl) {
            return res.status(400).json({ success: false, error: 'Link Google Drive wajib diisi' });
        }

        const publicUrl = getPublicUrl(driveUrl);

        return res.status(200).json({
            success: true,
            data: {
                url: publicUrl,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}