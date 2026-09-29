/**
 * Script: generate-jwt-secret.js
 * 
 * Generate JWT_SECRET yang aman (64 bytes random).
 * 
 * Cara pakai:
 *   node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ JWT Secret berhasil dibuat!\n');
console.log('Salin nilai berikut ke file .env.local:\n');
console.log(`JWT_SECRET=${secret}`);
console.log('\n⚠️  JANGAN share secret ini secara publik.\n');
