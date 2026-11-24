
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import {
  LucideDumbbell,
  LucideFootprints,
  LucideBike,
  LucideFlower2,
  LucideShield,
  LucideActivity,
  LucideSparkles,
  LucidePencil,
  LucideTrash,
  LucideX 
} from '@lucide/angular';

import { WellnessService } from '../../core/services/wellness.service';
import { WellnessActivity } from '../../core/models/wellness-activity';

@Component({
  standalone: true,
  selector: 'app-wellness',
  imports: [
    FormsModule,
    DatePipe,
    LucideDumbbell,
    LucideFootprints,
    LucideBike,
    LucideFlower2,
    LucideShield,
    LucideActivity,
    LucideSparkles,
    LucidePencil,
    LucideTrash,
    LucideX 
  ],
  styleUrl: './wellness.scss',
  templateUrl: './wellness.html',
})
export class Wellness {

  weekDays = [
    { label: 'SEG', date: 1 },
    { label: 'TER', date: 2 },
    { label: 'QUA', date: 3 },
    { label: 'QUI', date: 4 },
    { label: 'SEX', date: 5 },
    { label: 'SÁB', date: 6 },
    { label: 'DOM', date: 0 },
  ];

  showForm = false;

  activity: WellnessActivity = this.createEmptyActivity();

  activityToDelete: number | null = null;

  activities: WellnessActivity[] = [];

  isSaving = false;
  isDeleting = false;

  constructor(
    private wellnessService: WellnessService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadActivities();
  }

  private createEmptyActivity(): WellnessActivity {
    const today = new Date();

    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);

    return {
      date: localDate,
      activityType: '',
      durationMinutes: 30,
      notes: ''
    };
  }

  getActivityIcon(activityType: string): string {
    const type = activityType.trim().toLowerCase();

    switch (type) {
      case 'musculação':
      case 'musculacao':
        return 'dumbbell';

      case 'corrida':
      case 'caminhada':
        return 'footprints';

      case 'bicicleta':
        return 'bike';

      case 'yoga':
      case 'pilates':
        return 'flower';

      case 'jiu-jitsu':
        return 'shield';

      case 'funcional':
        return 'activity';

      default:
        return 'sparkles';
    }
  }

  isDayActive(day: number): boolean {
    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDay + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.activities.some(item => {
      const activityDate = new Date(`${item.date}T12:00:00`);

      return activityDate >= monday &&
        activityDate <= sunday &&
        activityDate.getDay() === day;
    });
  }

  loadActivities(): void {
    this.wellnessService.getAll()
      .then(activities => {
        this.activities = activities;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Erro ao carregar atividades:', error);
      });
  }

  openForm(): void {
    this.activity = this.createEmptyActivity();
    this.showForm = true;
  }

  editActivity(item: WellnessActivity): void {
    this.activity = { ...item };
    this.showForm = true;
  }

  deleteActivity(id: number): void {
    this.activityToDelete = id;
  }

  cancelDelete(): void {
    this.activityToDelete = null;
  }

  confirmDelete(): void {
    if (this.activityToDelete === null || this.isDeleting) {
      return;
    }

    const id = this.activityToDelete;
    this.isDeleting = true;

    this.wellnessService.delete(id)
      .then(() => {
        this.activities = this.activities.filter(
          item => item.id !== id
        );

        this.activityToDelete = null;
      })
      .catch(error => {
        console.error('Erro ao excluir atividade:', error);
      })
      .finally(() => {
        this.isDeleting = false;
        this.cdr.detectChanges();
      });
  }

  closeForm(): void {
    this.showForm = false;
  }

  savedActivity(): void {
    if (this.isSaving) {
      return;
    }

    if (
      !this.activity.activityType ||
      !this.activity.date ||
      this.activity.durationMinutes <= 0
    ) {
      return;
    }

    const activity = { ...this.activity };

    this.isSaving = true;

    const operation = activity.id !== undefined
      ? this.wellnessService.update(activity)
      : this.wellnessService.add(activity);

    operation
      .then(() => {
        this.closeForm();
        this.loadActivities();
      })
      .catch(error => {
        console.error('Erro ao salvar atividade:', error);
      })
      .finally(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      });
  }
}
