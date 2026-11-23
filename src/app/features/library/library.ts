import { Component, inject, OnInit, signal } from '@angular/core';
import { LibraryItem } from '../../core/models/library-item';
import { PublicationService } from '../../core/services/publication';

@Component({
  imports: [],
  selector: 'app-library',
  styleUrl: './library.scss',
  templateUrl: './library.html',
})
export class Library implements OnInit {

  private readonly publicationService = inject(PublicationService);

  protected readonly activeFilter = signal('tudo');
  protected readonly formOpen = signal(false);
  protected readonly newTitle = signal('');
  protected readonly newType = signal<LibraryItem['type']>('livro');
  protected readonly newDescription = signal('');
  protected readonly newRating = signal(5);
  protected readonly newImage = signal<string | null>(null);
  protected readonly itemToDelete = signal<number | null>(null);

 ngOnInit(): void {
    this.publicationService.getLibraryItems().then(items => {
      this.items.set(items);
    });
  }
  protected addItem(): void {
    const title = this.newTitle().trim();

    if (!title) return;

    const newItem: LibraryItem = {
      title,
      description: this.newDescription().trim(),
      type: this.newType(),
      image: this.newImage(),
      rating: this.newRating()
    };

    this.publicationService.addLibraryItem(newItem).then(id => {
          this.items.update(items => [...items, {...newItem, id }]);

    this.newTitle.set('');
    this.newDescription.set('');
    this.newType.set('livro');
    this.newRating.set(5);
    this.newImage.set(null);
    this.formOpen.set(false);

    })

  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if(!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if(typeof reader.result === 'string') {
        this.newImage.set(reader.result);
      }
    };

          reader.readAsDataURL(file);

  }

  protected readonly items = signal<LibraryItem[]>([]);

  protected filteredItems() {

    const filter = this.activeFilter();

    if (filter === 'tudo') {
      return this.items();
    }

    if (filter === 'livros') {
      return this.items().filter(item => item.type === 'livro');
    }

    if(filter === 'jogos') {
      return this.items().filter(item => item.type === 'jogo');
    }

    if(filter === 'filmes'){
      return this.items().filter(item => item.type === 'filme')
    }

    return [];
  }

  protected deleteItem(id: number): void {
    this.publicationService.deleteLibraryItem(id).then(() => {
      this.items.update(items => 
        items.filter(item => item.id !== id)
      );
    })
  }

  protected confirmDelete(): void {
    const id = this.itemToDelete();

    if(id === null) return;

    this.deleteItem(id);
    this.itemToDelete.set(null);
  }

}
