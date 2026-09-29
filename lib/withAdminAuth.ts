/**
 * Higher-order function untuk melindungi API Routes admin.
 * Wrap setiap handler dengan withAdminAuth() untuk memastikan
 * hanya request dengan JWT valid yang bisa mengakses endpoint.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkAdminAuth } from './auth';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Middleware wrapper untuk admin API routes.
 *
 * Usage:
 * export default withAdminAuth(async (req, res) => {
 *   // handler logic
 * });
 */
export function withAdminAuth(handler: ApiHandler): ApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const payload = await checkAdminAuth(req);

        if (!payload) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized. Silakan login terlebih dahulu.',
            });
        }

        return handler(req, res);
    };
}

/**
 * Helper untuk menangani error di API routes secara konsisten.
 */
export function handleApiError(res: NextApiResponse, error: unknown, defaultMessage = 'Terjadi kesalahan server'): void {
    console.error('[API Error]:', error);
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(500).json({ success: false, error: message });
}
