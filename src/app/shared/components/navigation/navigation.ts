
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme';

import {
  LucideHouse,
  LucideImages,
  LucideBookOpen,
  LucideUser,
  LucideHeartPulse,
  LucideSun,
  LucideMoon
} from '@lucide/angular';

@Component({
  standalone: true,
  imports: [
    LucideHouse,
    LucideImages,
    LucideBookOpen,
    LucideHeartPulse
  ],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation implements OnInit, OnDestroy {

  private readonly themeService = inject(ThemeService);

  protected get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  activeIndex = 0;
  isDragging = false;

  private startX = 0;
  private moved = false;
  private startIndex = 0;

  private activePointerId: number | null = null;
  private suppressNextClick = false;

  private clickResetTimer?: ReturnType<typeof setTimeout>;
  private navigationSubscription?: Subscription;

  private readonly routes = [
    '/',
    '/memories',
    '/library',
    '/wellness'  
  ];

  constructor(private router: Router) {}

 ngOnInit(): void {
  this.updateActiveIndex(this.router.url);

  this.navigationSubscription = this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe(event => {
      this.updateActiveIndex(
        (event as NavigationEnd).urlAfterRedirects
      );
    });
}

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();

    if (this.clickResetTimer) {
      clearTimeout(this.clickResetTimer);
    }
  }

  private updateActiveIndex(url: string): void {
    const currentRoute = url.split('?')[0].split('#')[0];

    const index = this.routes.indexOf(currentRoute);

    if (index !== -1) {
      this.activeIndex = index;
    }
  }

  /* =================================
     NAVEGAÇÃO POR CLIQUE
  ================================= */

  navigate(event: MouseEvent, index: number): void {
    event.preventDefault();

    if (this.suppressNextClick) {
      this.suppressNextClick = false;

      if (this.clickResetTimer) {
        clearTimeout(this.clickResetTimer);
      }

      return;
    }

    if (index < 0 || index >= this.routes.length) {
      return;
    }

    this.router.navigateByUrl(this.routes[index])
      .then(success => {
        if (!success) {
          this.updateActiveIndex(this.router.url);
        }
      })
      .catch(() => {
        this.updateActiveIndex(this.router.url);
      });
  }

  /* =================================
     INÍCIO DO GESTO
  ================================= */

  onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;

    // Mouse continua usando o clique normal.
    if (event.pointerType === 'mouse') return;

    this.activePointerId = event.pointerId;

    this.startX = event.clientX;
    this.startIndex = this.activeIndex;

    this.moved = false;
    this.isDragging = false;
  }

  /* =================================
     MOVIMENTO DO DEDO
  ================================= */

  onPointerMove(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) return;

    const distance = Math.abs(event.clientX - this.startX);

    // Evita interpretar pequenos toques como arraste.
    if (!this.moved && distance < 5) return;

    if (!this.moved) {
      this.moved = true;
      this.isDragging = true;

      const element = event.currentTarget as HTMLElement;

      element.setPointerCapture(event.pointerId);
    }

    this.updateIndexFromPosition(event.clientX);
  }

  /* =================================
     FINAL DO GESTO
  ================================= */

  onPointerUp(event: PointerEvent): void {
    if (this.activePointerId !== event.pointerId) return;

    const element = event.currentTarget as HTMLElement;

    if (this.moved) {
      this.updateIndexFromPosition(event.clientX);

      const selectedIndex = this.activeIndex;

      this.suppressNextClick = true;

      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }

      if (this.clickResetTimer) {
        clearTimeout(this.clickResetTimer);
      }

      // Protege contra o clique sintético após o arraste.
      this.clickResetTimer = setTimeout(() => {
        this.suppressNextClick = false;
      }, 500);

      this.router.navigateByUrl(this.routes[selectedIndex])
        .then(success => {
          if (!success) {
            this.updateActiveIndex(this.router.url);
          }
        })
        .catch(() => {
          this.updateActiveIndex(this.router.url);
        });

    } else {
      // Um simples toque não movimenta o indicador.
      this.activeIndex = this.startIndex;
    }

    this.isDragging = false;
    this.moved = false;
    this.activePointerId = null;
  }

  onPointerCancel(): void {
    this.isDragging = false;
    this.moved = false;
    this.activePointerId = null;

    this.updateActiveIndex(this.router.url);
  }

  /* =================================
     CÁLCULO DA POSIÇÃO
  ================================= */

  private updateIndexFromPosition(clientX: number): void {
    const element = document.querySelector(
      '.navigation-links'
    ) as HTMLElement | null;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Seis espaços iguais:
    // Início, Memórias, Biblioteca, Bem-estar, Perfil e Tema.
    const totalSlots = 4;
    const slotWidth = rect.width / totalSlots;

    const position = clientX - rect.left;
    const index = Math.floor(position / slotWidth);

    // O botão de tema não é uma rota.
    this.activeIndex = Math.max(
      0,
      Math.min(this.routes.length - 1, index)
    );
  }

  /* =================================
     TEMA
  ================================= */


  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }
}
