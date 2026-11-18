
import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';

interface Publication {
  id: number;
  date: string;
  content: string;
  image: string | null;
}

class LumaDatabase extends Dexie {
  publications!: Table<Publication, number>;

  constructor() {
    super('LumaDatabase');

    this.version(1).stores({
      publications: 'id, category, date'
    });
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
}
