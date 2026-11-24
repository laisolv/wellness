
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { WellnessService } from '../../core/services/wellness.service';
import { WellnessActivity } from '../../core/models/wellness-activity';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
  selector: 'app-wellness',
  styleUrl: './wellness.scss',
  templateUrl: './wellness.html',
})
export class Wellness {

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

  // Carregar atividades
  loadActivities() {
    this.wellnessService.getAll()
      .then(activities => {
        this.activities = activities;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Erro ao carregar atividades:', error);
      });
  }

  // Abrir formulário
  openForm() {
    this.activity = this.createEmptyActivity();
    this.showForm = true;
  }

  // Editar atividade
  editActivity(item: WellnessActivity) {
    this.activity = { ...item };
    this.showForm = true;
  }

  // Solicitar exclusão
  deleteActivity(id: number) {
    this.activityToDelete = id;
  }

  // Cancelar exclusão
  cancelDelete() {
    this.activityToDelete = null;
  }

  // Confirmar exclusão
  confirmDelete() {
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

  // Fechar formulário
  closeForm() {
    this.showForm = false;
  }

  // Salvar ou atualizar atividade
  savedActivity() {
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
