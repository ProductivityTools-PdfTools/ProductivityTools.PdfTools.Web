import { TestBed } from '@angular/core/testing';
import { FileAccessService, PDF_TYPES } from './file-access.service';
import { StatusService } from '../status/status.service';

describe('FileAccessService', () => {
  let service: FileAccessService;
  let status: StatusService;
  const w = window as any;

  function fakeHandle(file: File) {
    return { kind: 'file', name: file.name, getFile: async () => file };
  }

  function fakeTarget(name: string) {
    const written: unknown[] = [];
    return {
      written,
      handle: {
        name,
        createWritable: async () => ({ write: async (b: unknown) => written.push(b), close: async () => { } }),
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileAccessService);
    status = TestBed.inject(StatusService);
  });

  afterEach(() => {
    delete w.showOpenFilePicker;
    delete w.showSaveFilePicker;
  });

  it('opens the save dialog in the folder of the picked source file', async () => {
    const source = new File(['img'], 'photo.jpg');
    const sourceHandle = fakeHandle(source);
    const target = fakeTarget('photo.pdf');
    let saveOptions: any;
    w.showOpenFilePicker = async () => [sourceHandle];
    w.showSaveFilePicker = async (options: any) => { saveOptions = options; return target.handle; };

    const event = new Event('click', { cancelable: true });
    const picked = await service.pick(event, PDF_TYPES, true);
    expect(event.defaultPrevented).toBe(true);
    expect(picked).toEqual([source]);

    const blob = new Blob(['pdf']);
    await service.save(blob, 'photo.pdf', picked![0], PDF_TYPES);

    expect(saveOptions.startIn).toBe(sourceHandle);
    expect(saveOptions.suggestedName).toBe('photo.pdf');
    expect(target.written).toEqual([blob]);
    expect(status.current()?.message).toBe('Saved photo.pdf');
  });

  it('opens the save dialog without startIn for files from the native input', async () => {
    let saveOptions: any;
    w.showOpenFilePicker = async () => [];
    w.showSaveFilePicker = async (options: any) => { saveOptions = options; return fakeTarget('x.pdf').handle; };

    await service.save(new Blob(['pdf']), 'x.pdf', new File(['a'], 'a.pdf'), PDF_TYPES);

    expect('startIn' in saveOptions).toBe(false);
    expect(saveOptions.id).toBe('pdftools-save');
  });

  it('reports a cancelled save dialog', async () => {
    w.showOpenFilePicker = async () => [];
    w.showSaveFilePicker = async () => { throw new DOMException('cancelled', 'AbortError'); };

    await service.save(new Blob(['pdf']), 'x.pdf', null, PDF_TYPES);

    expect(status.current()?.message).toBe('Save cancelled');
  });

  it('falls back to the native input and a normal download in other browsers', async () => {
    const event = new Event('click', { cancelable: true });
    expect(service.supported).toBe(false);
    expect(await service.pick(event, PDF_TYPES, false)).toBeNull();
    expect(event.defaultPrevented).toBe(false);

    const clicked: string[] = [];
    const originalCreate = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') (el as HTMLAnchorElement).click = () => clicked.push((el as HTMLAnchorElement).download);
      return el;
    });
    URL.createObjectURL = () => 'blob:fake';
    URL.revokeObjectURL = () => { };

    await service.save(new Blob(['pdf']), 'merged.pdf', null, PDF_TYPES);

    expect(clicked).toEqual(['merged.pdf']);
    spy.mockRestore();
  });
});
