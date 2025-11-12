import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeOddEvenFiles } from './merge-odd-even-files';

describe('MergeOddEvenFiles', () => {
  let component: MergeOddEvenFiles;
  let fixture: ComponentFixture<MergeOddEvenFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeOddEvenFiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MergeOddEvenFiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
