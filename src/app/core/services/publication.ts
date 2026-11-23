
import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';
import { LibraryItem } from '../models/library-item';

interface Publication {
  id: number;
  date: string;
  content: string;
  image: string | null;
}

class LumaDatabase extends Dexie {
  publications!: Table<Publication, number>;
  libraryItems!: Table<LibraryItem, number>;

  constructor() {
    super('LumaDatabase');

    this.version(1).stores({
      publications: 'id, category, date'
    });

    this.version(2).stores({
      publications: 'id, category, date',
      libraryItems: '++id, type, title'
    })
  }
}

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private db = new LumaDatabase();

  getAll() {
    return this.db.publications.orderBy('id').reverse().toArray();
  }

  add(publication: Publication) {
    return this.db.publications.add(publication);
  }

  delete(id: number) {
    return this.db.publications.delete(id);
  }

  update(publication: Publication) {
    return this.db.publications.put(publication);
  }

  getLibraryItems() {
    return this.db.libraryItems.orderBy('id').reverse().toArray();
  }

  addLibraryItem(item: LibraryItem) {
    return this.db.libraryItems.add(item);
  }

  deleteLibraryItem(id: number) {
    return this.db.libraryItems.delete(id);
  }

  updateLibraryItem(item: LibraryItem) {
    return this.db.libraryItems.put(item);
  }
}
