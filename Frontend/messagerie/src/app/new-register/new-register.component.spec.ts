//new-register.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegisterComponent } from './new-register.component';

describe('NewRegisterComponent', () => {
  let component: NewRegisterComponent;
  let fixture: ComponentFixture<NewRegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewRegisterComponent]
    });
    fixture = TestBed.createComponent(NewRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
