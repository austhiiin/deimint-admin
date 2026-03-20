import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Commission, GalleryItem, ContactMessage, SiteSetting } from "@/types";

// ── Commissions ───────────────────────────────────────────────
export function useCommissions() {
  const [data, setData]       = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from("commissions")
      .select("*")
      .order("queue_pos", { ascending: true })
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setData(rows as Commission[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (payload: Record<string, unknown>) => {
    const { error } = await supabase.from("commissions").insert([payload]);
    if (error) throw error;
    await fetch();
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    const { error } = await supabase.from("commissions").update(payload).eq("id", id);
    if (error) throw error;
    await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("commissions").delete().eq("id", id);
    if (error) throw error;
    await fetch();
  };

  return { data, loading, error, refetch: fetch, create, update, remove };
}

// ── Gallery ───────────────────────────────────────────────────
export function useGalleryAdmin() {
  const [data, setData]       = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setData(rows as GalleryItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (payload: Omit<GalleryItem, "id" | "created_at" | "updated_at" | "src" | "alt">) => {
    const { error } = await supabase.from("gallery_items").insert([payload]);
    if (error) throw error;
    await fetch();
  };

  const update = async (id: string, payload: Partial<GalleryItem>) => {
    const { error } = await supabase.from("gallery_items").update(payload).eq("id", id);
    if (error) throw error;
    await fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) throw error;
    await fetch();
  };

  return { data, loading, error, refetch: fetch, create, update, remove };
}

// ── Messages ──────────────────────────────────────────────────
export function useMessages() {
  const [data, setData]       = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setData((rows ?? []) as ContactMessage[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: string, read: boolean) => {
    await supabase.from("contact_messages").update({ read }).eq("id", id);
    await fetch();
  };

  const remove = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    await fetch();
  };

  return { data, loading, refetch: fetch, markRead, remove };
}

// ── Settings ──────────────────────────────────────────────────
export function useSiteSettings() {
  const [data, setData]       = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (rows as SiteSetting[] ?? []).forEach(r => { if (r.value) map[r.key] = r.value; });
    setData(map);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    await fetch();
  };

  const saveMany = async (updates: Record<string, string>) => {
    const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
    await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    await fetch();
  };

  return { data, loading, refetch: fetch, save, saveMany };
}