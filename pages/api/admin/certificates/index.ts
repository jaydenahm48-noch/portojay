/**
 * GET  /api/admin/certificates  → List semua certificates
 * POST /api/admin/certificates  → Tambah certificate baru
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, handleApiError } from '../../../../lib/withAdminAuth';
import { getCertificates, createCertificate, SHEETS } from '../../../../lib/googleSheets';
import { getPublicUrl } from '../../../../lib/googleDrive';

// Header kolom untuk sheet Certificates
const CERT_HEADERS = ['id', 'title', 'description', 'issuer', 'image', 'issued_date', 'credential_url', 'published', 'sort_order'];

/**
 * Pastikan sheet Certificates sudah punya header row.
 * Dipanggil sebelum insert data pertama kali.
 */
async function ensureCertificatesHeader(): Promise<void> {
    try {
        const { google } = await import('googleapis');
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: email, private_key: key },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

        // Cek apakah header sudah ada
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEETS.CERTIFICATES}!A1:Z1`,
        }).catch(() => ({ data: { values: [] } }));

        const firstRow = res.data.values?.[0] ?? [];
        if (firstRow.length === 0) {
            // Tulis header
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${SHEETS.CERTIFICATES}!A1`,
                valueInputOption: 'RAW',
                requestBody: { values: [CERT_HEADERS] },
            });
        }
    } catch {
        // Ignore — getSheetRows akan handle auto-create sheet
    }
}

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const certs = await getCertificates();
            const sorted = certs.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
            const data = sorted.map((c) => ({
                ...c,
                image_url: c.image ? getPublicUrl(c.image) : null,
            }));
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, description, issuer, image, issued_date, credential_url, published, sort_order } = req.body ?? {};

            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({ success: false, error: 'Title harus diisi' });
            }

            // Pastikan header sudah ada sebelum insert pertama kali
            await ensureCertificatesHeader();

            let order = sort_order;
            if (!order) {
                const existing = await getCertificates();
                order = String(existing.length + 1);
            }

            const cert = await createCertificate({
                title: title.trim(),
                description: (description ?? '').trim(),
                issuer: (issuer ?? '').trim(),
                image: (image ?? '').trim(),
                issued_date: (issued_date ?? '').trim(),
                credential_url: (credential_url ?? '').trim(),
                published: published === false || published === 'false' ? 'false' : 'true',
                sort_order: String(order),
            });

            return res.status(201).json({ success: true, data: cert });
        } catch (error) {
            return handleApiError(res, error);
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
});
