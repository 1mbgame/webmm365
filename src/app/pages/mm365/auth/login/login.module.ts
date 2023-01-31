import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MobileLoginComponent } from '../mobile-login/mobile-login.component';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
   CommonModule,
  ],
  declarations: [
      LoginComponent,
      MobileLoginComponent
    //...routedComponents,
    //FsIconComponent,
  ],
})
export class LoginModule { }
