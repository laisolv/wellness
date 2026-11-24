
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  readonly isDarkMode = signal(true);

  constructor() {
    const savedTheme = localStorage.getItem('luma-theme');

    this.isDarkMode.set(savedTheme !== 'light');
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);

    this.applyTheme();

    localStorage.setItem(
      'luma-theme',
      this.isDarkMode() ? 'dark' : 'light'
    );
  }

  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode() ? 'dark' : 'light'
    );
  }
}
