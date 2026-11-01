import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { HomeService } from '../home.service';

interface Feature {
  title: string;
  link: string;
  description: string;
  input: string;
  output: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private homeService = inject(HomeService);

  readonly features: Feature[] = [
    {
      title: 'Merge Odd and Even Files',
      link: '/merge-odd-and-even-files',
      description:
        'Combines two scans of a double-sided document – one with the odd pages and one with the even pages – into a single PDF with pages in the right order.',
      input: '2 PDF files',
      output: 'merged.pdf',
    },
    {
      title: 'Reverse Pages in File',
      link: '/reverse-pages-in-file',
      description: 'Reverses the order of pages, e.g. for documents scanned from the last page.',
      input: '1 PDF file',
      output: 'reversed.pdf',
    },
    {
      title: 'Split Into Pages',
      link: '/split-into-pages',
      description: 'Splits a PDF into separate one-page PDF files.',
      input: '1 PDF file',
      output: 'ZIP with one PDF per page',
    },
    {
      title: 'Merge Images to PDF',
      link: '/images-to-pdf',
      description:
        'Combines images into one PDF – every image becomes a page. You can change the order of pages before converting. The PDF is named after the first image.',
      input: 'JPG, PNG, GIF, BMP',
      output: '1 PDF with all images',
    },
    {
      title: 'Images to PDF',
      link: '/images-to-pdf-files',
      description: 'Converts every image to its own PDF file with the same name (photo.jpg → photo.pdf).',
      input: 'JPG, PNG, GIF, BMP',
      output: 'ZIP with one PDF per image',
    },
    {
      title: 'Files to PDF',
      link: '/files-to-pdf',
      description: 'Converts Word documents to PDF, keeping their names (report.docx → report.pdf). Supports drag & drop.',
      input: 'DOC, DOCX',
      output: 'PDF (one file) or ZIP (several files)',
    },
  ];

  // Also wakes up the API (Cloud Run scales to zero), so the first conversion is faster.
  readonly serverStatus = toSignal<ServerStatus, ServerStatus>(
    this.homeService.sayHelloWorld().pipe(
      map((): ServerStatus => 'online'),
      catchError(() => of<ServerStatus>('offline'))
    ),
    { initialValue: 'checking' }
  );
}

type ServerStatus = 'checking' | 'online' | 'offline';
