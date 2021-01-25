import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SucursalesPage } from './sucursales';

@NgModule({
  declarations: [
    SucursalesPage,
  ],
  imports: [
    IonicPageModule.forChild(SucursalesPage),
  ],
})
export class SucursalesPageModule {}
