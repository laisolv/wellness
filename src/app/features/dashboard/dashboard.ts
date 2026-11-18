import { Component, signal, inject, OnInit } from '@angular/core';
import { Publication } from '../../core/models/publication';
import { PublicationService } from '../../core/services/publication';


@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  ngOnInit(): void {
    this.publicationService.getAll().then(publications => {
      this.publications.set(publications)
    });
  }

  protected isNewDay(index: number): boolean {
    if (index === 0) return true;

    const currentDate = new Date(this.publications()[index].date);
    const previousDate = new Date(this.publications()[index -1 ].date);

    return currentDate.toDateString() !== previousDate.toDateString();
  }

  protected getDayLabel(date: string): string {
    const postDate = new Date(date);
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() -1 );

    if(postDate.toDateString() === today.toDateString()) {
      return 'HOJE';
    }

     if(postDate.toDateString() === yesterday.toDateString()) {
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

  protected getEditTime(editeAt?: string | null): string {
    if (!editeAt) return '';

    const now = new Date().getTime();
    const edited = new Date(editeAt).getTime();


    const difference = now - edited;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000)
    const days = Math.floor(difference / 86400000)


    if (minutes < 1) return 'editado agora'

    if (minutes < 60) return `editado há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;

    if (hours < 24) {
      return `editado há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }

    return `editado há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  private readonly publicationService = inject(PublicationService);

  protected readonly composerOpen = signal(false);
  protected readonly menuOpen = signal(false);

  protected readonly draft = signal('');
  protected readonly imagePreview = signal<string | null>(null);

  protected readonly confirmDeleteId = signal<number | null>(null);
  

  protected readonly editingPublicationId = signal<number | null>(null);

  protected async deletePublication(id: number): Promise<void> {
    await this.publicationService.delete(id);

    this.publications.update(posts => 
      posts.filter(post => post.id !==id)
    );

    this.openMenuId.set(null);
    this.confirmDeleteId.set(null);
  }

  protected readonly openMenuId = signal<number | null>(null);

  protected readonly publications = signal<Publication[]>([]);

  protected addText(input: HTMLTextAreaElement): void {
    this.menuOpen.set(false);
    input.focus
  }


  protected addPhoto(input: HTMLInputElement): void {
    this.menuOpen.set(false);
    input.click();
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if(!file) return;

    if(!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if(typeof reader.result === 'string') {
        this.imagePreview.set(reader.result);
      }
    };

    reader.readAsDataURL(file);

    input.value;

}

protected removePhoto(): void {
  this.imagePreview.set(null);
}

  protected async publish(): Promise<void> {
    const content = this.draft().trim();
    const image = this.imagePreview();
    const editingId = this.editingPublicationId();
    
    if(!content && !image) return;

    const publication: Publication = {
      id: editingId ?? Date.now(),
      date: editingId
   ? this.publications().find(post => post.id === editingId)!.date
    : new Date().toISOString(),
      content,
      image,
      editedAt: editingId !== null
      ? new Date().toISOString()
      : null
    };


    if (editingId !== null) {
      await this.publicationService.update(publication);

      this.publications.update(posts => 
        posts.map(post =>
          post.id === editingId ? publication : post
        )
      );
    } else {
       //enviando a publicação para o banco > aguardando > atualizando a lista na tela
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
    this.menuOpen.set(false)
    this.composerOpen.set(false);
}

  protected toggleMenu(id: number): void {
    this.openMenuId.update(currentId => 
      currentId === id ? null : id
    );
  }

  protected editPublication(post: Publication): void {
    this.editingPublicationId.set(post.id);
    this.draft.set(post.content);
    this.composerOpen.set(true);
    this.openMenuId.set(null);
  }

  

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
}