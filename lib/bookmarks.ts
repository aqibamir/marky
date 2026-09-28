"use client";

// Cheat-sheet bookmarks, stored client-side (localStorage). Keyed by the
// official question number (e.g. "1.2.09-101") rather than the dataset's
// question_id, so a bookmark made while reading in German still points at
// the same question after switching the app to English.

export interface Bookmark {
  questionNumber: string;
  at: number; // epoch ms, when it was bookmarked
}

const KEY = "marky:cheatsheet-bookmarks:v1";
const MAX_BOOKMARKS = 500;

export function loadBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Bookmark[]) : [];
    return Array.isArray(parsed) ? parsed.filter((b) => typeof b?.questionNumber === "string") : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(bookmarks.slice(0, MAX_BOOKMARKS)));
  } catch {
    // localStorage unavailable (private mode, etc.) - bookmarks just won't persist
  }
}

// Newest first, so the head of the list is always "where you left off".
export function toggleBookmark(bookmarks: Bookmark[], questionNumber: string): Bookmark[] {
  if (bookmarks.some((b) => b.questionNumber === questionNumber)) {
    return bookmarks.filter((b) => b.questionNumber !== questionNumber);
  }
  return [{ questionNumber, at: Date.now() }, ...bookmarks];
}
