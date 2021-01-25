import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistrarClientePage } from './registrar-cliente';

@NgModule({
  declarations: [
    RegistrarClientePage,
  ],
  imports: [
    IonicPageModule.forChild(RegistrarClientePage)   
  ],
})
export class RegistrarClientePageModule {}
