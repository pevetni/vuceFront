import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { SecurityService } from '../../services/security.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  private user: string;
  private password: string;
  private qs = '';
  question = '';
  private as: string;
  isLogin = true;
  loginForm: FormGroup;
  msgRespuesta = '';
  subscriptionLogin: Subscription;
  subscriptionQs: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private securityService: SecurityService
  ) {}

  ngOnInit(): void {
    this.buildForm(true);
  }

  formErrors = {
    'user': '',
    'pwd': '',
    'qs': '',
    'as': ''
  };

  validationMessages = {
    'user': {
      'required': 'usuario es requerido.'
    },
    'pwd': {
      'required': 'contraseña es requerida.'
    },
    'qs': {
      'required': 'pregunta es requerida.'
    },
    'as': {
      'required': 'respuesta es requerida.'
    }
  };

  login({ value, valid }: { value: any, valid: boolean }) {
    this.subscriptionLogin = this.securityService.Login(value.user, value.pwd)
      .subscribe(resp => {
        sessionStorage.setItem('user', value.user);
        sessionStorage.setItem('pwd', value.pwd);
        if (this.securityService.redirectUrl) {
          //this.router.navigateByUrl(this.securityService.redirectUrl);
        } else {
          //this.router.navigate(['general']);
        }
      },
        (err: HttpErrorResponse) => {
          ///TODO: esto habria que hacerlo en el servicio
          if (err && err.status === 0) {
            this.formErrors = Object.assign({}, this.formErrors, {
              'pwd':
                'Hubo un problema en la conexión con el servicio web, contactarse con el Centro de Atención'
                + 'a Usuarios a la dirección helpdesk@cau.sba.com.ar'
            });
          } else {
            const errDescrip: string = JSON.parse(err.error)['error_description'];
            if (errDescrip.indexOf('acreditado') >= 0) {
              this.formErrors = Object.assign({}, this.formErrors, { 'pwd': 'Usuario y/o clave incorrectos' });
            } else {
              this.formErrors = Object.assign({}, this.formErrors, { 'pwd': errDescrip });
            }
          }
        });
  }

  goForgot(): void {
    this.isLogin = !this.isLogin;
    this.buildForm(this.isLogin);
  }

  buildForm(isLogin: boolean): void {
    if (isLogin) {
      this.loginForm = this.fb.group({
        'user': [this.user, Validators.required],
        'pwd': [this.password, Validators.required]
      });

      this.loginForm.valueChanges.subscribe(() => this.onValueChanged(isLogin));
      this.onValueChanged(isLogin);
    } else {
      this.loginForm = this.fb.group({
        'user': [this.user, Validators.required],
        'qs': [this.qs, Validators.required],
        'as': [this.as, Validators.required]
      });

      this.loginForm.valueChanges.subscribe(() => this.onValueChanged(isLogin));
      this.onValueChanged(isLogin);
      if (this.user) {
        
      }
    }
  }

  onValueChanged(isLogin: boolean): void {
    if (isLogin) {
      if (!this.loginForm) { return; }
      const form = this.loginForm;
      this.user = form.get('user').value;
      this.password = form.get('pwd').value;

      // tslint:disable-next-line:forin
      for (const field in this.formErrors) {
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          // tslint:disable-next-line:forin
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    } else {
      if (!this.loginForm) { return; }
      const form = this.loginForm;

      this.user = form.get('user').value;
      this.as = form.get('as').value;

      // tslint:disable-next-line:forin
      for (const field in this.formErrors) {
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          // tslint:disable-next-line:forin
          for (const key in control.errors) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }

  forgot(): void {
    /* const val = this.loginForm.value;
    if (val.as) {
      this.securityService.recuperarClave(val.user, val.as).subscribe(resp => {
        this.msgRespuesta = resp.json();
        this.isLogin = !this.isLogin;
      },
        error => {
          console.error(error);
        });
    } */
  }

  ngOnDestroy(): void {
    
  }
}
