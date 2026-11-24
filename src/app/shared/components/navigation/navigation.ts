import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme';

import {
  LucideHouse,
  LucideImages,
  LucideBookOpen,
  LucideHeartPulse
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

  // IMPORTANTE: mesmo sem usar this.themeService em lugar nenhum,
  // injetar o serviço é o que o instancia no início do app e restaura
  // o tema salvo. Sem isto, a página sempre abre no modo escuro.
  private readonly themeService = inject(ThemeService);

  // Signals: garantem que a tela atualize mesmo quando a mudança vem de
  // fora de um evento do template (ex.: NavigationEnd do router, rAF).
  // Em apps sem zone.js (zoneless), propriedades comuns NÃO atualizam a tela.
  readonly activeIndex = signal(0);
  readonly isDragging = signal(false);

  // Só liga a animação do indicador depois da primeira posição correta,
  // para ele não "deslizar" do Início até a aba atual ao recarregar.
  readonly isReady = signal(false);

  private startX = 0;
  private moved = false;
  private startIndex = 0;

  private activePointerId: number | null = null;
  private suppressNextClick = false;

  // Medidas do container guardadas no início do gesto,
  // evitando querySelector + getBoundingClientRect a cada movimento.
  private linksLeft = 0;
  private linksWidth = 0;

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

    // Se a navegação inicial já terminou, a posição já está certa.
    if (this.router.navigated) {
      this.enableTransitions();
    }

    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        // Não puxa o indicador de volta enquanto o dedo está arrastando.
        if (this.isDragging()) return;

        this.updateActiveIndex(
          (event as NavigationEnd).urlAfterRedirects
        );

        // Primeira rota resolvida (ex.: F5 na galeria): agora sim anima.
        if (!this.isReady()) {
          this.enableTransitions();
        }
      });
  }

  private enableTransitions(): void {
    // Dois frames: garante que a posição inicial foi pintada sem animação.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.isReady.set(true);
      })
    );
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();

    if (this.clickResetTimer) {
      clearTimeout(this.clickResetTimer);
    }
  }

  private updateActiveIndex(url: string): void {
    const currentRoute =
      url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    const index = this.routes.findIndex(route =>
      route === '/'
        ? currentRoute === '/'
        : currentRoute === route ||
          currentRoute.startsWith(route + '/') ||
          currentRoute.endsWith(route) // rotas dentro de um prefixo (ex.: /app/memories)
    );

    // DEBUG TEMPORÁRIO: remova depois de resolver.
    console.log('[nav] url:', url, '| rota:', currentRoute, '| índice:', index);

    if (index !== -1) {
      this.activeIndex.set(index);
    } else {
      console.warn('[nav] nenhuma rota do menu bate com', currentRoute);
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

    // CORRIGIDO: move o indicador NA HORA.
    // Antes ele só se movia no NavigationEnd, ou seja, depois da rota
    // carregar e da transição de página, o que causava o atraso.
    this.activeIndex.set(index);

    this.goTo(index);
  }

  private goTo(index: number): void {
    this.router.navigateByUrl(this.routes[index])
      .then(success => {
        // Se a navegação foi cancelada, volta o indicador para a rota real.
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
    // Um novo toque inicia uma interação independente.
    this.suppressNextClick = false;

    if (this.clickResetTimer) {
      clearTimeout(this.clickResetTimer);
      this.clickResetTimer = undefined;
    }

    // Mouse continua usando o clique normal (sem arraste).
    if (event.pointerType === 'mouse') return;

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    this.linksLeft = rect.left;
    this.linksWidth = rect.width;

    this.activePointerId = event.pointerId;

    this.startX = event.clientX;
    this.startIndex = this.activeIndex();

    this.moved = false;
    this.isDragging.set(false);
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
      this.isDragging.set(true);

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

      const selectedIndex = this.activeIndex();

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

      this.goTo(selectedIndex);

    } else {
      // Um simples toque não movimenta o indicador aqui;
      // o clique que vem em seguida cuida disso.
      this.activeIndex.set(this.startIndex);
    }

    this.isDragging.set(false);
    this.moved = false;
    this.activePointerId = null;
  }

  onPointerCancel(): void {
    this.isDragging.set(false);
    this.moved = false;
    this.activePointerId = null;

    this.updateActiveIndex(this.router.url);
  }

  /* =================================
     CÁLCULO DA POSIÇÃO
  ================================= */

  private updateIndexFromPosition(clientX: number): void {
    if (this.linksWidth <= 0) return;

    const slotWidth = this.linksWidth / this.routes.length;
    const position = clientX - this.linksLeft;
    const index = Math.floor(position / slotWidth);

    this.activeIndex.set(
      Math.max(0, Math.min(this.routes.length - 1, index))
    );
  }
}