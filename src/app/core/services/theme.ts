import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'luma-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  readonly isDarkMode = signal(true);

  constructor() {
    this.isDarkMode.set(this.readSavedTheme() !== 'light');
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);

    this.applyTheme();

    try {
      localStorage.setItem(
        STORAGE_KEY,
        this.isDarkMode() ? 'dark' : 'light'
      );
    } catch {
      // Armazenamento indisponível (ex.: modo privado): ignora.
    }
  }

  private readSavedTheme(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode() ? 'dark' : 'light'
    );
  }
}