/** @type {import('tailwindcss').Config} */
module.exports = {
    /**
     * Tailwind di-scope ke class .admin-root saja.
     * Dengan cara ini Tailwind base/reset TIDAK merusak CSS public frontend
     * (yang menggunakan class-class seperti .section, .row, .btn, dll).
     * 
     * Semua halaman admin dibungkus <div class="admin-root"> di AdminLayout.tsx.
     * Halaman login juga dibungkus manual.
     */
    important: '.admin-root',
    content: [
        './pages/admin/**/*.{js,ts,jsx,tsx}',
        './components/admin/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
