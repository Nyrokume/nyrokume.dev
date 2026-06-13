"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getContent, isLocale, LOCALE_STORAGE_KEY } from "@/lib/i18n";
import type { Locale, ResumeContent } from "@/lib/types";

type LocaleContextValue = {
  locale: Locale;
  content: ResumeContent;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const localeListeners = new Set<() => void>();

function subscribeLocale(onStoreChange: () => void) {
  localeListeners.add(onStoreChange);
  return () => {
    localeListeners.delete(onStoreChange);
  };
}

function getLocaleSnapshot(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : "ru";
}

function getLocaleServerSnapshot(): Locale {
  return "ru";
}

function publishLocale(next: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, next);
  document.documentElement.lang = next;
  localeListeners.forEach((listener) => listener());
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  const setLocale = useCallback((next: Locale) => {
    publishLocale(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      content: getContent(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
