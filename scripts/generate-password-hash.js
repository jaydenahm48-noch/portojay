/**
 * Script: generate-password-hash.js
 * 
 * Gunakan script ini untuk membuat ADMIN_PASSWORD_HASH yang perlu dimasukkan
 * ke environment variable.
 * 
 * Cara pakai:
 *   node scripts/generate-password-hash.js
 * 
 * Atau dengan password langsung:
 *   node scripts/generate-password-hash.js mySecretPassword123
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const password = process.argv[2];

async function generateHash(pwd) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log('\n✅ Password hash berhasil dibuat!\n');
    console.log('Salin nilai berikut ke file .env.local:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('\n⚠️  JANGAN share hash ini secara publik.');
    console.log('⚠️  JANGAN commit file .env.local ke git.\n');
}

if (password) {
    generateHash(password);
} else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Masukkan password admin: ', async (pwd) => {
        rl.close();
        if (!pwd || pwd.trim().length < 6) {
            console.error('❌ Password minimal 6 karakter');
            process.exit(1);
        }
        await generateHash(pwd.trim());
    });
}
