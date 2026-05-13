import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitIntoPages } from './split-into-pages';

describe('SplitIntoPages', () => {
  let component: SplitIntoPages;
  let fixture: ComponentFixture<SplitIntoPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitIntoPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitIntoPages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
