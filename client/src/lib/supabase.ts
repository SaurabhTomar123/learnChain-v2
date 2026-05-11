import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Keep the shared client flexible because this app uses legacy tables and joined
// Supabase response shapes that are broader than the hand-written Database type.
export const supabase = createClient(url, key);
