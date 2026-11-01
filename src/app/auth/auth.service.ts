import { Injectable, signal, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onIdTokenChanged,
    User,
    getIdToken,
    getIdTokenResult
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { StatusService } from '../status/status.service';

// Refresh the token when less than this much time is left (same as Journal).
const REFRESH_MARGIN_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    user = signal<User | null>(null);
    token = signal<string | null>(null);
    tokenRefreshTime = signal<Date | null>(null);

    private cleanup: (() => void)[] = [];

    constructor(
        private auth: Auth,
        private router: Router,
        private status: StatusService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            // Fires on sign-in, sign-out and every token refresh.
            const unsubscribe = onIdTokenChanged(this.auth, async (user) => {
                this.user.set(user);
                if (user) {
                    const result = await getIdTokenResult(user);
                    this.storeToken(result.token, new Date(result.issuedAtTime));
                } else {
                    this.token.set(null);
                    this.tokenRefreshTime.set(null);
                    localStorage.removeItem('idToken');
                }
            });
            this.cleanup.push(unsubscribe);
            this.startAutoRefresh();
        }
    }

    ngOnDestroy() {
        this.cleanup.forEach((fn) => fn());
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            this.user.set(result.user);
            const token = await getIdToken(result.user);
            this.storeToken(token, new Date());
            this.status.success(`Signed in as ${result.user.email}`);
            this.router.navigate(['/']);
        } catch (error) {
            console.error('Login failed', error);
            this.status.error('Login failed');
        }
    }

    async logout() {
        await signOut(this.auth);
        this.user.set(null);
        this.token.set(null);
        this.tokenRefreshTime.set(null);
        localStorage.removeItem('idToken');
        this.router.navigate(['/login']);
    }

    /** Forces a new ID token from Firebase. */
    async refreshToken(): Promise<string | null> {
        const user = this.auth.currentUser;
        if (!user) return null;
        const token = await getIdToken(user, true);
        this.storeToken(token, new Date());
        return token;
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return this.token() || localStorage.getItem('idToken');
        }
        return null;
    }

    private storeToken(token: string, issuedAt: Date) {
        this.token.set(token);
        this.tokenRefreshTime.set(issuedAt);
        localStorage.setItem('idToken', token);
    }

    /** Same strategy as Journal: check on focus, when the tab becomes visible and every 5 minutes. */
    private startAutoRefresh() {
        const check = () => this.refreshIfNeeded();
        const onVisibility = () => {
            if (document.visibilityState === 'visible') check();
        };
        window.addEventListener('focus', check);
        document.addEventListener('visibilitychange', onVisibility);
        const intervalId = setInterval(check, CHECK_INTERVAL_MS);
        this.cleanup.push(() => {
            window.removeEventListener('focus', check);
            document.removeEventListener('visibilitychange', onVisibility);
            clearInterval(intervalId);
        });
    }

    private async refreshIfNeeded() {
        const user = this.auth.currentUser;
        if (!user) return;
        try {
            const result = await getIdTokenResult(user);
            const expiresAt = new Date(result.expirationTime).getTime();
            if (expiresAt - Date.now() < REFRESH_MARGIN_MS) {
                this.status.info('Auto-refreshing session token...');
                await this.refreshToken();
                this.status.success('Session token refreshed');
            }
        } catch (err) {
            console.error('Auto token refresh error:', err);
            this.status.error('Session token refresh failed');
        }
    }
}
