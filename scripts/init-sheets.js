/**
 * Script: init-sheets.js
 * 
 * Inisialisasi Google Sheets dengan membuat header row untuk setiap sheet.
 * Jalankan SEKALI saat pertama kali setup project.
 * 
 * PRASYARAT:
 * 1. Buat file .env.local dengan isi dari .env.example
 * 2. Buat Spreadsheet di Google Sheets, share ke service account (Editor)
 * 3. Set GOOGLE_SPREADSHEET_ID di .env.local
 * 
 * Cara pakai:
 *   node scripts/init-sheets.js
 *
 * Script ini akan membuat tab/sheet berikut jika belum ada:
 *   - Profile
 *   - Skills
 *   - Services
 *   - Projects
 *   - Project_Images
 *   - Messages
 */

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !EMAIL || !KEY) {
    console.error('❌ Environment variables tidak lengkap. Periksa .env.local');
    process.exit(1);
}

const auth = new google.auth.GoogleAuth({
    credentials: { client_email: EMAIL, private_key: KEY },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_HEADERS = {
    Profile: ['key', 'value'],
    Skills: ['id', 'name', 'category', 'level', 'icon', 'sort_order', 'published'],
    Services: ['id', 'title', 'description', 'icon', 'image', 'sort_order', 'published'],
    Projects: [
        'id', 'title', 'slug', 'description', 'technologies',
        'thumbnail', 'github_url', 'demo_url', 'featured', 'published',
        'sort_order', 'created_at', 'updated_at'
    ],
    Project_Images: ['id', 'project_id', 'image', 'caption', 'sort_order', 'created_at'],
    Messages: ['id', 'name', 'email', 'subject', 'message', 'created_at', 'status'],
};

const PROFILE_INITIAL_DATA = [
    ['name', 'Jayden Noch'],
    ['role', 'Programmer'],
    ['bio', 'I am a passionate fresh graduate and beginner programmer.'],
    ['email', 'zaidanahmad005@gmail.com'],
    ['phone', '+62 813 751 3615'],
    ['location', 'Yogyakarta'],
    ['website', 'www.noch.com'],
    ['instagram', '@jayden.noch'],
    ['github', ''],
    ['linkedin', ''],
    ['profile_image', ''],
    ['cv_file', ''],
    ['freelance', 'Available'],
];

async function run() {
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\n🚀 Memulai inisialisasi Google Sheets...\n');

    // Ambil daftar sheet yang sudah ada
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = meta.data.sheets?.map(s => s.properties?.title) ?? [];
    console.log('📋 Sheet yang sudah ada:', existingSheets.join(', ') || '(kosong)');

    // Buat sheet yang belum ada
    const sheetsToCreate = Object.keys(SHEET_HEADERS).filter(name => !existingSheets.includes(name));

    if (sheetsToCreate.length > 0) {
        console.log('\n📝 Membuat sheet baru:', sheetsToCreate.join(', '));
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: sheetsToCreate.map(title => ({
                    addSheet: { properties: { title } }
                }))
            }
        });
        console.log('✅ Sheet berhasil dibuat');
    }

    // Set header row untuk setiap sheet
    console.log('\n📋 Mengisi header row...');
    for (const [sheetName, headers] of Object.entries(SHEET_HEADERS)) {
        // Cek apakah baris pertama sudah ada
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:Z1`,
        });

        const firstRow = res.data.values?.[0] ?? [];

        if (firstRow.length === 0) {
            // Tulis header
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                requestBody: { values: [headers] }
            });
            console.log(`  ✅ ${sheetName}: header ditulis`);
        } else if (firstRow[0] === headers[0]) {
            console.log(`  ⏭  ${sheetName}: header sudah ada, skip`);
        } else {
            console.log(`  ⚠️  ${sheetName}: baris pertama ada isinya tapi bukan header — skip (periksa manual)`);
        }
    }

    // Isi data awal Profile jika masih kosong
    console.log('\n👤 Mengisi data Profile awal...');
    const profileRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Profile!A1:B50',
    });
    const profileRows = profileRes.data.values ?? [];

    if (profileRows.length <= 1) {
        // Hanya header, belum ada data
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Profile!A1',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: PROFILE_INITIAL_DATA }
        });
        console.log('  ✅ Data Profile awal berhasil diisi');
    } else {
        console.log('  ⏭  Profile sudah ada data, skip');
    }

    console.log('\n🎉 Inisialisasi selesai!\n');
    console.log('Langkah selanjutnya:');
    console.log('  1. Buka Google Sheets dan verifikasi semua tab sudah ada');
    console.log('  2. Jalankan: node scripts/init-drive.js (untuk inisialisasi folder Drive)');
    console.log('  3. Jalankan: npm run dev');
    console.log('  4. Buka http://localhost:3000/admin/login\n');
}

run().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
