import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-composer',
  imports: [],
  templateUrl: './composer.html',
  styleUrl: './composer.scss'
})
export class Composer implements OnChanges {

  @Input() open = false;
  @Input() initialContent = '';
  @Input() initialImage: string | null = null;
  @Input() editing = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{
    content: string;
    image: string | null;
  }>();

  protected readonly menuOpen = signal(false);
  protected readonly draft = signal('');
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly localOpen = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.draft.set(this.initialContent);
      this.imagePreview.set(this.initialImage);
    }
  }

  protected addText(): void {
    this.menuOpen.set(false);
    this.localOpen.set(true);
  }

  protected addPhoto(input: HTMLInputElement): void {
    this.menuOpen.set(false);
    input.click();
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.imagePreview.set(reader.result);
        this.localOpen.set(true);
      }
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  protected removePhoto(): void {
    this.imagePreview.set(null);
  }

  protected closeComposer(): void {
    this.menuOpen.set(false);
    this.localOpen.set(false);
    this.draft.set('');
    this.imagePreview.set(null);
    this.closed.emit();
  }

  protected publish(): void {
    const content = this.draft().trim();
    const image = this.imagePreview();

    if (!content && !image) return;

    this.localOpen.set(false);

    this.submitted.emit({ content, image });

    this.draft.set('');
    this.imagePreview.set(null);
  }
}