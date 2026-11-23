import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { Publication } from '../../core/models/publication';
import { PublicationService } from '../../core/services/publication';
import { Composer } from './composer/composer';

@Component({
  selector: 'app-dashboard',
  imports: [Composer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private readonly publicationService = inject(PublicationService);

  protected readonly composerOpen = signal(false);
  protected readonly draft = signal('');
  protected readonly imagePreview = signal<string | null>(null);

  protected readonly confirmDeleteId = signal<number | null>(null);
  protected readonly editingPublicationId = signal<number | null>(null);
  protected readonly openMenuId = signal<number | null>(null);
  protected readonly publications = signal<Publication[]>([]);

  // Visualização de fotografias
  protected readonly selectedImage = signal<string | null>(null);
  protected readonly selectedImageIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.publicationService.getAll().then(publications => {
      this.publications.set(publications);
    });
  }

  // Timeline

  protected isNewDay(index: number): boolean {
    if (index === 0) return true;

    const currentDate = new Date(this.publications()[index].date);
    const previousDate = new Date(this.publications()[index - 1].date);

    return currentDate.toDateString() !== previousDate.toDateString();
  }

  protected getDayLabel(date: string): string {
    const postDate = new Date(date);
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (postDate.toDateString() === today.toDateString()) {
      return 'HOJE';
    }

    if (postDate.toDateString() === yesterday.toDateString()) {
      return 'ONTEM';
    }

    return postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    }).toUpperCase();
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getEditTime(editedAt?: string | null): string {
    if (!editedAt) return '';

    const now = new Date().getTime();
    const edited = new Date(editedAt).getTime();

    const difference = now - edited;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return 'editado agora';

    if (minutes < 60) {
      return `editado há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }

    if (hours < 24) {
      return `editado há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }

    return `editado há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  // Cadastro e edição

  protected async publish(data: {
    content: string;
    image: string | null;
  }): Promise<void> {

    const content = data.content.trim();
    const image = data.image;
    const editingId = this.editingPublicationId();

    if (!content && !image) return;

    const existingPublication = editingId !== null
      ? this.publications().find(post => post.id === editingId)
      : null;

    const publication: Publication = {
      id: editingId ?? Date.now(),
      date: existingPublication?.date ?? new Date().toISOString(),
      content,
      image,
      editedAt: editingId !== null ? new Date().toISOString() : null
    };

    if (editingId !== null) {
      await this.publicationService.update(publication);

      this.publications.update(posts =>
        posts.map(post =>
          post.id === editingId ? publication : post
        )
      );
    } else {
      await this.publicationService.add(publication);

      this.publications.update(posts => [
        publication,
        ...posts
      ]);
    }

    this.draft.set('');
    this.imagePreview.set(null);
    this.editingPublicationId.set(null);
    this.openMenuId.set(null);
    this.composerOpen.set(false);
  }

  protected closeComposer(): void {
    this.composerOpen.set(false);
    this.draft.set('');
    this.imagePreview.set(null);
    this.editingPublicationId.set(null);
  }

  protected editPublication(post: Publication): void {
    this.editingPublicationId.set(post.id);
    this.draft.set(post.content);
    this.imagePreview.set(post.image);

    this.composerOpen.set(true);
    this.openMenuId.set(null);
  }

  // Menu de opções

  protected toggleMenu(id: number): void {
    this.openMenuId.update(currentId =>
      currentId === id ? null : id
    );
  }

  @HostListener('document:click', ['$event'])
  protected closeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target;

    if (
      target instanceof Element &&
      !target.closest('.publication-menu')
    ) {
      this.openMenuId.set(null);
    }
  }

  // Exclusão

  protected requestDelete(id: number): void {
    this.confirmDeleteId.set(id);
    this.openMenuId.set(null);
  }

  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  protected confirmDelete(): void {
    const id = this.confirmDeleteId();

    if (id === null) return;

    this.deletePublication(id);
  }

  protected async deletePublication(id: number): Promise<void> {
    await this.publicationService.delete(id);

    this.publications.update(posts =>
      posts.filter(post => post.id !== id)
    );

    this.openMenuId.set(null);
    this.confirmDeleteId.set(null);
  }

  // Visualização ampliada das fotografias

  protected openImage(image: string): void {
    const images = this.getImages();
    const index = images.indexOf(image);

    this.selectedImageIndex.set(index);
    this.selectedImage.set(image);
    this.openMenuId.set(null);
  }

  protected closeImage(): void {
    this.selectedImage.set(null);
    this.selectedImageIndex.set(null);
  }

  protected previousImage(event: MouseEvent): void {
    event.stopPropagation();

    const images = this.getImages();
    if (images.length === 0) return;

    const currentIndex = this.selectedImageIndex() ?? 0;
    const previousIndex =
      (currentIndex - 1 + images.length) % images.length;

    this.selectedImageIndex.set(previousIndex);
    this.selectedImage.set(images[previousIndex]);
  }

  protected nextImage(event: MouseEvent): void {
    event.stopPropagation();

    const images = this.getImages();
    if (images.length === 0) return;

    const currentIndex = this.selectedImageIndex() ?? 0;
    const nextIndex = (currentIndex + 1) % images.length;

    this.selectedImageIndex.set(nextIndex);
    this.selectedImage.set(images[nextIndex]);
  }

  private getImages(): string[] {
    return this.publications()
      .filter(post => post.image !== null)
      .map(post => post.image as string);
  }

  // Tecla Escape fecha as visualizações

  @HostListener('document:keydown.escape')
  protected closeOverlays(): void {
    this.closeImage();
    this.openMenuId.set(null);
  }
}
