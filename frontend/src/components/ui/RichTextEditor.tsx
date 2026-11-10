"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  AlignRight,
  AlignCenter,
  AlignLeft,
} from "lucide-react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "متن خود را اینجا بنویسید...",
  minHeight = "220px",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);
  const lastHtmlRef = useRef(value || "");
  const savedRangeRef = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    ul: boolean;
    ol: boolean;
    block: string;
  }>({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
    block: "p",
  });

  // Sync external `value` changes (e.g. when switching chapters/articles or resetting form)
  // WITHOUT resetting the cursor position while the user is actively typing!
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const incoming = value || "";
    if (!isFocusedRef.current && el.innerHTML !== incoming) {
      el.innerHTML = incoming;
      lastHtmlRef.current = incoming;
    } else if (incoming === "" && lastHtmlRef.current !== "") {
      el.innerHTML = "";
      lastHtmlRef.current = "";
    }
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
        block: (document.queryCommandValue("formatBlock") || "p").toLowerCase(),
      });
    } catch {
      // Ignore queryCommandState errors in unsupported contexts
    }
  }, []);

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const triggerChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange(html);
    }
    updateActiveFormats();
  };

  const exec = (command: string, arg?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, arg);
    triggerChange();
  };

  const handleFormatBlock = (tag: string) => {
    const currentBlock = activeFormats.block.replace(/[<>]/g, "");
    const nextTag = currentBlock === tag.toLowerCase() ? "p" : tag;
    exec("formatBlock", `<${nextTag}>`);
  };

  const handleInsertLink = () => {
    restoreSelection();
    const url = window.prompt("آدرس لینک (URL) را وارد کنید:", "https://");
    if (url && url.trim() && url !== "https://") {
      restoreSelection();
      exec("createLink", url.trim());
    }
  };

  // Clean paste so copied text from other websites doesn't inject broken inline styles
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    triggerChange();
  };

  const btnBase =
    "p-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center select-none cursor-pointer";
  const btnInactive =
    "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800";
  const btnActive =
    "bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/30 font-bold";

  const isEmpty = !value || value === "<br>" || value.trim() === "";

  return (
    <div
      dir="rtl"
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] overflow-hidden focus-within:ring-2 focus-within:ring-[#8A532B]/40 transition-shadow ${className}`}
    >
      {/* Toolbar: Every button uses onMouseDown preventDefault so editor NEVER loses focus/selection */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
        <button
          type="button"
          title="ضخیم (Ctrl+B)"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          className={`${btnBase} ${activeFormats.bold ? btnActive : btnInactive}`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="کج (Ctrl+I)"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          className={`${btnBase} ${activeFormats.italic ? btnActive : btnInactive}`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="زیرخط (Ctrl+U)"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("underline");
          }}
          className={`${btnBase} ${activeFormats.underline ? btnActive : btnInactive}`}
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          title="تیتر اصلی (H2)"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormatBlock("h2");
          }}
          className={`${btnBase} ${activeFormats.block.includes("h2") ? btnActive : btnInactive}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="زیرتیتر (H3)"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormatBlock("h3");
          }}
          className={`${btnBase} ${activeFormats.block.includes("h3") ? btnActive : btnInactive}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="نقل‌قول"
          onMouseDown={(e) => {
            e.preventDefault();
            handleFormatBlock("blockquote");
          }}
          className={`${btnBase} ${activeFormats.block.includes("blockquote") ? btnActive : btnInactive}`}
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          title="لیست نقطه‌ای"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertUnorderedList");
          }}
          className={`${btnBase} ${activeFormats.ul ? btnActive : btnInactive}`}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="لیست شماره‌دار"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertOrderedList");
          }}
          className={`${btnBase} ${activeFormats.ol ? btnActive : btnInactive}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          title="راست‌چین"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("justifyRight");
          }}
          className={`${btnBase} ${btnInactive}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="وسط‌چین"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("justifyCenter");
          }}
          className={`${btnBase} ${btnInactive}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="چپ‌چین"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("justifyLeft");
          }}
          className={`${btnBase} ${btnInactive}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          title="افزودن لینک"
          onMouseDown={(e) => {
            e.preventDefault();
            handleInsertLink();
          }}
          className={`${btnBase} ${btnInactive}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          title="پاک کردن فرمت"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("removeFormat");
            exec("formatBlock", "<p>");
          }}
          className={`${btnBase} ${btnInactive}`}
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        <div className="mr-auto flex items-center gap-1">
          <button
            type="button"
            title="بازگشت به قبل (Ctrl+Z)"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("undo");
            }}
            className={`${btnBase} ${btnInactive}`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="انجام مجدد (Ctrl+Y)"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("redo");
            }}
            className={`${btnBase} ${btnInactive}`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editable Content Area */}
      <div className="relative">
        {isEmpty && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-4 right-4 text-sm text-zinc-400 dark:text-zinc-500 select-none"
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          style={{ minHeight }}
          onFocus={() => {
            isFocusedRef.current = true;
            updateActiveFormats();
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            triggerChange();
          }}
          onInput={triggerChange}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onPaste={handlePaste}
          className="p-4 outline-none text-right text-sm leading-8 text-zinc-900 dark:text-zinc-100
            [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2.5
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2
            [&_p]:my-1.5
            [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:my-2
            [&_li]:my-1
            [&_blockquote]:border-r-4 [&_blockquote]:border-[#8A532B] dark:[&_blockquote]:border-[#C58B43] [&_blockquote]:bg-[#8A532B]/5 dark:[&_blockquote]:bg-[#C58B43]/10 [&_blockquote]:pr-4 [&_blockquote]:py-1.5 [&_blockquote]:my-2 [&_blockquote]:rounded-l-lg [&_blockquote]:font-semibold
            [&_a]:text-[#8A532B] dark:[&_a]:text-[#C58B43] [&_a]:underline"
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
