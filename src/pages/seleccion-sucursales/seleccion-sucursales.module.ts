import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeleccionSucursalesPage } from './seleccion-sucursales';

@NgModule({
  declarations: [
    SeleccionSucursalesPage,
  ],
  imports: [
    IonicPageModule.forChild(SeleccionSucursalesPage),
  ],
})
export class SeleccionSucursalesPageModule {}
