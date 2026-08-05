"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Upload, Loader2, X, Check } from "lucide-react";
import { AVATAR_PX, AVATAR_MAX_CHARS } from "@/lib/avatars";

/**
 * Real file upload, with no storage service and no new dependency.
 *
 * The file never leaves the browser as a file. It is drawn onto a canvas,
 * cropped square, scaled to AVATAR_PX and re-encoded as a JPEG data URL, which
 * is what gets stored in User.avatar. next/image bypasses its optimiser for
 * `data:` sources automatically, so an uploaded photo renders everywhere an
 * avatar renders — listing, profile, chat, admin — with nothing else changed.
 *
 * Why not upload to disk: Vercel's filesystem is ephemeral, so anything written
 * at runtime disappears on the next deploy. Why not a blob service: it needs a
 * dependency and an account, and CLAUDE.md §2 rules out both without asking.
 *
 * The resize is the part that makes this viable rather than merely clever. A
 * 4MB phone photo is unusable as a database column; the same photo at 256px is
 * about 15KB, which is smaller than most of the URLs it replaces are worth
 * worrying about.
 */

function SubmitButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!ready || pending}
      className="btn-primary mono-label inline-flex items-center gap-2 rounded-full px-4 py-2.5 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
          Saving…
        </>
      ) : (
        <>
          <Upload className="size-3.5" strokeWidth={2.5} />
          Save this photo
        </>
      )}
    </button>
  );
}

/**
 * One of the stock portraits, as its own submit button.
 *
 * A client component only so it can dim and spin while its form is in flight —
 * clicking a face and having nothing happen for a second is exactly the silent
 * action this pass exists to remove.
 */
export function PresetPhotoButton({
  url,
  current,
}: {
  url: string;
  current: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="avatar"
      value={url}
      disabled={pending}
      title={current ? "Current photo" : "Use this photo"}
      className={`relative rounded-full p-[3px] transition-all disabled:cursor-not-allowed ${
        current ? "bg-accent" : "bg-rule hover:bg-accent/50"
      } ${pending ? "opacity-50" : "hover:-translate-y-0.5"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={48}
        height={48}
        className="size-12 rounded-full object-cover"
      />
      {current && (
        <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-white">
          <Check className="size-2.5" strokeWidth={4} />
        </span>
      )}
    </button>
  );
}

export function AvatarUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That is not an image file.");
      return;
    }
    // Guard before decoding: a huge file would be read into memory first.
    if (file.size > 12 * 1024 * 1024) {
      setError("That image is over 12MB. Try a smaller one.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode failed"));
        el.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_PX;
      canvas.height = AVATAR_PX;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");

      // Cover-crop from the centre, so a portrait is not squashed into a square.
      const scale = Math.max(AVATAR_PX / img.width, AVATAR_PX / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (AVATAR_PX - w) / 2, (AVATAR_PX - h) / 2, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      if (dataUrl.length > AVATAR_MAX_CHARS) {
        setError("That image is still too large after resizing. Try another.");
        return;
      }

      setPreview(dataUrl);
      setName(file.name);
    } catch {
      setError("That image could not be read. Try a JPEG or PNG.");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function clear() {
    setPreview(null);
    setName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="mono-label flex w-fit cursor-pointer items-center gap-2 rounded-full border border-rule bg-surface-2 px-4 py-2.5 text-slate transition-colors hover:border-accent/40 hover:text-accent">
        <Upload className="size-3.5" strokeWidth={2.5} />
        Choose a file
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-rule bg-surface-2 p-3.5">
          {/* Plain <img>: this is a local preview that never reaches the
              server unless the form is submitted. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview of the photo about to be saved"
            width={64}
            height={64}
            className="size-16 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="mono-label text-muted">Ready to save</p>
            <p className="mt-1 truncate text-sm text-slate">{name}</p>
            <p className="mono-label mt-1 text-muted">
              {AVATAR_PX}×{AVATAR_PX} · {Math.round(preview.length / 1024)}KB
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="Discard this photo"
            className="rounded-full border border-rule p-1.5 text-muted transition-colors hover:border-danger/40 hover:text-danger"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      <input type="hidden" name="avatar" value={preview ?? ""} />

      <div className="mt-4">
        <SubmitButton ready={!!preview} />
      </div>
    </div>
  );
}
