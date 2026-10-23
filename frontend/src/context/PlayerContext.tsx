'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { AudioCourse, coursesDatabase } from '@/lib/data';

interface PlayerContextType {
  currentCourse: AudioCourse;
  currentChapterIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isMuted: boolean;
  isPlaylistOpen: boolean;
  playTrack: (course: AudioCourse, chapterIndex?: number) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  cycleSpeed: () => void;
  toggleMute: () => void;
  togglePlaylist: () => void;
  setChapterIndex: (index: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const defaultCourse = Object.values(coursesDatabase)[0];

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCourse, setCurrentCourse] = useState<AudioCourse>(defaultCourse);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const playTrack = (course: AudioCourse, chapterIndex = 0) => {
    setCurrentCourse(course);
    setCurrentChapterIndex(chapterIndex);
    if (audioRef.current) {
      const chapter = course.chapters?.[chapterIndex];
      const targetUrl = chapter?.audioUrl || course.sampleAudioUrl || '/audio/sample_lecture.wav';
      audioRef.current.src = targetUrl;
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play initiated, handling autoplay policy:', err);
        // Fallback to local audio if remote url failed
        if (targetUrl !== '/audio/sample_lecture.wav' && audioRef.current) {
          audioRef.current.src = '/audio/sample_lecture.wav';
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(false);
        }
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback
      });
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      const maxDuration = (audioRef.current.duration && !isNaN(audioRef.current.duration))
        ? audioRef.current.duration
        : (duration || 180);
      const targetTime = Math.max(0, Math.min(seconds, maxDuration));
      try {
        audioRef.current.currentTime = targetTime;
      } catch (err) {
        console.error('Seek error:', err);
      }
      setCurrentTime(targetTime);
    } else {
      setCurrentTime(seconds);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime || currentTime;
      seek(current + seconds);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlaylist = () => {
    setIsPlaylistOpen(!isPlaylistOpen);
  };

  const setChapterIndex = (index: number) => {
    if (index >= 0 && index < currentCourse.chapters.length) {
      setCurrentChapterIndex(index);
      const chapter = currentCourse.chapters?.[index];
      const targetUrl = chapter?.audioUrl || currentCourse.sampleAudioUrl || '/audio/sample_lecture.wav';
      if (audioRef.current) {
        audioRef.current.src = targetUrl;
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play error in setChapterIndex:', err);
          if (targetUrl !== '/audio/sample_lecture.wav' && audioRef.current) {
            audioRef.current.src = '/audio/sample_lecture.wav';
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
              setIsPlaying(false);
            });
          } else {
            setIsPlaying(false);
          }
        });
      } else {
        setCurrentTime(0);
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentCourse,
        currentChapterIndex,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        isMuted,
        isPlaylistOpen,
        playTrack,
        togglePlay,
        seek,
        skip,
        cycleSpeed,
        toggleMute,
        togglePlaylist,
        setChapterIndex,
      }}
    >
      <audio
        ref={audioRef}
        src={currentCourse?.sampleAudioUrl || '/audio/sample_lecture.wav'}
        onTimeUpdate={handleTimeUpdate}
        onError={() => {
          if (audioRef.current && audioRef.current.src !== window.location.origin + '/audio/sample_lecture.wav') {
            audioRef.current.src = '/audio/sample_lecture.wav';
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onDurationChange={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={() => {
          if (currentChapterIndex < currentCourse.chapters.length - 1) {
            setChapterIndex(currentChapterIndex + 1);
          } else {
            setIsPlaying(false);
          }
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
