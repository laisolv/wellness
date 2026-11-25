
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Profile as ProfileData } from '../../core/models/profile';
import { ProfileService } from '../../core/services/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {

  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly photo = signal<string | null>(null);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.profileService.getProfile().then(profile => {
      if (!profile) return;

      this.name.set(profile.name);
      this.description.set(profile.description);
      this.photo.set(profile.photo);
    });
  }

  protected updateName(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.name.set(input.value);
    this.errorMessage.set('');
  }

  protected updateDescription(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.description.set(textarea.value);
  }

  protected selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Selecione um arquivo de imagem válido.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('A imagem deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.photo.set(String(reader.result));
      this.errorMessage.set('');
    };

    reader.onerror = () => {
      this.errorMessage.set('Não foi possível carregar essa imagem.');
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  protected removePhoto(): void {
    this.photo.set(null);
  }

  protected async saveProfile(): Promise<void> {
    const name = this.name().trim();

    if (!name) {
      this.errorMessage.set('Digite seu nome antes de salvar.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const profile: ProfileData = {
      id: 1,
      name,
      description: this.description().trim(),
      photo: this.photo()
    };

    try {
      await this.profileService.saveProfile(profile);
      await this.router.navigateByUrl('/');
    } catch {
      this.errorMessage.set(
        'Não foi possível salvar seu perfil. Tente novamente.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigateByUrl('/');
  }

  protected getInitials(): string {
    const parts = this.name()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return 'L';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
}
