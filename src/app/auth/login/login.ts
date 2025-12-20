import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    imports: [],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    constructor(private authService: AuthService) { }

    login() {
        this.authService.loginWithGoogle();
    }
}
