import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReversePagesInFile } from './reverse-pages-in-file';

describe('ReversePagesInFile', () => {
  let component: ReversePagesInFile;
  let fixture: ComponentFixture<ReversePagesInFile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReversePagesInFile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReversePagesInFile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
