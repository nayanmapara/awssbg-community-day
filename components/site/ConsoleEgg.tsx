'use client';
import { useEffect } from 'react';

/** Easter egg: a styled greeting for anyone who opens dev tools. */
export function ConsoleEgg() {
  useEffect(() => {
    const mono = 'font-family:monospace;';
    console.log('%cAWS Student Builder Group', `color:#4da8ff;font-size:18px;font-weight:bold;${mono}`);
    console.log('%cPoking around? We like that in a builder. Join us: https://discord.com/invite/TfzbXUCp3y', `color:#8b96ab;${mono}`);
    console.log('%cThis page has a secret or two — the logo rewards persistence.', `color:#e6b85c;${mono}`);
  }, []);
  return null;
}
