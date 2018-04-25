import { Injectable, EventEmitter, Compiler } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Router } from '@angular/router';
import { ConfigService } from './configuration.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import 'rxjs/Rx';

@Injectable()
export class SecurityService {

    public IsAuthorized: boolean;
    public HasAdminRole: boolean;
    public UserData: any;
    public isloged: boolean;
    public isloged$: Observable<boolean>;
    private _token: string;
    // private _tokenrodi: string;
    private _userName: string;
    private actionUrl: string;
    // private headers: Headers;
    private storage: any;
    public onLogout: EventEmitter<any>;
    public onLogin: EventEmitter<any>;
    public onLogChanged: EventEmitter<boolean>;
    redirectUrl: string;

    constructor(private _router: Router,
        private http: HttpClient,
        private configService: ConfigService,
        private _compiler: Compiler) {
        // this.headers = new Headers();
        // this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Accept', 'application/json');
        this.storage = sessionStorage;

        if (this.retrieve('IsAuthorized') !== '') {
            this.HasAdminRole = this.retrieve('HasAdminRole');
            this.IsAuthorized = this.retrieve('IsAuthorized');
        }

        this.onLogout = new EventEmitter<any>();
        this.onLogin = new EventEmitter<any>();
        this.onLogChanged = new EventEmitter<boolean>();
        // console.log('Borrar Cookie Servicio');
        // this.borarCookieSignalR();

        this.onLogChanged.subscribe(x => {
            this.isloged = x;
            // console.log( this.isloged);
            sessionStorage.setItem('isLoged', 'true');
            if (!x) {
                sessionStorage.clear();
                this.onLogout.emit(true);
            }
        });

        this.isloged$ = Observable.from(this.onLogChanged);

        this._compiler.clearCache();

    }

    get token(): string {
        return this._token;
    }

    // get tokenrodi(): string {
    //     return this._tokenrodi;
    // }

    get user(): string {
        return this._userName;
    }

    emitir(val: boolean) {
        // console.log('Emitir', val);
        this.onLogChanged.emit(val);
    }

    Login(usr: string, pwd: string): Observable<boolean> {
        this._compiler.clearCache();
        const creds = `grant_type=password&username=${usr}&password=${pwd}`;
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(`${this.configService.apiServer}token`, creds, {
            headers: headers, responseType: 'text'
        }).map(resp => {
            this.saveJwt(resp);
            this.onLogChanged.emit(true);
            return true;
        })
            .catch(this.handleLoginError);
    }

    private handleLoginError(error: HttpErrorResponse | any) {
        return Observable.throw(error);
    }

    saveJwt(jwt) {
        const json = jwt !== '' ? JSON.parse(jwt) : undefined;
        this._token = jwt !== '' ? json.access_token : '';
        // this._tokenrodi = jwt !== '' ? json.tokenRodi : '';
        this._userName = jwt !== '' ? json.userName : '';
        sessionStorage.setItem('user', this._userName);

        if (jwt !== '') {
            const account: any = { 'token': json.access_token, 'tokenrodi': json.tokenRodi, 'user': json.userName };
            localStorage.setItem('account', JSON.stringify(account));
            // Cookie.set('BearerToken', this._token, 10  , '/' , 'sba.com.ar') ;
            // console.log(account);
            Cookie.set('BearerToken', this._token, 10, '/', this.configService.domain);
            // Cookie.set('BearerToken', this._token, 10  , '/', '') ;
        } else {
            localStorage.clear();
            // Cookie.delete('BearerToken', '/' , this.configService.domain) ;
        }
    }
    public borrarCookieSignalR() {
        // console.log('borrarCookieSignalR');
        Cookie.delete('BearerToken', '/', this.configService.domain);
    }

    public HandleError(error: any) {
        if (error.status === 403) {
            this._router.navigate(['/Forbidden']);
        } else if (error.status === 401) {
            this._router.navigate(['/Unauthorized']);
        }
    }

    private retrieve(key: string): any {
        const item = this.storage.getItem(key);

        if (item && item !== 'undefined') {
            return JSON.parse(this.storage.getItem(key));
        }

        return;
    }
    logout() {
        this.logout$().subscribe(c => {
            sessionStorage.clear();
            localStorage.clear();
            this.isloged = false;
            this._router.navigate(['login']);
        });
    }
    private logout$() {
        // const headers = this.getGeneralHeader();
        this.saveJwt('');
        const _ordenesUrl = `${this.configService.apiUrl}account/logout`;

        this.onLogChanged.emit(false);

        return this.http.post(_ordenesUrl, '');
    }

    getSecurityHeader(): HttpHeaders {
        const account: any = localStorage.getItem('account');
        const authToken = this.token || JSON.parse(account).token;
        const authUser = this.user || JSON.parse(account).user;

        // console.log(authToken);

        const headers = new HttpHeaders().
            set('Accept', 'application/json')
            .append('Content-Type', 'application/json')
            .append('If-Modified-Since', 'Mon, 26 Jul 1997 05:00:00 GMT')
            .append('Cache-Control', 'no-cache')
            .append('Pragma', 'no-cache')
            .append('Authorization', `Bearer ${authToken}`)
            .append('User', authUser);

        return headers;
    }

    getGeneralHeaderWithOutToken(user: string): HttpHeaders {
        const account: any = localStorage.getItem('account');
        const authUser = this.user || JSON.parse(account).user;

        const headers = new HttpHeaders().
            set('Accept', 'application/json')
            .append('Content-Type', 'application/json')
            .append('User', authUser);

        return headers;
    }

    private handleError(error: HttpErrorResponse) {
        // console.error(error.status);
        return Observable.throw(error);
    }
}
