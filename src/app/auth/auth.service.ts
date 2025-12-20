import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    getIdToken
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user = signal<User | null>(null);
    token = signal<string | null>(null);

    constructor(
        private auth: Auth,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            onAuthStateChanged(this.auth, async (user) => {
                this.user.set(user);
                if (user) {
                    const token = await getIdToken(user);
                    this.token.set(token);
                    localStorage.setItem('idToken', token);
                } else {
                    this.token.set(null);
                    localStorage.removeItem('idToken');
                }
            });
        }
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            this.user.set(result.user);
            const token = await getIdToken(result.user);
            this.token.set(token);
            localStorage.setItem('idToken', token);
            this.router.navigate(['/']);
        } catch (error) {
            console.error('Login failed', error);
        }
    }

    async logout() {
        await signOut(this.auth);
        this.user.set(null);
        this.token.set(null);
        localStorage.removeItem('idToken');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return this.token() || localStorage.getItem('idToken');
        }
        return null;
    }
}
