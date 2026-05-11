import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;background:#f9fafb">
      <div style="max-width:480px;text-align:center">
        <p style="font-size:2rem;margin:0 0 1rem">⚙️</p>
        <h1 style="font-size:1.25rem;font-weight:700;color:#111;margin:0 0 0.5rem">Missing environment variables</h1>
        <p style="color:#6b7280;font-size:0.875rem;margin:0 0 1rem">
          <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">VITE_SUPABASE_URL</code> and
          <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">VITE_SUPABASE_PUBLISHABLE_KEY</code>
          must be set in your Vercel project environment variables.
        </p>
        <p style="color:#9ca3af;font-size:0.75rem">After adding them, redeploy from the Vercel dashboard.</p>
      </div>
    </div>`;
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required");
}

export const supabase = createClient(url, key);
