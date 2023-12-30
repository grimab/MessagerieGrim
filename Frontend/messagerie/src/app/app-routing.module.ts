
// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { NewRegisterComponent } from './new-register/new-register.component';
// import { LoginComponent } from './login/login.component';
// import { HomeComponent } from './home/home.component';
// import { UpdateUserComponent } from './update-user/update-user.component';
// import { SetSecurityQuestionComponent } from './set-security-question/set-security-question.component';
// import { ResetPasswordComponent } from './reset-password/reset-password.component';
// import { ProfileComponent } from './profile/profile.component';
// import { UserListComponent } from './user-list/user-list.component';


// const appRoutes: Routes = [
//   { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige l'URL racine vers /home
//   { path: 'register', component: NewRegisterComponent },
//   { path: 'login', component: LoginComponent },
//   { path: 'home', component: HomeComponent },
//   { path: 'update', component: UpdateUserComponent },
//   { path: 'set-security-question', component: SetSecurityQuestionComponent },
//   { path: 'reset-password', component: ResetPasswordComponent },
//   { path: 'profile', component: ProfileComponent },
//   { path: 'contact', component: UserListComponent}
//   // Ajoutez ici d'autres routes au besoin
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(appRoutes)], // Utilisez appRoutes ici
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; // Assurez-vous d'importer le AuthGuard
import { NewRegisterComponent } from './new-register/new-register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { SetSecurityQuestionComponent } from './set-security-question/set-security-question.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './user-list/user-list.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: NewRegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Protégez les routes nécessitant une authentification
  { path: 'update', component: UpdateUserComponent, canActivate: [AuthGuard] },
  { path: 'set-security-question', component: SetSecurityQuestionComponent, canActivate: [AuthGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: UserListComponent, canActivate: [AuthGuard] }
  // ... autres routes ...
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
