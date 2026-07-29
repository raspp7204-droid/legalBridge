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
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Lawyer tile — static, "connected" */}
        <div className="card relative flex aspect-video items-center justify-center overflow-hidden">
          <Image
            src={lawyerAvatar}
            alt=""
            width={112}
            height={112}
            className="size-28 rounded-full object-cover"
          />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <span className="mono-label rounded-full bg-bg/80 px-2.5 py-1">
              {lawyerName}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-bg/80 px-2.5 py-1">
              <span className="size-2 rounded-full bg-verified" />
              <span className="mono-label text-verified">Connected</span>
            </span>
          </div>
        </div>

        {/* Self tile */}
        <div className="card relative flex aspect-video items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`size-full object-cover ${camOn ? "" : "invisible"}`}
          />
          {!camOn && (
            <span className="mono-label absolute text-muted">Camera off</span>
          )}
          {error && (
            <p className="absolute px-6 text-center text-sm text-muted">
              {error}
            </p>
          )}
          <span className="mono-label absolute bottom-3 left-3 rounded-full bg-bg/80 px-2.5 py-1">
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
