/**
 * Script: init-drive.js
 * 
 * Inisialisasi struktur folder di Google Drive.
 * Jalankan SEKALI setelah setup credentials.
 * 
 * PRASYARAT:
 * 1. .env.local sudah diisi lengkap
 * 2. GOOGLE_DRIVE_ROOT_FOLDER_ID sudah diisi (buat folder "noch-portfolio" di Drive dulu,
 *    lalu share ke service account sebagai Editor, ambil folder ID dari URL)
 * 
 * Cara pakai:
 *   node scripts/init-drive.js
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
const EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!ROOT_FOLDER_ID || !EMAIL || !KEY) {
    console.error('❌ Environment variables tidak lengkap. Periksa .env.local');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    credentials: { client_email: EMAIL, private_key: KEY },
    scopes: ['https://www.googleapis.com/auth/drive'],
});

async function findFolder(drive, name, parentId) {
    const res = await drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    return res.data.files?.[0]?.id ?? null;
}

async function getOrCreateFolder(drive, name, parentId) {
    const existing = await findFolder(drive, name, parentId);
    if (existing) {
        console.log(`  ⏭  Folder "${name}" sudah ada (${existing})`);
        return existing;
    }
    const res = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
    });
    console.log(`  ✅ Folder "${name}" dibuat (${res.data.id})`);
    return res.data.id;
}

async function run() {
    const drive = google.drive({ version: 'v3', auth });

    console.log('\n🚀 Memulai inisialisasi Google Drive folder structure...\n');
    console.log(`📁 Root folder ID: ${ROOT_FOLDER_ID}`);

    // Verifikasi root folder bisa diakses
    try {
        await drive.files.get({ fileId: ROOT_FOLDER_ID, fields: 'id, name' });
        console.log('✅ Root folder dapat diakses\n');
    } catch {
        console.error('❌ Root folder tidak bisa diakses. Pastikan:');
        console.error('   - GOOGLE_DRIVE_ROOT_FOLDER_ID benar');
        console.error('   - Folder sudah di-share ke service account sebagai Editor');
        process.exit(1);
    }

    console.log('📂 Membuat struktur folder:');

    // Buat folder utama
    const profileId = await getOrCreateFolder(drive, 'profile', ROOT_FOLDER_ID);
    const servicesId = await getOrCreateFolder(drive, 'services', ROOT_FOLDER_ID);
    const projectsId = await getOrCreateFolder(drive, 'projects', ROOT_FOLDER_ID);

    console.log('\n🎉 Struktur folder berhasil dibuat!\n');
    console.log('Folder IDs (untuk referensi):');
    console.log(`  profile:  ${profileId}`);
    console.log(`  services: ${servicesId}`);
    console.log(`  projects: ${projectsId}`);
    console.log('\nLangkah selanjutnya:');
    console.log('  1. Jalankan: npm run dev');
    console.log('  2. Buka http://localhost:3000/admin/login\n');
}

run().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
