'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Headphones,
  ShoppingBag,
  Radio,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { KpiMetricStrip, KpiMetricItem } from '@/components/dashboard/shared/KpiMetricStrip';
import { MinimalistBarChart, BarChartDataPoint } from '@/components/dashboard/shared/MinimalistBarChart';

export function AdminStatsTab() {
  const { courses, books, orders, drmSessions, auditLogs } = useData();
  const { toLocale, dict } = useLanguage();
  const [activeRange, setActiveRange] = useState<string>('30days');

  const totalRevenue = orders.reduce((sum, ord) => {
    const raw = ord.total.replace(/[^0-9]/g, '');
    return sum + (Number(raw) || 0);
  }, 0);

  const activeDrmCount = drmSessions.filter((s) => s.status === 'فعال').length;

  const metrics: KpiMetricItem[] = [
    {
      id: 'revenue',
      serial: '[ ۰۱ ]',
      title: dict.admin_kpi_revenue_title,
      value: `${toLocale(totalRevenue.toLocaleString())} ${dict.admin_unit_toman}`,
      sublabel: dict.admin_kpi_revenue_sub,
      icon: TrendingUp,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'courses',
      serial: '[ ۰۲ ]',
      title: dict.admin_kpi_courses_title,
      value: `${toLocale(Object.keys(courses).length)} ${dict.admin_unit_courses}`,
      sublabel: dict.admin_kpi_courses_sub,
      icon: Headphones,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'orders',
      serial: '[ ۰۳ ]',
      title: dict.admin_kpi_orders_title,
      value: `${toLocale(orders.length)} ${dict.admin_unit_orders}`,
      sublabel: dict.admin_kpi_orders_sub,
      icon: ShoppingBag,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'drm',
      serial: '[ ۰۴ ]',
      title: dict.admin_kpi_drm_title,
      value: `${toLocale(activeDrmCount)} ${dict.admin_unit_licenses}`,
      sublabel: dict.admin_kpi_drm_sub,
      icon: Radio,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]',
    },
  ];

  const chartDataByRange: Record<string, BarChartDataPoint[]> = {
    '7days': [
      { id: 'd1', label: dict.chart_day_sat, value: 1200000, formattedValue: `۱.۲m` },
      { id: 'd2', label: dict.chart_day_sun, value: 850000, formattedValue: `۸۵۰k` },
      { id: 'd3', label: dict.chart_day_mon, value: 2400000, formattedValue: `۲.۴m` },
      { id: 'd4', label: dict.chart_day_tue, value: 1600000, formattedValue: `۱.۶m` },
      { id: 'd5', label: dict.chart_day_wed, value: 900000, formattedValue: `۹۰۰k` },
      { id: 'd6', label: dict.chart_day_thu, value: 3100000, formattedValue: `۳.۱m` },
      { id: 'd7', label: dict.chart_day_fri, value: 450000, formattedValue: `۴۵۰k` },
    ],
    '30days': [
      { id: 'w1', label: dict.chart_week_1, value: 18500000, formattedValue: `۱۸.۵m` },
      { id: 'w2', label: dict.chart_week_2, value: 24000000, formattedValue: `۲۴m` },
      { id: 'w3', label: dict.chart_week_3, value: 21200000, formattedValue: `۲۱.۲m` },
      { id: 'w4', label: dict.chart_week_4, value: 29800000, formattedValue: `۲۹.۸m` },
    ],
  };

  const timeRanges = [
    { id: '7days', label: dict.admin_range_7days },
    { id: '30days', label: dict.admin_range_30days },
  ];

  return (
    <div className="space-y-6 text-start">
      <KpiMetricStrip metrics={metrics} />

      <MinimalistBarChart
        title={dict.admin_chart_title}
        subtitle={dict.admin_chart_subtitle}
        data={chartDataByRange[activeRange] || chartDataByRange['30days']}
        timeRanges={timeRanges}
        activeTimeRange={activeRange}
        onTimeRangeChange={setActiveRange}
        metricUnit={dict.admin_unit_toman}
      />

      {/* System Audit Logs */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.admin_audit_title}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {dict.admin_audit_total}: {toLocale(auditLogs.length)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
                <th className="py-3 pe-4 font-normal text-start">{dict.th_id}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.th_action}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.th_user}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.th_details}</th>
                <th className="py-3 ps-4 font-normal text-start">{dict.th_time}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 pe-4 font-mono text-zinc-400">{log.id}</td>
                  <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">{log.action}</td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{log.user}</td>
                  <td className="py-3 px-4 text-zinc-500 truncate max-w-xs">{log.details}</td>
                  <td className="py-3 ps-4 font-num text-zinc-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
