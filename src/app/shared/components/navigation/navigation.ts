import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  LucideHouse,
  LucideImages,
  LucideBookOpen,
  LucideUser,
  LucideHeartPulse,
  LucideCalendarCheck,
} from '@lucide/angular';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideHouse,
    LucideImages,
    LucideUser,
    LucideBookOpen,
    LucideHeartPulse,
    LucideCalendarCheck
  ],
  selector: 'app-navigation',
  styleUrl: './navigation.scss',
  templateUrl: './navigation.html',
})
export class Navigation {}
