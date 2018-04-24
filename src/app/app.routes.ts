import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes, ActivatedRouteSnapshot } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

const appRoutes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: '**', component: LoginComponent }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { useHash: true })
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }