
import { Injectable, inject } from '@angular/core';

import { LumaDatabase } from './publication';
import { Profile } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly db = inject(LumaDatabase);

  getProfile(): Promise<Profile | undefined> {
    return this.db.profiles.get(1);
  }

  saveProfile(profile: Profile): Promise<number> {
    return this.db.profiles.put(profile);
  }
}
