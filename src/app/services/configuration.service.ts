import { Injectable } from '@angular/core';
import { Configuration } from './../models/config.model';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import 'rxjs/add/operator/map'

@Injectable()
export class ConfigService {
    private config: Configuration;
    constructor(private http: HttpClient) { }

    load(url: string) {
        return new Promise((resolve) => {
            this.http.get(url).map(res => JSON.stringify(<Configuration>res)).subscribe(config => {
                this.config = JSON.parse(config);
                resolve();
            });
        });
    }
    get userName(): string {
        if (this.config) {
            return this.config.userName;
        }
        return null;
    }
    get userPwd(): string {
        if (this.config) {
            return this.config.userPwd;
        }
        return null;
    }

    get apiServer(): string {
        if (this.config) {
            return this.config.server;
        }
        return null;
    }
    get apiUrl(): string {
        if (this.config) {
            return this.config.server + this.config.apiUrl
        }
        return null;
    }

    // Se usa para las cookies
    get domain(): string {
        if (this.config) {
            return this.config.domain;
        }
        return null;
    }
    get signalrLogging(): boolean {
        if (this.config) {
            if (this.config.signalrLogging == null) {
                return false;
            } else {
                return this.config.signalrLogging;
            }

        }
        return null;
    }
    get notificarConexionLenta(): boolean {
        if (this.config) {
            if (this.config.notificarConexionLenta == null) {
                return true;
            } else {
                return this.config.notificarConexionLenta;
            }
        }
        return null;
    }
    getConfiguration(): Configuration {
        return this.config;
    }
}
