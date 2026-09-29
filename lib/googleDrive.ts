/**
 * Google Drive Helper
 *
 * Versi ini menggunakan pendekatan link langsung (Direct Link) dari Google Drive.
 * User mengupload gambar manual ke Google Drive, lalu paste link/ID-nya ke admin panel.
 *
 * Keuntungan: tidak butuh service account Drive, lebih simpel.
 * Kekurangan: tidak ada delete otomatis saat project dihapus.
 */

// ── URL Helpers ───────────────────────────────────────────────────────────────

/**
 * Ubah URL Share / File ID Google Drive menjadi Direct Image URL.
 * Mendukung format:
 *   - File ID langsung:       1ABC...xyz
 *   - URL /d/ format:         https://drive.google.com/file/d/1ABC.../view
 *   - URL ?id= format:        https://drive.google.com/uc?id=1ABC...
 *   - URL lh3 (sudah direct): https://lh3.googleusercontent.com/d/...
 *   - URL non-Drive biasa:    https://example.com/image.jpg (dikembalikan apa adanya)
 */
export function getPublicUrl(inputUrlOrId: string): string {
  if (!inputUrlOrId) return '';

  const input = inputUrlOrId.trim();

  // URL non-Drive — kembalikan apa adanya
  if (input.startsWith('http') && !input.includes('drive.google.com') && !input.includes('googleusercontent.com')) {
    return input;
  }

  // Sudah berupa URL direct lh3 — kembalikan apa adanya
  if (input.includes('lh3.googleusercontent.com')) {
    return input;
  }

  // Ekstrak file ID dari berbagai format URL Drive
  const match =
    input.match(/\/d\/([a-zA-Z0-9_-]+)/) ||   // /d/{id}/view
    input.match(/[?&]id=([a-zA-Z0-9_-]+)/);   // ?id={id} atau &id={id}

  const fileId = match ? match[1] : input;

  // Gunakan CDN lh3 — paling cepat dan stabil untuk embedding
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * URL thumbnail berukuran lebih kecil dari Google Drive.
 * Cocok untuk card preview / thumbnail list.
 */
export function getThumbnailUrl(inputUrlOrId: string, size = 400): string {
  if (!inputUrlOrId) return '';

  const input = inputUrlOrId.trim();
  const match =
    input.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    input.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  const fileId = match ? match[1] : input;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Ekstrak File ID dari URL Google Drive berbagai format.
 * Berguna untuk menyimpan hanya file ID ke database.
 */
export function extractFileId(inputUrlOrId: string): string {
  if (!inputUrlOrId) return '';
  const input = inputUrlOrId.trim();
  const match =
    input.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input;
}

// ── Stub functions ────────────────────────────────────────────────────────────
// Stub ini ada agar API routes yang masih referensi deleteFile/deleteFiles
// tidak crash. Karena workflow sekarang pakai direct link (bukan upload via API),
// delete file di Drive harus dilakukan manual oleh user.

/**
 * Stub: delete file dari Drive.
 * Pada workflow direct-link ini, file tidak dihapus otomatis.
 * User perlu hapus manual dari Google Drive jika diperlukan.
 */
export async function deleteFile(fileId: string): Promise<void> {
  // No-op: workflow direct-link tidak perlu delete via API
  console.warn(`[googleDrive] deleteFile dipanggil untuk ${fileId} — no-op (gunakan workflow upload API untuk delete otomatis)`);
}

/**
 * Stub: delete multiple files dari Drive.
 */
export async function deleteFiles(fileIds: string[]): Promise<void> {
  // No-op
  if (fileIds.length > 0) {
    console.warn(`[googleDrive] deleteFiles dipanggil untuk ${fileIds.length} file — no-op`);
  }
}
