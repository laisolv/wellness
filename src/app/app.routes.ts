import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        loadComponent: () =>
            import('./features/dashboard/dashboard')
        .then(m => m.Dashboard)
    },
    {
        path: 'memories',
        loadComponent: () =>
            import('./features/memories/memories')
        .then(m => m.Memories)
    },
    {
        path: 'library',
        loadComponent: () =>
            import('./features/library/library')
        .then(m => m.Library)
    },
    {
        path: 'wellness',
        loadComponent: () =>
            import('./features/wellness/wellness')
        .then(m => m.Wellness)
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./features/profile/profile')
        .then(m => m.Profile)
    }
];
