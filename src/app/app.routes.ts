import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
    },
    {
        path: '',
        loadComponent: () => import('./home/home/home').then(m => m.Home),
        canActivate: [authGuard]
    },
    {
        path: 'merge-odd-and-even-files',
        loadComponent: () => import('./tools/merge-odd-even-files/merge-odd-even-files').then(m => m.MergeOddEvenFiles),
        canActivate: [authGuard]
    },
    {
        path: 'reverse-pages-in-file',
        loadComponent: () => import('./tools/reverse-pages-in-file/reverse-pages-in-file').then(m => m.ReversePagesInFile),
        canActivate: [authGuard]
    },
    {
        path: 'split-into-pages',
        loadComponent: () => import('./tools/split-into-pages/split-into-pages').then(m => m.SplitIntoPages),
        canActivate: [authGuard]
    }
];
