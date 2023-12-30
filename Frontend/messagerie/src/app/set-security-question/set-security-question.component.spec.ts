import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetSecurityQuestionComponent } from './set-security-question.component';

describe('SetSecurityQuestionComponent', () => {
  let component: SetSecurityQuestionComponent;
  let fixture: ComponentFixture<SetSecurityQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetSecurityQuestionComponent]
    });
    fixture = TestBed.createComponent(SetSecurityQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
