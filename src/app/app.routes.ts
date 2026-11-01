import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { IMAGE_CONVERSION, WORD_CONVERSION } from './tools/files-to-pdf/conversion-config';

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
    },
    {
        path: 'images-to-pdf',
        loadComponent: () => import('./tools/images-to-pdf/images-to-pdf').then(m => m.ImagesToPdf),
        canActivate: [authGuard]
    },
    {
        path: 'files-to-pdf',
        loadComponent: () => import('./tools/files-to-pdf/files-to-pdf').then(m => m.FilesToPdf),
        data: { conversion: WORD_CONVERSION },
        canActivate: [authGuard]
    },
    {
        // "/images-to-pdf" is used by "Merge Images to PDF" (kept for existing bookmarks).
        path: 'images-to-pdf-files',
        loadComponent: () => import('./tools/files-to-pdf/files-to-pdf').then(m => m.FilesToPdf),
        data: { conversion: IMAGE_CONVERSION },
        canActivate: [authGuard]
    }
];
