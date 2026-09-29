/**
 * _app.tsx
 *
 * globals.css di-import di sini agar Tailwind tersedia untuk semua halaman.
 * Namun Tailwind di-scope hanya untuk elemen dalam .admin-root via
 * tailwind.config.js — sehingga tidak konflik dengan CSS public frontend.
 */

import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
