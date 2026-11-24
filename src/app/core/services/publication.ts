
import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';
import { LibraryItem } from '../models/library-item';
import { WellnessActivity } from '../models/wellness-activity';

interface Publication {
  id: number;
  date: string;
  content: string;
  image: string | null;
}

class LumaDatabase extends Dexie {
  publications!: Table<Publication, number>;
  libraryItems!: Table<LibraryItem, number>;
  wellnessActivities!: Table<WellnessActivity, number>;

 constructor() {
  super('LumaDatabase');

  this.version(1).stores({
    publications: 'id, category, date'
  });

  this.version(2).stores({
    publications: 'id, category, date',
    libraryItems: '++id, type, title'
  });

  this.version(3).stores({
    publications: 'id, category, date',
    libraryItems: '++id, type, title',
    wellnessActivities: '++id, date, activityType'
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

  getWellnessActivities() {
    return this.db.wellnessActivities
    .orderBy('date')
    .reverse()
    .toArray();
  }

  addWellnessActivity(activity: WellnessActivity) {
    return this.db.wellnessActivities.add(activity);
  }

  deleteWellnessActivity(id: number) {
    return this.db.wellnessActivities.delete(id);
  }

  updateWellnessActivity(activity: WellnessActivity) {
    return this.db.wellnessActivities.put(activity);
  }
}
