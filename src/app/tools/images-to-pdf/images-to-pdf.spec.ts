import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesToPdf } from './images-to-pdf';

describe('ImagesToPdf', () => {
  let component: ImagesToPdf;
  let fixture: ComponentFixture<ImagesToPdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesToPdf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesToPdf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
