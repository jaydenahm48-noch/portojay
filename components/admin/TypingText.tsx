import React, { useState, useEffect, useRef } from 'react';

interface TypingTextProps {
  roles?: string[];
}

export default function TypingText({
  roles = ["Programmer", "Fullstack Dev", "Problem Solver"]
}: TypingTextProps) {
  const [text, setText] = useState('');
  const roleIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const type = () => {
      // 1. Safety check jika array kosong
      if (!roles || roles.length === 0) return;

      // 2. Safety check agar index tidak out-of-bounds
      if (roleIndexRef.current >= roles.length) {
        roleIndexRef.current = 0;
        charIndexRef.current = 0;
      }

      const currentRole = roles[roleIndexRef.current] || '';

      if (!isDeletingRef.current) {
        // Menambah karakter
        charIndexRef.current += 1;
        setText(currentRole.slice(0, charIndexRef.current));

        if (charIndexRef.current >= currentRole.length) {
          // Jika kata selesai diketik, tunggu 2 detik sebelum mulai menghapus
          isDeletingRef.current = true;
          timer = setTimeout(type, 2000);
          return;
        }
        timer = setTimeout(type, 100);
      } else {
        // Mengurangi karakter
        charIndexRef.current -= 1;
        setText(currentRole.slice(0, charIndexRef.current));

        if (charIndexRef.current <= 0) {
          // Jika kata habis dihapus, ganti ke kata berikutnya
          isDeletingRef.current = false;
          roleIndexRef.current = (roleIndexRef.current + 1) % roles.length;
          timer = setTimeout(type, 500);
          return;
        }
        timer = setTimeout(type, 50);
      }
    };

    timer = setTimeout(type, 100);

    return () => clearTimeout(timer);
  }, [roles]);

  return (
    <span className="text-pink-500 font-bold border-r-2 border-pink-500 animate-pulse ml-1 inline-block">
      {text}
    </span>
  );
}