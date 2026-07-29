"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff } from "lucide-react";

/** Local self-preview only — no WebRTC peer connection by design (§3). */
export function VideoRoom({
  bookingId,
  lawyerName,
  lawyerAvatar,
}: {
  bookingId: string;
  lawyerName: string;
  lawyerAvatar: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError(
          "Camera unavailable. Allow camera access in your browser to join.",
        );
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function toggleMic() {
    const next = !micOn;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
  }

  function toggleCam() {
    const next = !camOn;
    setCamOn(next);
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
  }

  function endCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push(`/consult/${bookingId}`);
  }

  return (
    <div className="space-y-6">
      {/* Tiles stay dark — video reads better on dark, and they are the one
          dark element allowed on the ivory page (RETHEME.md Task 3). */}
      <div className="grid gap-5 min-[900px]:grid-cols-2">
        {/* Lawyer tile — static, "connected" */}
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-rule bg-video">
          <Image
            src={lawyerAvatar}
            alt=""
            width={128}
            height={128}
            className="size-32 rounded-full object-cover ring-2 ring-white/15"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
            <span className="mono-label rounded-full bg-white/10 px-2.5 py-1 text-white backdrop-blur-sm">
              {lawyerName}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur-sm">
              <span className="animate-pulse-dot size-2 rounded-full bg-verified" />
              <span className="mono-label text-white">Connected</span>
            </span>
          </div>
        </div>

        {/* Self tile */}
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-rule bg-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`size-full object-cover ${camOn ? "" : "invisible"}`}
          />
          {!camOn && (
            <span className="mono-label absolute text-white/60">Camera off</span>
          )}
          {error && (
            <p className="absolute px-6 text-center text-sm text-white/60">
              {error}
            </p>
          )}
          <span className="mono-label absolute bottom-4 left-4 rounded-full bg-white/10 px-2.5 py-1 text-white backdrop-blur-sm">
            You
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleMic}
          aria-pressed={!micOn}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          className={`flex size-12 items-center justify-center rounded-full border transition-colors ${
            micOn
              ? "border-rule bg-surface hover:bg-surface-2"
              : "border-danger/50 bg-danger/15 text-danger"
          }`}
        >
          {micOn ? (
            <Mic className="size-5" strokeWidth={2} />
          ) : (
            <MicOff className="size-5" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={toggleCam}
          aria-pressed={!camOn}
          aria-label={camOn ? "Turn camera off" : "Turn camera on"}
          className={`flex size-12 items-center justify-center rounded-full border transition-colors ${
            camOn
              ? "border-rule bg-surface hover:bg-surface-2"
              : "border-danger/50 bg-danger/15 text-danger"
          }`}
        >
          {camOn ? (
            <VideoIcon className="size-5" strokeWidth={2} />
          ) : (
            <VideoOff className="size-5" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={endCall}
          aria-label="End call"
          className="flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <PhoneOff className="size-4" strokeWidth={2.5} />
          End call
        </button>
      </div>
    </div>
  );
}
