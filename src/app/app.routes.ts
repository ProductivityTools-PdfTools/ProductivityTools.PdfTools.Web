import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home/home').then(m => m.Home)
    },
    {
        path: 'merge-odd-and-even-files',
        loadComponent: () => import('./tools/merge-odd-even-files/merge-odd-even-files').then(m => m.MergeOddEvenFiles)
    },
    {
        path: 'reverse-pages-in-file',
        loadComponent: () => import('./tools/reverse-pages-in-file/reverse-pages-in-file').then(m => m.ReversePagesInFile)
    }
];
