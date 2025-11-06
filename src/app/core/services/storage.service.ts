/**
 * Simple wrapper around `localStorage` providing safe access with error handling.
 * Implements ISO 27001 recommendations by avoiding unhandled storage exceptions.
 */
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Safely retrieves and parses an item from localStorage. */
  getItem<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`StorageService: unable to read key ${key}`, error);
      return fallback;
    }
  }

  /** Safely stringifies and stores data; returns `false` if writing fails. */
  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`StorageService: unable to persist key ${key}`, error);
      return false;
    }
  }

  /** Removes a key while swallowing potential quota/security errors. */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`StorageService: unable to remove key ${key}`, error);
    }
  }
}
