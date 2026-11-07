'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Headphones,
  BookOpen,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';
import { toLocaleDigits } from '@/lib/data';

type TimeRange = 'today' | '7days' | '30days';
type MetricType = 'views' | 'revenue' | 'audio' | 'sales';

interface ChartPoint {
  label: string;
  views: number;
  revenue: number; // in thousands of Toman
  audioMinutes: number;
  bookSales: number;
}

const chartData: Record<TimeRange, ChartPoint[]> = {
  today: [
    { label: '۰۰:۰۰', views: 32, revenue: 0, audioMinutes: 15, bookSales: 0 },
    { label: '۰۳:۰۰', views: 12, revenue: 0, audioMinutes: 5, bookSales: 0 },
    { label: '۰۶:۰۰', views: 45, revenue: 0, audioMinutes: 28, bookSales: 0 },
    { label: '۰۸:۰۰', views: 160, revenue: 385, audioMinutes: 110, bookSales: 1 },
    { label: '۱۰:۰۰', views: 340, revenue: 770, audioMinutes: 290, bookSales: 2 },
    { label: '۱۲:۰۰', views: 480, revenue: 1450, audioMinutes: 420, bookSales: 3 },
    { label: '۱۴:۰۰', views: 390, revenue: 825, audioMinutes: 310, bookSales: 2 },
    { label: '۱۶:۰۰', views: 520, revenue: 1940, audioMinutes: 480, bookSales: 4 },
    { label: '۱۸:۰۰', views: 680, revenue: 2325, audioMinutes: 620, bookSales: 5 },
    { label: '۲۰:۰۰', views: 890, revenue: 3410, audioMinutes: 840, bookSales: 7 },
    { label: '۲۲:۰۰', views: 720, revenue: 1835, audioMinutes: 690, bookSales: 4 },
  ],
  '7days': [
    { label: 'شنبه', views: 2400, revenue: 3850, audioMinutes: 2100, bookSales: 10 },
    { label: 'یکشنبه', views: 2900, revenue: 4900, audioMinutes: 2600, bookSales: 13 },
    { label: 'دوشنبه', views: 3400, revenue: 6200, audioMinutes: 3200, bookSales: 16 },
    { label: 'سه‌شنبه', views: 3100, revenue: 5100, audioMinutes: 2800, bookSales: 12 },
    { label: 'چهارشنبه', views: 3800, revenue: 7400, audioMinutes: 3600, bookSales: 19 },
    { label: 'پنجشنبه', views: 4600, revenue: 9800, audioMinutes: 4400, bookSales: 25 },
    { label: 'جمعه', views: 5200, revenue: 11200, audioMinutes: 5100, bookSales: 29 },
  ],
  '30days': [
    { label: 'هفته اول', views: 16500, revenue: 28500, audioMinutes: 14200, bookSales: 74 },
    { label: 'هفته دوم', views: 19200, revenue: 34800, audioMinutes: 17800, bookSales: 89 },
    { label: 'هفته سوم', views: 22800, revenue: 41200, audioMinutes: 21500, bookSales: 106 },
    { label: 'هفته چهارم', views: 27400, revenue: 52300, audioMinutes: 25900, bookSales: 132 },
  ],
};

const schoolDistribution = [
  { name: 'حکمت متعالیه (ملاصدرا)', share: 42, color: '#D97706', revenue: '۱۱,۹۵۰,۰۰۰ تومان' },
  { name: 'حکمت اشراق (سهروردی)', share: 31, color: '#10B981', revenue: '۸,۸۲۰,۰۰۰ تومان' },
  { name: 'فلسفه تطبیقی و معاصر', share: 18, color: '#3B82F6', revenue: '۵,۱۲۰,۰۰۰ تومان' },
  { name: 'دوره‌ها و مباحث متفرقه', share: 9, color: '#8B5CF6', revenue: '۲,۵۶۰,۰۰۰ تومان' },
];

export const AdminCharts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [activeMetric, setActiveMetric] = useState<MetricType>('views');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = chartData[timeRange];

  // Extract active metric values
  const getMetricValue = (p: ChartPoint): number => {
    switch (activeMetric) {
      case 'views': return p.views;
      case 'revenue': return p.revenue;
      case 'audio': return p.audioMinutes;
      case 'sales': return p.bookSales;
    }
  };

  const getMetricUnit = (): string => {
    switch (activeMetric) {
      case 'views': return 'بازدید';
      case 'revenue': return 'هزار تومان';
      case 'audio': return 'دقیقه پخش';
      case 'sales': return 'جلد کتاب';
    }
  };

  const values = data.map(getMetricValue);
  const maxVal = Math.max(...values) * 1.15 || 100;
  const minVal = 0;

  // Generate SVG path for line chart
  const width = 720;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((getMetricValue(d) - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Summary Totals
  const totalViews = data.reduce((acc, d) => acc + d.views, 0);
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  const totalAudio = data.reduce((acc, d) => acc + d.audioMinutes, 0);
  const totalSales = data.reduce((acc, d) => acc + d.bookSales, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#18191D] p-5 rounded-3xl border border-book-border dark:border-book-darkBorder shadow-xs">
        
        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveMetric('views')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeMetric === 'views'
                ? 'bg-book-accent text-white shadow-xs'
                : 'bg-stone-100 dark:bg-zinc-800 text-book-subtext hover:text-book-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>بازدید صفحات</span>
          </button>

          <button
            onClick={() => setActiveMetric('revenue')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeMetric === 'revenue'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-zinc-800 text-book-subtext hover:text-book-text'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>فروش ریالی</span>
          </button>

          <button
            onClick={() => setActiveMetric('audio')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeMetric === 'audio'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-zinc-800 text-book-subtext hover:text-book-text'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>دقایق پخش آنلاین</span>
          </button>

          <button
            onClick={() => setActiveMetric('sales')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              activeMetric === 'sales'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-zinc-800 text-book-subtext hover:text-book-text'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>تیراژ کتب چاپی</span>
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="inline-flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-full text-xs font-bold self-end sm:self-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3.5 py-2 rounded-full transition ${timeRange === 'today' ? 'bg-white dark:bg-zinc-700 text-book-text dark:text-white shadow-xs' : 'text-book-subtext'}`}
          >
            امروز
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3.5 py-2 rounded-full transition ${timeRange === '7days' ? 'bg-white dark:bg-zinc-700 text-book-text dark:text-white shadow-xs' : 'text-book-subtext'}`}
          >
            ۷ روز اخیر
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3.5 py-2 rounded-full transition ${timeRange === '30days' ? 'bg-white dark:bg-zinc-700 text-book-text dark:text-white shadow-xs' : 'text-book-subtext'}`}
          >
            ۳۰ روز گذشته
          </button>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-[#18191D] p-6 rounded-3xl border border-book-border dark:border-book-darkBorder shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-book-subtext block">
              روند شاخص برگزیده ({timeRange === 'today' ? 'امروز - تفکیک ساعتی' : timeRange === '7days' ? 'هفت روز اخیر' : 'یک‌ماهه'})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-book-text dark:text-white font-num">
                {activeMetric === 'views' && toLocaleDigits(totalViews.toLocaleString(), 'fa')}
                {activeMetric === 'revenue' && `${toLocaleDigits((totalRevenue * 1000).toLocaleString(), 'fa')} تومان`}
                {activeMetric === 'audio' && `${toLocaleDigits(totalAudio.toLocaleString(), 'fa')} دقیقه`}
                {activeMetric === 'sales' && `${toLocaleDigits(totalSales.toLocaleString(), 'fa')} نسخه`}
              </span>
              <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] font-num flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+۱۸.۴٪ رشد</span>
              </span>
            </div>
          </div>

          {hoveredIdx !== null && (
            <div className="bg-stone-900 text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg animate-in fade-in duration-200">
              <span className="text-stone-400 block text-[11px]">{data[hoveredIdx].label}</span>
              <span className="text-[#8A532B] font-num">
                {toLocaleDigits(getMetricValue(data[hoveredIdx]).toLocaleString(), 'fa')} {getMetricUnit()}
              </span>
            </div>
          )}
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full h-[240px] pt-4 select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8C6834" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8C6834" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-zinc-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area under curve */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Smooth Bezier Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#8C6834"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g key={idx} className="cursor-pointer">
                  {/* Invisible larger hit area for easy hover */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="16"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                  {/* Visible point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '6' : '3.5'}
                    fill="#8C6834"
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? '3' : '2'}
                    className="transition duration-150"
                  />
                  {/* Bottom Label */}
                  <text
                    x={pt.x}
                    y={height - 5}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-stone-400 font-num"
                  >
                    {pt.data.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      {/* Secondary Row: School Breakdown & Device Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Philosophy Schools Revenue Share */}
        <div className="lg:col-span-8 bg-white dark:bg-[#18191D] p-6 rounded-3xl border border-book-border dark:border-book-darkBorder shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-book-accent" />
              <h3 className="text-sm font-bold text-book-text dark:text-white">
                توزیع درآمدی به تفکیک مکاتب و موضوعات
              </h3>
            </div>
            <span className="text-xs text-book-subtext font-num">مجموع ثبت‌نام‌ها: ۲۸,۴۵۰,۰۰۰ تومان</span>
          </div>

          <div className="space-y-4">
            {schoolDistribution.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-book-text dark:text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-book-subtext font-num">{item.revenue}</span>
                    <span className="text-book-accent font-num">{toLocaleDigits(item.share, 'fa')}٪</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition duration-200"
                    style={{
                      width: `${item.share}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Devices & Channel Stats */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191D] p-6 rounded-3xl border border-book-border dark:border-book-darkBorder shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-book-accent" />
              <h3 className="text-sm font-bold text-book-text dark:text-white">
                تفکیک دستگاه شنوندگان
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-[#8A532B]" />
                  <span className="text-xs font-bold">گوشی‌های هوشمند</span>
                </div>
                <span className="text-xs font-bold font-num">۶۸٪</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-[#8A532B]" />
                  <span className="text-xs font-bold">رایانه و لپ‌تاپ</span>
                </div>
                <span className="text-xs font-bold font-num">۲۸٪</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Tablet className="w-4 h-4 text-[#8A532B]" />
                  <span className="text-xs font-bold">تبلت و کتابخوان</span>
                </div>
                <span className="text-xs font-bold font-num">۴٪</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-book-border dark:border-book-darkBorder text-[11px] text-book-subtext">
            <span>میانگین زمان مطالعه در رحل ۳بعدی: </span>
            <strong className="text-book-accent font-num">۲۴ دقیقه در هر نشست</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
