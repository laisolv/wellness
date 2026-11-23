
import {
  Component,
  signal,
  OnDestroy
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

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
export class Navigation implements OnDestroy {

  protected isDarkMode = true;

  // Controle da posição e deformação do vidro
  protected readonly glassIndex = signal(0);
  protected readonly activeGlassIndex = signal(0);
  protected readonly glassStretch = signal(1);
  protected readonly glassOrigin = signal('center center');

  private isHovering = false;
  private stretchTimeout: ReturnType<typeof setTimeout> | null = null;

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
    );
  }

  // Atualiza a página ativa
  protected setActive(index: number, active: boolean): void {
    if (!active) return;

    this.activeGlassIndex.set(index);

    if (!this.isHovering) {
      this.glassIndex.set(index);
    }
  }

  // Move e estica o vidro
  protected moveGlass(index: number): void {
    const currentIndex = this.glassIndex();

    this.isHovering = true;

    if (currentIndex !== index) {
      this.glassOrigin.set(
        index > currentIndex ? 'left center' : 'right center'
      );

      this.glassStretch.set(1.55);
      this.glassIndex.set(index);
    }

    if (this.stretchTimeout) {
      clearTimeout(this.stretchTimeout);
    }

    this.stretchTimeout = setTimeout(() => {
      this.glassStretch.set(1);
    }, 280);
  }

  // Retorna para a página selecionada
  protected restoreGlass(): void {
    this.isHovering = false;

    this.glassIndex.set(this.activeGlassIndex());
    this.glassStretch.set(1);

    if (this.stretchTimeout) {
      clearTimeout(this.stretchTimeout);
      this.stretchTimeout = null;
    }
  }

  ngOnDestroy(): void {
    if (this.stretchTimeout) {
      clearTimeout(this.stretchTimeout);
    }
  }
}
