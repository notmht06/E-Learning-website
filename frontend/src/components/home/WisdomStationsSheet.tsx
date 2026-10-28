'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Play,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  GraduationCap,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { coursesDatabase, AudioCourse } from '@/lib/data';
import { SCHOLAR_NAME } from '@/lib/constants';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';

interface StationItem {
  id: string;
  stationNumber: number;
  courseKey: string;
  courseId: string;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  focusKey: string;
  serialTag: string;
  sessionsCount: number;
  durationHours: number;
  canonicalText: { fa: string; ar: string; en: string };
  treatiseAuthor: { fa: string; ar: string; en: string };
  concepts: { fa: string[]; ar: string[]; en: string[] };
}

const STATIONS: StationItem[] = [
  {
    id: 'station-asfar',
    stationNumber: 1,
    courseKey: 'course-falsafe-asfar-1',
    courseId: 'course-falsafe-asfar-1',
    titleKey: 'stations_station_1_title',
    subtitleKey: 'stations_station_1_subtitle',
    descKey: 'stations_station_1_desc',
    focusKey: 'stations_station_1_focus',
    serialTag: 'STN-01',
    sessionsCount: 160,
    durationHours: 125,
    canonicalText: {
      fa: 'الحکمة المتعالیة فی الاسفار العقلیة الاربعة',
      ar: 'الحكمة المتعالية في الأسفار العقلية الأربعة',
      en: 'Al-Hikmat al-Muta’aliyah (Asfar al-Arba’ah)',
    },
    treatiseAuthor: {
      fa: 'صدرالمتألهین ملاصدرا الشیرازی',
      ar: 'صدر المتألهين ملا صدرا الشيرازي',
      en: 'Mulla Sadra al-Shirazi',
    },
    concepts: {
      fa: ['اصالت وجود', 'تشکیک وجود', 'حرکت جوهری', 'برهان صدیقین'],
      ar: ['أصالة الوجود', 'تشكيك الوجود', 'الحركة الجوهرية', 'برهان الصديقين'],
      en: ['Primacy of Existence', 'Modulation of Being', 'Substantial Motion', 'Proof of Sincere'],
    },
  },
  {
    id: 'station-ishraq',
    stationNumber: 2,
    courseKey: 'course-falsafe-ishraq',
    courseId: 'course-falsafe-ishraq',
    titleKey: 'stations_station_2_title',
    subtitleKey: 'stations_station_2_subtitle',
    descKey: 'stations_station_2_desc',
    focusKey: 'stations_station_2_focus',
    serialTag: 'STN-02',
    sessionsCount: 84,
    durationHours: 62,
    canonicalText: {
      fa: 'حکمة الإشراق',
      ar: 'حكمة الإشراق',
      en: 'Hikmat al-Ishraq',
    },
    treatiseAuthor: {
      fa: 'شیخ شهاب‌الدین سهروردی (شیخ اشراق)',
      ar: 'الشيخ شهاب الدين السهروردي (شيخ الإشراق)',
      en: 'Shahab al-Din Suhrawardi (Shaykh al-Ishraq)',
    },
    concepts: {
      fa: ['نور مجرد', 'نورالانوار', 'امکان اشرف', 'انوار قاهره'],
      ar: ['النور المجرد', 'نور الأنوار', 'قاعدة الإمكان الأشرف', 'الأنوار القاهرة'],
      en: ['Immaterial Light', 'Light of Lights', 'Nobler Possibility', 'Dominating Lights'],
    },
  },
  {
    id: 'station-isharat',
    stationNumber: 3,
    courseKey: 'course-falsafe-isharat',
    courseId: 'course-falsafe-isharat',
    titleKey: 'stations_station_3_title',
    subtitleKey: 'stations_station_3_subtitle',
    descKey: 'stations_station_3_desc',
    focusKey: 'stations_station_3_focus',
    serialTag: 'STN-03',
    sessionsCount: 85,
    durationHours: 68,
    canonicalText: {
      fa: 'الاشارات و التنبیهات (ده نمط)',
      ar: 'الإشارات والتنبيهات (عشرة أنماط)',
      en: 'Al-Isharat wa al-Tanbihat (Ten Namats)',
    },
    treatiseAuthor: {
      fa: 'شیخ‌الرئیس ابوعلی سینا و خواجه نصیرالدین طوسی',
      ar: 'الشيخ الرئيس ابن سينا والخواجة نصير الدين الطوسي',
      en: 'Avicenna & Khawaja Nasir al-Din al-Tusi',
    },
    concepts: {
      fa: ['تجوهر اجسام', 'صورت و ماده', 'برهان امکان', 'مقامات العارفین'],
      ar: ['تجوهر الأجسام', 'الصورة والمادة', 'برهان الإمكان', 'مقامات العارفين'],
      en: ['Substantiality of Bodies', 'Matter & Form', 'Proof of Contingency', 'Stations of the Knowers'],
    },
  },
  {
    id: 'station-shifa',
    stationNumber: 4,
    courseKey: 'course-falsafe-shifa',
    courseId: 'course-falsafe-shifa',
    titleKey: 'stations_station_4_title',
    subtitleKey: 'stations_station_4_subtitle',
    descKey: 'stations_station_4_desc',
    focusKey: 'stations_station_4_focus',
    serialTag: 'STN-04',
    sessionsCount: 52,
    durationHours: 40,
    canonicalText: {
      fa: 'إلهیات الشفاء و رسائل سنجش با فلسفه معاصر',
      ar: 'إلهيات الشفاء ورسائل المقارنة مع الفلسفة المعاصرة',
      en: 'Ilahiyyat al-Shifa & Contemporary Dialectics',
    },
    treatiseAuthor: {
      fa: 'ابن سینا و درس‌گفتار تطبیقی با مدرنیته',
      ar: 'ابن سينا ودراسات مقارنة مع الفكر المعاصر',
      en: 'Ibn Sina & Comparative Modern Studies',
    },
    concepts: {
      fa: ['اثبات واجب بذاته', 'عنایت ربوبی', 'نقد سوژه دکارتی', 'نقد کانت'],
      ar: ['إثبات الواجب بذاته', 'العناية الإلهية', 'نقد الذات الديكارتية', 'نقد كانط'],
      en: ['Self-Necessary Being', 'Divine Providence', 'Critique of Cartesian Subject', 'Critique of Kant'],
    },
  },
];

export const WisdomStationsSheet: React.FC = () => {
  const { dict, toLocale, isRtl, currentLang } = useLanguage();
  const { playTrack, currentCourse, isPlaying } = usePlayer();
  const [selectedStationId, setSelectedStationId] = useState<string>('all');

  const filteredStations =
    selectedStationId === 'all'
      ? STATIONS
      : STATIONS.filter((s) => s.id === selectedStationId);

  const handlePlayStationPreview = (station: StationItem) => {
    const course = coursesDatabase[station.courseKey];
    if (course) {
      playTrack(course, 0);
    }
  };

  return (
    <section
      id="stations"
      aria-label={dict.stations_title || 'ایستگاه‌های حکمت'}
      className="relative z-10 w-full mt-12 sm:mt-16 pt-8 pb-16 sm:pb-20 bg-[#FAF8F5] dark:bg-[#0C0D0E] rounded-t-[40px] sm:rounded-t-[56px] border-t border-[#E6E1D8] dark:border-[#22242A] shadow-2xl transition-colors duration-300"
    >
      {/* Tactile Sheet Drag Handle Indicator (Adapted from UTopia sheet-main) */}
      <div className="flex justify-center pt-1 pb-4">
        <div
          className="w-12 sm:w-16 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700/80 transition-colors"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20">
            <Compass className="w-3.5 h-3.5" />
            <span>{dict.stations_badge || 'چهار ایستگاه بنیادین تفکر برهانی'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] tracking-tight leading-snug">
            {dict.stations_title || 'منظومه ایستگاه‌های معرفتی علوم عقلی و وجودشناسی'}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify sm:text-center">
            {dict.stations_desc ||
              `بازخوانی روش‌مند و اجتهادی ارکان حکمت اسلامی در چهار ایستگاه درسی با تکیه بر متون مصحح و تدریس صوت استودیویی ${SCHOLAR_NAME}`}
          </p>
        </div>

        {/* Interactive Station Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setSelectedStationId('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedStationId === 'all'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'bg-white dark:bg-[#141518] text-zinc-600 dark:text-zinc-400 border border-[#E6E1D8] dark:border-[#22242A] hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {dict.stations_tab_all || 'همه ایستگاه‌ها'}
          </button>

          {STATIONS.map((station) => {
            const isSelected = selectedStationId === station.id;
            const fallbackTitle =
              station.canonicalText[currentLang as keyof typeof station.canonicalText] ||
              station.canonicalText.fa;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => setSelectedStationId(station.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#8A532B] text-white shadow-xs'
                    : 'bg-white dark:bg-[#141518] text-zinc-600 dark:text-zinc-400 border border-[#E6E1D8] dark:border-[#22242A] hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">
                  [{toLocale(station.stationNumber)}]
                </span>
                <span>{dict[station.titleKey] || fallbackTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Stations Grid (2x2 Balanced Editorial Bento) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredStations.map((station) => {
            const course = coursesDatabase[station.courseKey];
            const isCoursePlaying =
              currentCourse?.id === course?.id && isPlaying;
            const canonical =
              station.canonicalText[currentLang as keyof typeof station.canonicalText] ||
              station.canonicalText.fa;
            const author =
              station.treatiseAuthor[currentLang as keyof typeof station.treatiseAuthor] ||
              station.treatiseAuthor.fa;
            const conceptsList =
              station.concepts[currentLang as keyof typeof station.concepts] ||
              station.concepts.fa;

            return (
              <Card
                key={station.id}
                className="p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 transition-all duration-200"
              >
                {/* Top Station Meta */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] text-[11px] font-mono font-bold tracking-tight">
                        {station.serialTag}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        {dict.stations_station_num_prefix || 'ایستگاه'}{' '}
                        {toLocale(station.stationNumber)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-num">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#8A532B]" />
                        <span>
                          {toLocale(station.sessionsCount)}{' '}
                          {dict.stations_metrics_sessions || 'جلسه'}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8A532B]" />
                        <span>
                          {toLocale(station.durationHours)}{' '}
                          {dict.stations_metrics_hours || 'ساعت'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Station Titles */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
                      {dict[station.titleKey] || canonical}
                    </h3>
                    <p className="text-xs font-medium text-[#8A532B] dark:text-[#C58B43]">
                      {dict[station.subtitleKey] || author}
                    </p>
                  </div>

                  {/* Scholarly Thesis Summary */}
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
                    {dict[station.descKey]}
                  </p>

                  {/* Canonical Treatise & Core Concepts */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#8A532B]" />
                      <span>{canonical}</span>
                      <span className="text-zinc-400 dark:text-zinc-600">•</span>
                      <span>{author}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {conceptsList.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FAF8F5] dark:bg-[#18191D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant={isCoursePlaying ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlayStationPreview(station)}
                    className="gap-2 text-xs font-bold"
                  >
                    {isCoursePlaying ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{dict.discourse_live_status || 'در حال پخش'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{dict.stations_btn_listen_preview || 'شنیدن درس نمونه'}</span>
                      </>
                    )}
                  </Button>

                  <Button asChild variant="link" size="sm" className="p-0 text-xs font-bold gap-1">
                    <Link href={`/courses/${station.courseId}`}>
                      <span>{dict.stations_btn_view_course || 'مشاهده سرفصل‌ها'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
