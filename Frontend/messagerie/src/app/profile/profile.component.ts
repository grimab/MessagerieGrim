

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NewAuthService } from '../services/new-auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: NewAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        this.user = data.user;
      },
      error: (err) => {
        this.errorMessage = err.error?.error?.message || "Une erreur est survenue lors du chargement du profil. Veuillez réessayer.";
        console.error(err);
      }
    });
  }

  navigateToUpdate() {
    this.router.navigate(['/update']);
  }
}
