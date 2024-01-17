// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NewRegisterComponent } from './new-register/new-register.component';
import { NewAuthService } from './services/new-auth.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { SetSecurityQuestionComponent } from './set-security-question/set-security-question.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './user-list/user-list.component';
import { NavbarComponent } from './navbar/navbar.component';
// import { AuthGuard } from './auth.guard';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AuthGuard } from './auth.guard';
import { FooterComponent } from './footer/footer.component';


const appRoutes: Routes = [
  { path: 'register', component: NewRegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent , canActivate: [AuthGuard]},
  { path: 'update', component: UpdateUserComponent , canActivate: [AuthGuard]},
  { path: 'set-security-question', component: SetSecurityQuestionComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];


@NgModule({
  declarations: [
    AppComponent,
    NewRegisterComponent,
    LoginComponent,
    HomeComponent,
    UpdateUserComponent,
    SetSecurityQuestionComponent,
    ResetPasswordComponent,
    ProfileComponent,
    UserListComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    FontAwesomeModule
      
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}