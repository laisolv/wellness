import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publication } from '../../core/models/publication';
import { PublicationService } from '../../core/services/publication';

@Component({
  imports: [
    DatePipe
  ],
  selector: 'app-memories',
  styleUrl: './memories.scss',
  templateUrl: './memories.html',
})
export class Memories implements OnInit {

  private publicationService = inject(PublicationService);

  protected readonly memories = signal<Publication[]>([]);
  protected readonly selectedMemory = signal<Publication | null>(null);

  protected openMemory(memory: Publication): void {
    this.selectedMemory.set(memory);
  }

  protected closeMemory(): void {
    this.selectedMemory.set(null);
  }

  async ngOnInit(): Promise<void> {
    
    const publications = await this.publicationService.getAll();

    this.memories.set(
      publications.filter(publication => publication.image)
    )
  }
}
