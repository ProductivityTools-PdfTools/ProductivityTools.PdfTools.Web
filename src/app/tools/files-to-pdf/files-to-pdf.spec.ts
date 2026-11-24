import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FilesToPdf } from './files-to-pdf';
import { DOCUMENT_CONVERSION } from './conversion-config';
import { ToolsService } from '../tools.service';
import { FileAccessService, PDF_TYPES, ZIP_TYPES } from '../file-access.service';

describe('FilesToPdf', () => {
  let component: FilesToPdf;
  let fixture: ComponentFixture<FilesToPdf>;
  let convertSpy: ReturnType<typeof vi.fn>;
  let saveSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    convertSpy = vi.fn();
    saveSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [FilesToPdf],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { conversion: DOCUMENT_CONVERSION } } } },
        { provide: ToolsService, useValue: { convertToZip: convertSpy } },
        {
          provide: FileAccessService,
          useValue: {
            pick: vi.fn().mockResolvedValue(null),
            fromDrop: vi.fn().mockResolvedValue([]),
            save: saveSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesToPdf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function selectFiles(files: File[]) {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    component.onFilesSelected({ target: input } as unknown as Event);
  }

  it('accepts Word (.doc, .docx, .docm) and Excel (.xls, .xlsx) files and skips unsupported ones', () => {
    const doc = new File(['a'], 'umowa.doc');
    const docx = new File(['b'], 'raport.docx');
    const docm = new File(['m'], 'szablon.docm');
    const xls = new File(['c'], 'kosztorys.xls');
    const xlsx = new File(['d'], 'BUDZET.XLSX');
    const txt = new File(['e'], 'notes.txt');

    selectFiles([doc, docx, docm, xls, xlsx, txt]);

    expect(component.files()).toEqual([doc, docx, docm, xls, xlsx]);
    expect(component.warning()).toContain('notes.txt');
  });

  it('saves a single converted Excel file as a PDF with the source file name', () => {
    const xlsx = new File(['x'], 'budget-2026.xlsx');
    const pdfBlob = new Blob(['%PDF'], { type: 'application/pdf' });
    convertSpy.mockReturnValue(
      of(new HttpResponse({ body: pdfBlob, headers: new HttpHeaders({ 'Content-Type': 'application/pdf' }) }))
    );

    selectFiles([xlsx]);
    component.convert();

    expect(convertSpy).toHaveBeenCalledWith('files-to-pdf', [xlsx]);
    expect(saveSpy).toHaveBeenCalledWith(pdfBlob, 'budget-2026.pdf', xlsx, PDF_TYPES);
    expect(component.inProgress()).toBe(false);
  });

  it('saves multiple converted Word and Excel files as converted.zip', () => {
    const docx = new File(['a'], 'report.docx');
    const xls = new File(['b'], 'table.xls');
    const zipBlob = new Blob(['PK'], { type: 'application/zip' });
    convertSpy.mockReturnValue(
      of(new HttpResponse({ body: zipBlob, headers: new HttpHeaders({ 'Content-Type': 'application/zip' }) }))
    );

    selectFiles([docx, xls]);
    component.convert();

    expect(convertSpy).toHaveBeenCalledWith('files-to-pdf', [docx, xls]);
    expect(saveSpy).toHaveBeenCalledWith(zipBlob, 'converted.zip', docx, ZIP_TYPES);
    expect(component.inProgress()).toBe(false);
  });
});
