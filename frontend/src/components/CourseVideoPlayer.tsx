"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Subtitles,
  Maximize,
  Minimize,
  PictureInPicture2,
  Check,
  ChevronLeft,
  Headphones,
} from "lucide-react";

export interface CourseVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  instructor?: string;
  vttUrl?: string;
  watermarkText?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

interface CueItem {
  start: number;
  end: number;
  text: string;
}

const DEFAULT_CUES: CueItem[] = [
  {
    start: 0,
    end: 5,
    text: "بسم الله الرحمن الرحیم. الحمدلله رب العالمین و صلی الله علی سیدنا محمد و آله الطاهرین.",
  },
  {
    start: 5,
    end: 12,
    text: "در این جلسه به بررسی مبانی منطق و تقسیم علم به تصور و تصدیق میپردازیم.",
  },
  {
    start: 12,
    end: 25,
    text: "هر گاه صورت شیء در ذهن حاصل شود و حکمی بر آن بار نگردد، آن را تصور مینامند.",
  },
  {
    start: 25,
    end: 60,
    text: "اما اگر همراه با حکم و نسبت ثبوتی یا سلبی باشد، تصدیق نامیده میشود.",
  },
];

function parseTime(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  if (parts.length === 3) {
    return (
      parseFloat(parts[0]) * 3600 +
      parseFloat(parts[1]) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function CourseVideoPlayer({
  src,
  poster,
  title = "جلسه ۰۱: مدخل بر منطق مادی و اصول مقدمات برهانی",
  instructor = "حجت الاسلام دکتر زنجیرزن حسینی",
  vttUrl = "/videos/captions-fa.vtt",
  watermarkText,
  onTimeUpdate,
  onEnded,
}: CourseVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Settings states
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [quality, setQuality] = useState<"auto" | "1080p" | "720p" | "480p" | "360p">("auto");
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(false);

  // Menu navigation state
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<
    "main" | "mode" | "quality" | "speed" | "captions"
  >("main");

  // Parsed VTT cues
  const [cues, setCues] = useState<CueItem[]>(DEFAULT_CUES);

  // Anti-screen-share protection
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      "getDisplayMedia" in navigator.mediaDevices
    ) {
      try {
        navigator.mediaDevices.getDisplayMedia = async () => {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
          throw new DOMException(
            "اشتراکگذاری صفحه برای محتوای آموزشی مجاز نیست.",
            "NotAllowedError"
          );
        };
      } catch {
        // Ignore if read-only in some environments
      }
    }
  }, []);

  // Load WebVTT cues if available
  useEffect(() => {
    let cancelled = false;
    if (!vttUrl) return;
    fetch(vttUrl)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (cancelled || !text.includes("-->")) return;
        const parsed: CueItem[] = [];
        const blocks = text.replace(/\r\n/g, "\n").split("\n\n");
        for (const block of blocks) {
          const lines = block.trim().split("\n");
          const arrowIdx = lines.findIndex((l) => l.includes("-->"));
          if (arrowIdx !== -1) {
            const [startStr, endStr] = lines[arrowIdx].split("-->");
            const cueText = lines
              .slice(arrowIdx + 1)
              .join(" ")
              .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
              .trim();
            if (cueText) {
              parsed.push({
                start: parseTime(startStr),
                end: parseTime(endStr.split(" ")[0]),
                text: cueText,
              });
            }
          }
        }
        if (parsed.length > 0) setCues(parsed);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [vttUrl]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setActiveSubMenu("main");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = videoRef.current;
      if (!v) return;
      const val = parseFloat(e.target.value);
      v.volume = val;
      v.muted = val === 0;
      setVolume(val);
      setIsMuted(val === 0);
    },
    []
  );

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = parseFloat(e.target.value);
    v.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleSpeedSelect = (rate: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setPlaybackRate(rate);
    setMenuOpen(false);
    setActiveSubMenu("main");
  };

  const handleModeSelect = (audioOnly: boolean) => {
    const v = videoRef.current;
    const savedTime = v ? v.currentTime : currentTime;
    const wasPlaying = v ? !v.paused : isPlaying;
    setIsAudioOnly(audioOnly);
    setMenuOpen(false);
    setActiveSubMenu("main");
    requestAnimationFrame(() => {
      if (videoRef.current) {
        if (Math.abs(videoRef.current.currentTime - savedTime) > 0.2) {
          videoRef.current.currentTime = savedTime;
        }
        if (wasPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    });
  };

  const handleQualitySelect = (
    q: "auto" | "1080p" | "720p" | "480p" | "360p"
  ) => {
    const v = videoRef.current;
    const savedTime = v ? v.currentTime : currentTime;
    const wasPlaying = v ? !v.paused : isPlaying;
    setQuality(q);
    setMenuOpen(false);
    setActiveSubMenu("main");
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (wasPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    });
  };

  const handleCaptionsSelect = (enabled: boolean) => {
    setCaptionsEnabled(enabled);
    const v = videoRef.current;
    if (v && v.textTracks && v.textTracks.length > 0) {
      for (let i = 0; i < v.textTracks.length; i++) {
        v.textTracks[i].mode = enabled ? "hidden" : "disabled";
      }
    }
    setMenuOpen(false);
    setActiveSubMenu("main");
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
      }
    } catch {
      // Ignore PiP errors
    }
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen errors
    }
  };

  const activeCue = captionsEnabled
    ? cues.find((c) => currentTime >= c.start && currentTime <= c.end) ||
      cues[0]
    : null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      onContextMenu={(e) => e.preventDefault()}
      className="vjs-ltr-player relative w-full aspect-video bg-[#09090b] rounded-2xl overflow-hidden select-none shadow-2xl border border-white/10 group"
      style={{
        fontFamily: "var(--font-dana), 'Dana', Tahoma, sans-serif",
        direction: "ltr",
      }}
    >
      {/* Underlying Video Element (Always mounted so audio/video switch never resets state) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
          const tracks = e.currentTarget.textTracks;
          for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = captionsEnabled ? "hidden" : "disabled";
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setCurrentTime(t);
          onTimeUpdate?.(t);
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
          isAudioOnly ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {vttUrl && (
          <track kind="captions" src={vttUrl} srcLang="fa" label="فارسی" />
        )}
      </video>

      {/* Audio-Only Mode Cover Overlay (Controlled strictly from the Settings gear menu) */}
      {isAudioOnly && (
        <div
          onClick={togglePlay}
          data-testid="audio-only-overlay"
          className="absolute inset-0 z-10 flex flex-col items-center justify-between bg-gradient-to-b from-[#141210] via-[#0c0a09] to-[#141210] p-6 pb-24 cursor-pointer"
        >
          {/* Top Lesson Info in RTL */}
          <div dir="rtl" className="w-full text-right space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium mb-1">
              <Headphones className="w-3.5 h-3.5"/>
              <span>حالت صوتی</span>
            </div>
            <h3 className="text-white text-base md:text-lg font-bold leading-snug">
              {title}
            </h3>
            {instructor && (
              <p className="text-white/65 text-xs md:text-sm">{instructor}</p>
            )}
          </div>

          {/* Center Animated Equalizer Bars */}
          <div className="flex items-end justify-center gap-1.5 h-16 my-auto">
            {[40, 75, 55, 95, 60, 85, 45, 90, 50, 70, 35].map((h, idx) => (
              <span
                key={idx}
                className="w-1.5 rounded-full bg-amber-500/80 transition-all duration-300"
                style={{
                  height: isPlaying ? `${h}%` : "22%",
                }}
              />
            ))}
          </div>

          <div className="h-2" />
        </div>
      )}

      {/* Dynamic Anti-Piracy Watermark (if watermarkText is provided) */}
      {watermarkText && (
        <div className="pointer-events-none absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-black/30 text-white/35 text-[11px] font-mono">
          {watermarkText}
        </div>
      )}

      {/* Custom RTL Dana Subtitle Overlay */}
      {captionsEnabled && activeCue && (
        <div
          data-testid="player-subtitle-overlay"
          className="pointer-events-none absolute left-4 right-4 bottom-20 z-20 flex justify-center"
        >
          <div
            dir="rtl"
            style={{
              fontFamily: "var(--font-dana), 'Dana', Tahoma, sans-serif",
              direction: "rtl",
              unicodeBidi: "plaintext",
            }}
            className="max-w-[88%] bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm md:text-base font-medium leading-relaxed text-center shadow-lg border border-white/10"
          >
            {activeCue.text}
          </div>
        </div>
      )}

      {/* Bottom Control Bar — Always High-Contrast White & Strictly LTR */}
      <div
        dir="ltr"
        style={{ direction: "ltr" }}
        className="absolute bottom-3 left-3 right-3 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-white/15 text-white shadow-xl"
      >
        {/* Play / Pause Button (Far Left) */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "توقف" : "پخش"}
          data-testid="player-play-button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white hover:bg-white/15 transition"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white text-white"/>
          ) : (
            <Play className="w-5 h-5 fill-white text-white ml-0.5"/>
          )}
        </button>

        {/* Volume Button & Slider */}
        <div className="flex items-center gap-1.5 group/vol">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "لغو بیصدا" : "بیصدا"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white hover:bg-white/15 transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-white"/>
            ) : (
              <Volume2 className="w-5 h-5 text-white"/>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="میزان صدا"
            className="w-16 h-1 accent-amber-500 bg-white/30 rounded-lg cursor-pointer hidden sm:block"
          />
        </div>

        {/* Current Time (Strictly on the LEFT of Timeline) */}
        <span
          data-testid="player-current-time"
          className="text-xs font-medium text-white tabular-nums min-w-[36px] text-center"
        >
          {formatTime(currentTime)}
        </span>

        {/* Timeline Progress Bar (LTR Left-to-Right) */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="زمان ویدیو"
            data-testid="player-seek-slider"
            style={{
              background: `linear-gradient(to right, #f59e0b ${progressPercent}%, rgba(255,255,255,0.25) ${progressPercent}%)`,
            }}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Duration Time (Strictly on the RIGHT of Timeline) */}
        <span
          data-testid="player-duration-time"
          className="text-xs font-medium text-white/90 tabular-nums min-w-[36px] text-center"
        >
          {formatTime(duration)}
        </span>

        {/* Captions Quick Toggle Button */}
        <button
          type="button"
          onClick={() => handleCaptionsSelect(!captionsEnabled)}
          aria-label="زیرنویس"
          data-testid="player-captions-button"
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
            captionsEnabled
              ? "bg-amber-500 text-black"
              : "text-white hover:bg-white/15"
          }`}
        >
          <Subtitles className="w-5 h-5"/>
        </button>

        {/* Settings Gear Button + Popover Menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setActiveSubMenu("main");
            }}
            aria-label="تنظیمات"
            data-testid="player-settings-button"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white hover:bg-white/15 transition"
          >
            <Settings className="w-5 h-5 text-white"/>
          </button>

          {menuOpen && (
            <div
              dir="rtl"
              data-testid="player-settings-menu"
              style={{
                fontFamily: "var(--font-dana), 'Dana', Tahoma, sans-serif",
                direction: "rtl",
              }}
              className="absolute bottom-12 right-0 w-60 rounded-xl bg-neutral-950/95 backdrop-blur-xl border border-white/15 text-white shadow-2xl p-2 z-50 text-sm"
            >
              {activeSubMenu === "main" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("mode")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="font-medium text-white">حالت پخش</span>
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      {isAudioOnly ? "صوتی" : "ویدیویی"}
                      <ChevronLeft className="w-4 h-4"/>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("quality")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="font-medium text-white">کیفیت</span>
                    <span className="flex items-center gap-1 text-xs text-white/75">
                      {quality === "auto" ? "خودکار" : quality}
                      <ChevronLeft className="w-4 h-4"/>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("speed")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="font-medium text-white">سرعت پخش</span>
                    <span className="flex items-center gap-1 text-xs text-white/75">
                      {playbackRate === 1 ? "عادی (1x)" : `${playbackRate}x`}
                      <ChevronLeft className="w-4 h-4"/>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("captions")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="font-medium text-white">زیرنویس</span>
                    <span className="flex items-center gap-1 text-xs text-white/75">
                      {captionsEnabled ? "فارسی" : "خاموش"}
                      <ChevronLeft className="w-4 h-4"/>
                    </span>
                  </button>
                </div>
              )}

              {activeSubMenu === "mode" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("main")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border-b border-white/10 mb-1"
                  >
                    <span>بازگشت به تنظیمات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSelect(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span>ویدیویی</span>
                    {!isAudioOnly && <Check className="w-4 h-4 text-amber-400"/>}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSelect(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span>صوتی</span>
                    {isAudioOnly && <Check className="w-4 h-4 text-amber-400"/>}
                  </button>
                </div>
              )}

              {activeSubMenu === "quality" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("main")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border-b border-white/10 mb-1"
                  >
                    <span>بازگشت به تنظیمات</span>
                  </button>
                  {(["auto", "1080p", "720p", "480p", "360p"] as const).map(
                    (q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleQualitySelect(q)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                      >
                        <span>{q === "auto" ? "خودکار (Auto)" : q}</span>
                        {quality === q && (
                          <Check className="w-4 h-4 text-amber-400"/>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}

              {activeSubMenu === "speed" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("main")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border-b border-white/10 mb-1"
                  >
                    <span>بازگشت به تنظیمات</span>
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedSelect(rate)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                    >
                      <span>{rate === 1 ? "عادی (1x)" : `${rate}x`}</span>
                      {playbackRate === rate && (
                        <Check className="w-4 h-4 text-amber-400"/>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {activeSubMenu === "captions" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu("main")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border-b border-white/10 mb-1"
                  >
                    <span>بازگشت به تنظیمات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCaptionsSelect(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span>خاموش</span>
                    {!captionsEnabled && (
                      <Check className="w-4 h-4 text-amber-400"/>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCaptionsSelect(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span>فارسی</span>
                    {captionsEnabled && (
                      <Check className="w-4 h-4 text-amber-400"/>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Picture-in-Picture Button */}
        <button
          type="button"
          onClick={togglePiP}
          aria-label="تصویر در تصویر"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white hover:bg-white/15 transition"
        >
          <PictureInPicture2 className="w-5 h-5 text-white"/>
        </button>

        {/* Fullscreen Button (Far Right) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="تمام صفحه"
          data-testid="player-fullscreen-button"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white hover:bg-white/15 transition"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5 text-white"/>
          ) : (
            <Maximize className="w-5 h-5 text-white"/>
          )}
        </button>
      </div>
    </div>
  );
}
