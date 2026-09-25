"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Segmented } from "@/components/ui/segmented";
import { loadAppSettings, saveAppSettings, type AppSettings } from "@/lib/appSettings";

const LANG_OPTIONS = [
  { value: "de" as const, label: "DE", title: "German question text" },
  { value: "en" as const, label: "EN", title: "English question text" },
];
const CLASS_OPTIONS = [
  { value: "all" as const, label: "All", title: "All questions, every class" },
  {
    value: "B" as const,
    label: "Class B",
    title: "Grundstoff + Class B (car) Zusatzstoff, minus truck/bus-only chapters",
  },
];

function ModeSwitcherInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<AppSettings>({ lang: "de", licenseClass: "all" });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

  // Close the phone menu on an outside tap or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAppSettings(next);
    // /driving-questions is a plain server-rendered page driven by its own
    // URL params - keep it in sync so the switch takes effect there too.
    if (pathname === "/driving-questions") {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.lang) params.set("lang", patch.lang);
      if (patch.licenseClass) params.set("class", patch.licenseClass);
      router.push(`/driving-questions?${params.toString()}`);
    }
  }

  const controls = (
    <>
      <Segmented
        label="Question language"
        size="sm"
        options={LANG_OPTIONS}
        value={settings.lang}
        onChange={(lang) => update({ lang })}
      />
      <Segmented
        label="Licence class"
        size="sm"
        options={CLASS_OPTIONS}
        value={settings.licenseClass}
        onChange={(licenseClass) => update({ licenseClass })}
      />
    </>
  );

  return (
    <>
      {/* Desktop: both switches inline. */}
      <div className="hidden lg:flex items-center gap-1.5">{controls}</div>

      {/* Phones: one chip naming the current mode, opening a small menu -
          two segmented controls don't fit beside the name at 390px. */}
      <div ref={menuRef} className="relative lg:hidden">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full border border-input bg-card text-[13px] font-semibold"
        >
          {settings.lang.toUpperCase()} · {settings.licenseClass === "B" ? "Class B" : "All classes"}
          <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-30 w-60 rounded-2xl border border-border bg-popover p-3 shadow-lg space-y-3">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question language
              </div>
              <Segmented
                label="Question language"
                options={LANG_OPTIONS}
                value={settings.lang}
                onChange={(lang) => update({ lang })}
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Licence class
              </div>
              <Segmented
                label="Licence class"
                options={CLASS_OPTIONS}
                value={settings.licenseClass}
                onChange={(licenseClass) => update({ licenseClass })}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ModeSwitcher() {
  return (
    <Suspense fallback={<div className="h-8 w-32" />}>
      <ModeSwitcherInner />
    </Suspense>
  );
}
