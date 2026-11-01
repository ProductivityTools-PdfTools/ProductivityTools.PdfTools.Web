import { StatusService } from './status.service';

describe('StatusService', () => {
  let service: StatusService;

  beforeEach(() => {
    service = new StatusService();
  });

  it('updates a pending operation in place with its duration', () => {
    const id = service.start('POST images-to-pdf...');
    expect(service.current()?.type).toBe('pending');

    service.success(id, 'POST images-to-pdf completed');

    expect(service.history().length).toBe(1);
    const entry = service.history()[0];
    expect(entry.type).toBe('success');
    expect(entry.message).toBe('POST images-to-pdf completed');
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
    expect(service.current()).toEqual(entry);
  });

  it('records errors and plain messages', () => {
    const id = service.start('GET hello...');
    service.error(id, 'GET hello failed (500)');
    service.info('Info message');
    service.warn('Warning');

    expect(service.history().map((e) => e.type)).toEqual(['warn', 'info', 'error']);
    expect(service.current()?.message).toBe('Warning');
  });

  it('keeps at most 50 entries and can be cleared', () => {
    for (let i = 0; i < 60; i++) service.info(`m${i}`);
    expect(service.history().length).toBe(50);
    expect(service.history()[0].message).toBe('m59');

    service.clearHistory();
    expect(service.history().length).toBe(0);
  });
});
