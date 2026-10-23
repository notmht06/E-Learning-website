'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass,
  Brain,
  Sparkles,
  Scroll,
  ArrowLeft,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ConceptNode,
  ConceptEdge,
  DisciplineType,
  conceptNodesData,
  conceptEdgesData,
} from '@/lib/conceptGraphData';
import { SCHOLAR_NAME } from '@/lib/constants';

interface ConceptGraphVisualizerProps {
  className?: string;
}

export const ConceptGraphVisualizer: React.FC<ConceptGraphVisualizerProps> = ({ className = '' }) => {
  const { currentLang, dict } = useLanguage();
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineType | 'all'>('all');
  const [activeNodeId, setActiveNodeId] = useState<string>('asalat-al-wojood');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = useMemo(
    () => conceptNodesData.find((n) => n.id === activeNodeId) || conceptNodesData[0],
    [activeNodeId]
  );

  const filteredNodes = useMemo(() => {
    if (selectedDiscipline === 'all') return conceptNodesData;
    return conceptNodesData.filter((n) => n.discipline === selectedDiscipline);
  }, [selectedDiscipline]);

  const filteredEdges = useMemo(() => {
    return conceptEdgesData.filter((edge) => {
      const sourceExists = conceptNodesData.some((n) => n.id === edge.source);
      const targetExists = conceptNodesData.some((n) => n.id === edge.target);
      return sourceExists && targetExists;
    });
  }, []);

  const connectedEdgeIds = useMemo(() => {
    const focusId = hoveredNodeId || activeNodeId;
    return new Set(
      conceptEdgesData
        .filter((e) => e.source === focusId || e.target === focusId)
        .map((e) => e.id)
    );
  }, [hoveredNodeId, activeNodeId]);

  const connectedNeighborIds = useMemo(() => {
    const focusId = activeNodeId;
    const neighbors: string[] = [];
    conceptEdgesData.forEach((e) => {
      if (e.source === focusId) neighbors.push(e.target);
      if (e.target === focusId) neighbors.push(e.source);
    });
    return Array.from(new Set(neighbors));
  }, [activeNodeId]);

  const getDisciplineName = (d: DisciplineType) => {
    switch (d) {
      case 'mantiq':
        return currentLang === 'en' ? 'Logic' : currentLang === 'ar' ? 'المنطق' : 'منطق';
      case 'falsafe':
        return currentLang === 'en' ? 'Philosophy' : currentLang === 'ar' ? 'الفلسفة' : 'فلسفه و هستی‌شناسی';
      case 'erfan':
        return currentLang === 'en' ? 'Irfan (Mysticism)' : currentLang === 'ar' ? 'العرفان' : 'عرفان نظری';
      case 'osul':
        return currentLang === 'en' ? 'Legal Theory' : currentLang === 'ar' ? 'الأصول' : 'اصول فقه';
    }
  };

  const getNodeTitle = (node: ConceptNode) => {
    if (currentLang === 'en') return node.title_en;
    if (currentLang === 'ar') return node.title_ar;
    return node.title_fa;
  };

  const getNodeTagline = (node: ConceptNode) => {
    if (currentLang === 'en') return node.tagline_en;
    if (currentLang === 'ar') return node.tagline_ar;
    return node.tagline_fa;
  };

  const getNodeDescription = (node: ConceptNode) => {
    if (currentLang === 'en') return node.description_en;
    if (currentLang === 'ar') return node.description_ar;
    return node.description_fa;
  };

  const getNodeTier = (tier: 1 | 2 | 3) => {
    if (currentLang === 'en') {
      return tier === 1 ? 'Foundational Tier' : tier === 2 ? 'Intermediate Tier' : 'Advanced Ijtihad Tier';
    }
    if (currentLang === 'ar') {
      return tier === 1 ? 'المستوى التأسيسي' : tier === 2 ? 'المستوى المتوسط' : 'السطوح العالية الاجتهادية';
    }
    return tier === 1 ? 'پایه استدلالی' : tier === 2 ? 'تراز میانی' : 'تراز عالی اجتهادی';
  };

  const getRelatedCourseTitle = (node: ConceptNode) => {
    if (currentLang === 'en') return node.relatedCourseTitle_en || node.relatedCourseTitle_fa;
    if (currentLang === 'ar') return node.relatedCourseTitle_ar || node.relatedCourseTitle_fa;
    return node.relatedCourseTitle_fa;
  };

  return (
    <div className={`w-full bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE6DF] dark:border-[#27282D] rounded-3xl p-4 sm:p-6 shadow-sm ${className}`}>
      {/* Top Header & Discipline Filter Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE6DF] dark:border-[#27282D]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#8A532B]" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8A532B] dark:text-[#C58B43]">
              {dict.concept_graph_badge || 'شبکه هستی‌شناسی و علوم عقلی'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-book-text dark:text-stone-100 font-bookTitle">
            {dict.concept_graph_title || 'گراف ارتباطی و شجره‌نامه مفاهیم'}
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setSelectedDiscipline('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              selectedDiscipline === 'all'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-book-subtext hover:text-book-text dark:hover:text-white'
            }`}
          >
            {dict.filter_all || 'همه محورها'}
          </button>
          {(['falsafe', 'mantiq', 'erfan', 'osul'] as DisciplineType[]).map((disc) => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                selectedDiscipline === disc
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              {getDisciplineName(disc)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage: SVG Graph + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* SVG Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#18191D] border border-[#EAE6DF] dark:border-[#27282D] rounded-2xl p-2 sm:p-4 relative overflow-hidden shadow-inner">
          <svg
            viewBox="50 80 900 440"
            className="w-full h-[380px] sm:h-[460px] select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              <marker
                id="graph-arrow"
                viewBox="0 0 10 10"
                refX="18"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#8A532B" opacity="0.6" />
              </marker>
              <marker
                id="graph-arrow-active"
                viewBox="0 0 10 10"
                refX="18"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#8A532B" />
              </marker>
            </defs>

            {/* Connecting Edges */}
            {filteredEdges.map((edge) => {
              const src = conceptNodesData.find((n) => n.id === edge.source);
              const tgt = conceptNodesData.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const isHighlighted = connectedEdgeIds.has(edge.id);
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const cx1 = src.x + dx * 0.5;
              const cy1 = src.y;
              const cx2 = src.x + dx * 0.5;
              const cy2 = tgt.y;
              const pathData = `M ${src.x} ${src.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tgt.x} ${tgt.y}`;

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isHighlighted ? '#8A532B' : '#D5CFC7'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={edge.type === 'necessity' ? '4 3' : 'none'}
                    markerEnd={isHighlighted ? 'url(#graph-arrow-active)' : 'url(#graph-arrow)'}
                    className="transition-colors duration-200"
                    opacity={isHighlighted ? 1 : 0.45}
                  />
                  {isHighlighted && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 8}
                      textAnchor="middle"
                      className="text-[9px] fill-[#8A532B] dark:fill-[#C58B43] font-bold"
                    >
                      {currentLang === 'en' ? edge.label_en : currentLang === 'ar' ? edge.label_ar : edge.label_fa}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {conceptNodesData.map((node) => {
              const isSelected = activeNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isDimmed =
                (selectedDiscipline !== 'all' && node.discipline !== selectedDiscipline) ||
                (hoveredNodeId && hoveredNodeId !== node.id && !connectedNeighborIds.includes(node.id));

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setActiveNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform duration-200"
                  opacity={isDimmed ? 0.35 : 1}
                >
                  {/* Outer ring on selection */}
                  {isSelected && (
                    <rect
                      x="-74"
                      y="-26"
                      width="148"
                      height="52"
                      rx="16"
                      fill="none"
                      stroke="#8A532B"
                      strokeWidth="2"
                      className="animate-in fade-in"
                    />
                  )}

                  {/* Node Capsule */}
                  <rect
                    x="-68"
                    y="-20"
                    width="136"
                    height="40"
                    rx="12"
                    fill={isSelected ? '#8A532B' : '#FAF8F5'}
                    stroke={isSelected ? '#8A532B' : isHovered ? '#8A532B' : '#D0C8BF'}
                    strokeWidth={isSelected ? 1.5 : 1}
                    className="dark:fill-[#212328] dark:stroke-[#3D3E45] transition-colors"
                  />

                  {/* Discipline Mini-Dot */}
                  <circle
                    cx="-52"
                    cy="0"
                    r="4"
                    fill={
                      node.discipline === 'falsafe'
                        ? '#C58B43'
                        : node.discipline === 'mantiq'
                        ? '#5E7A8A'
                        : node.discipline === 'erfan'
                        ? '#8A532B'
                        : '#736357'
                    }
                  />

                  {/* Node Title */}
                  <text
                    x="-42"
                    y="4"
                    textAnchor="start"
                    className={`text-[10px] font-bold ${
                      isSelected ? 'fill-white' : 'fill-stone-900 dark:fill-stone-100'
                    }`}
                  >
                    {getNodeTitle(node)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hint bar at bottom of canvas */}
          <div className="flex items-center justify-between text-[11px] text-book-subtext pt-2 border-t border-[#EAE6DF] dark:border-[#27282D]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#8A532B]" />
              <span>{dict.concept_graph_hint || 'برای بررسی ارتباط و ارجاعات، روی هر مفهوم کلیک کنید.'}</span>
            </span>
            <span className="text-[10px] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full font-num">
              {conceptNodesData.length} {dict.concept_graph_node_count || 'گره استدلالی'}
            </span>
          </div>
        </div>

        {/* Selected Node Details Panel (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191D] border border-[#EAE6DF] dark:border-[#27282D] rounded-2xl p-5 space-y-4 shadow-sm text-start flex flex-col justify-between">
          <div className="space-y-3">
            {/* Discipline Tag & Tier */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-xs font-bold">
                {getDisciplineName(activeNode.discipline)}
              </span>
              <span className="text-[10px] text-book-subtext font-num">
                {getNodeTier(activeNode.tier)}
              </span>
            </div>

            {/* Title & Tagline */}
            <div>
              <h4 className="text-base sm:text-lg font-bold text-book-text dark:text-stone-100 font-bookTitle">
                {getNodeTitle(activeNode)}
              </h4>
              <p className="text-xs text-[#8A532B] dark:text-[#C58B43] font-medium mt-0.5">
                {getNodeTagline(activeNode)}
              </p>
            </div>

            {/* Full Explanation */}
            <p className="text-xs text-book-subtext dark:text-stone-300 leading-relaxed">
              {getNodeDescription(activeNode)}
            </p>

            {/* Key Scholars */}
            <div className="pt-2 border-t border-[#EAE6DF] dark:border-[#27282D]">
              <span className="text-[11px] font-bold text-book-subtext block mb-1.5">
                {dict.concept_graph_scholars || 'حکما و شارحان بنیادین:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.keyScholars.map((sch) => (
                  <span
                    key={sch}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] text-stone-700 dark:text-stone-300 font-medium"
                  >
                    {sch}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Concepts */}
            {connectedNeighborIds.length > 0 && (
              <div className="pt-2 border-t border-[#EAE6DF] dark:border-[#27282D]">
                <span className="text-[11px] font-bold text-book-subtext block mb-1.5">
                  {dict.concept_graph_connected || 'مفاهیم متصل در زنجیره استدلال:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {connectedNeighborIds.map((nid) => {
                    const neighbor = conceptNodesData.find((n) => n.id === nid);
                    if (!neighbor) return null;
                    return (
                      <button
                        key={nid}
                        onClick={() => setActiveNodeId(nid)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#8A532B]/10 hover:bg-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] font-bold transition cursor-pointer"
                      >
                        {getNodeTitle(neighbor)} ➔
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Link to Associated Audio Lecture */}
          <div className="pt-4 border-t border-[#EAE6DF] dark:border-[#27282D]">
            <Link
              href={`/courses/${activeNode.relatedCourseSlug}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition flex items-center justify-between shadow-xs"
            >
              <span className="truncate">{getRelatedCourseTitle(activeNode)}</span>
              <ArrowLeft className="w-4 h-4 shrink-0 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
