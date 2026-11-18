import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  LucideHouse,
  LucideImages,
  LucideBookOpen,
  LucideUser,
  LucideHeartPulse,
  LucideCalendarCheck,
  LucideSun,
  LucideMoon
} from '@lucide/angular';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideHouse,
    LucideImages,
    LucideUser,
    LucideBookOpen,
    LucideHeartPulse,
    LucideCalendarCheck,
    LucideSun,
    LucideMoon
  ],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation {

  protected isDarkMode = true;

  ngOnInit(): void {
    
    const savedTheme = localStorage.getItem('luma-theme');

    this.isDarkMode = savedTheme !== 'light';
    

    this.applyTheme();

  }

  protected toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    this.applyTheme();

      localStorage.setItem(
      'luma-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }

  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light'
    )
  }
}
