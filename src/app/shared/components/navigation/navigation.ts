
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

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
    LucideUser,
    LucideBookOpen,
    LucideHeartPulse,
    LucideSun,
    LucideMoon
  ],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation implements OnInit, OnDestroy {

  protected isDarkMode = true;

  activeIndex = 0;
  isDragging = false;

  private startX = 0;
  private moved = false;
  private startIndex = 0;

  private activePointerId: number | null = null;
  private suppressNextClick = false;

  private navigationSubscription?: Subscription;

  private readonly routes = [
    '/',
    '/memories',
    '/library',
    '/wellness',
    '/profile'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('luma-theme');

    this.isDarkMode = savedTheme !== 'light';
    this.applyTheme();

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
      return;
    }

    if (index < 0 || index >= this.routes.length) {
      return;
    }

    // Não altera o indicador antecipadamente.
    // A posição será atualizada no NavigationEnd.

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

    // Mouse não movimenta o indicador.
    if (event.pointerType === 'mouse') return;

    // O botão de tema não participa do arraste.
    if (target.closest('.theme-toggle')) return;

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

    // Só considera arraste depois de um movimento real.
    if (!this.moved && distance < 8) return;

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

      this.router.navigateByUrl(this.routes[selectedIndex])
        .then(success => {
          if (!success) {
            this.updateActiveIndex(this.router.url);
          }
        })
        .catch(() => {
          this.updateActiveIndex(this.router.url);
        });

      // Evita que o clique sintético do gesto seja interpretado
      // como um segundo clique.
      setTimeout(() => {
        this.suppressNextClick = false;
      }, 0);

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

    // Retorna para a rota realmente aberta.
    this.updateActiveIndex(this.router.url);
  }

  /* =================================
     CÁLCULO DA POSIÇÃO
  ================================= */

  private updateIndexFromPosition(clientX: number): void {
    const element = document.querySelector('.navigation-links');

    if (!element) return;

    const links = element.querySelectorAll(':scope > a');

    if (!links.length) return;

    const first = links[0].getBoundingClientRect();
    const last = links[links.length - 1].getBoundingClientRect();

    const totalWidth = last.right - first.left;
    const itemWidth = totalWidth / links.length;

    const position = clientX - first.left;

    const index = Math.floor(position / itemWidth);

    this.activeIndex = Math.max(
      0,
      Math.min(links.length - 1, index)
    );
  }

  /* =================================
     TEMA
  ================================= */

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
}
