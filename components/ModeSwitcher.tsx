"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { loadAppSettings, saveAppSettings, type AppSettings } from "@/lib/appSettings";

function pillClass(active: boolean) {
  return `px-2 py-1 rounded-full font-medium transition-colors ${
    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

function ModeSwitcherInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<AppSettings>({ lang: "de", licenseClass: "all" });

  useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

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

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex bg-secondary rounded-full p-0.5">
        <button onClick={() => update({ lang: "de" })} className={pillClass(settings.lang === "de")}>
          DE
        </button>
        <button onClick={() => update({ lang: "en" })} className={pillClass(settings.lang === "en")}>
          EN
        </button>
      </div>
      <div className="flex bg-secondary rounded-full p-0.5">
        <button
          onClick={() => update({ licenseClass: "all" })}
          className={pillClass(settings.licenseClass === "all")}
          title="All questions, every class"
        >
          All
        </button>
        <button
          onClick={() => update({ licenseClass: "B" })}
          className={pillClass(settings.licenseClass === "B")}
          title="Grundstoff + Class B (car) Zusatzstoff, minus truck/bus-only chapters"
        >
          Class B
        </button>
      </div>
    </div>
  );
}

export default function ModeSwitcher() {
  return (
    <Suspense fallback={<div className="h-6 w-32" />}>
      <ModeSwitcherInner />
    </Suspense>
  );
}
