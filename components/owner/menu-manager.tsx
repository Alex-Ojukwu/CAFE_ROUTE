"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { revalidateMenu } from "@/app/owner/menu/actions";
import { formatNaira } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-lg border border-surface-border bg-background px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

type Draft = {
  name: string;
  description: string;
  price: string;
  category: string;
  is_available: boolean;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  price: "",
  category: "Main",
  is_available: true,
};

export function MenuManager({ initialItems }: { initialItems: MenuItem[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = Array.from(
    new Set([
      "Main",
      "Grill",
      "Sides",
      "Drinks",
      ...initialItems.map((i) => i.category),
    ])
  );

  function startCreate() {
    setEditing(null);
    setDraft(EMPTY);
    setFile(null);
    setOpen(true);
  }

  function startEdit(item: MenuItem) {
    setEditing(item);
    setDraft({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category: item.category,
      is_available: item.is_available,
    });
    setFile(null);
    setOpen(true);
  }

  async function uploadImage(f: File): Promise<string> {
    const ext = f.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(path, f, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from("menu-images").getPublicUrl(path).data
      .publicUrl;
  }

  async function save() {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }

    setSaving(true);
    try {
      let image_url = editing?.image_url ?? null;
      if (file) image_url = await uploadImage(file);

      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price,
        category: draft.category.trim() || "Main",
        is_available: draft.is_available,
        image_url,
      };

      const { error } = editing
        ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
        : await supabase.from("menu_items").insert(payload);

      if (error) throw error;

      toast.success(editing ? "Item updated" : "Item added");
      setOpen(false);
      await revalidateMenu();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save item");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item: MenuItem) {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await revalidateMenu();
    router.refresh();
  }

  async function remove(item: MenuItem) {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", item.id);
    if (error) {
      // Most likely the item is referenced by past orders (FK).
      toast.error(
        "Can't delete an item with past orders — mark it unavailable instead."
      );
      return;
    }
    toast.success("Item deleted");
    await revalidateMenu();
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-ink">Menu</h1>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-primary-400"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item
        </button>
      </div>

      {initialItems.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-surface-border bg-surface px-4 py-12 text-center text-sm text-ink-muted">
          No items yet. Add your first dish.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialItems.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-background-raised">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-ink">{item.name}</h3>
                  <span className="whitespace-nowrap text-sm font-semibold text-primary-300">
                    {formatNaira(item.price)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">{item.category}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAvailable(item)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.is_available
                        ? "bg-success/15 text-success"
                        : "bg-gray-400/15 text-gray-400"
                    }`}
                  >
                    {item.is_available ? "Available" : "Hidden"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      className="rounded-lg border border-surface-border p-2 text-ink-muted hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-lg border border-surface-border p-2 text-ink-muted hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !saving && setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-surface-border bg-surface p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">
                {editing ? "Edit item" : "Add item"}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setOpen(false)}
                aria-label="Close"
                className="rounded p-1 text-ink-muted hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="m-name" className="block text-sm font-medium text-ink">
                  Name
                </label>
                <input
                  id="m-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="m-price" className="block text-sm font-medium text-ink">
                    Price (₦)
                  </label>
                  <input
                    id="m-price"
                    type="number"
                    min="0"
                    step="1"
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({ ...draft, price: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="m-cat" className="block text-sm font-medium text-ink">
                    Category
                  </label>
                  <input
                    id="m-cat"
                    list="m-cats"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value })
                    }
                    className={inputClass}
                  />
                  <datalist id="m-cats">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label htmlFor="m-desc" className="block text-sm font-medium text-ink">
                  Description
                </label>
                <textarea
                  id="m-desc"
                  rows={2}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="m-img" className="block text-sm font-medium text-ink">
                  Image {editing && <span className="text-ink-muted">(leave blank to keep)</span>}
                </label>
                <input
                  id="m-img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-background hover:file:bg-primary-400"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.is_available}
                  onChange={(e) =>
                    setDraft({ ...draft, is_available: e.target.checked })
                  }
                  className="accent-primary"
                />
                Available on the menu
              </label>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-400 disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Add item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
