/**
 * POST /api/contact
 * Menerima pesan dari contact form dan menyimpannya ke Google Sheets.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createMessage } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body ?? {};

    // Validasi input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Nama harus diisi' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Email tidak valid' });
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Subject harus diisi' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Pesan harus diisi' });
    }

    // Batasi panjang untuk mencegah abuse
    if (name.length > 100) return res.status(400).json({ success: false, error: 'Nama terlalu panjang' });
    if (subject.length > 200) return res.status(400).json({ success: false, error: 'Subject terlalu panjang' });
    if (message.length > 5000) return res.status(400).json({ success: false, error: 'Pesan terlalu panjang' });

    try {
        await createMessage({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
        });

        return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim' });
    } catch (error) {
        console.error('[/api/contact] Error:', error);
        return res.status(500).json({ success: false, error: 'Gagal mengirim pesan. Coba lagi.' });
    }
}
