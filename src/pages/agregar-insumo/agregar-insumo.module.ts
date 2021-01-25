import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgregarInsumoPage } from './agregar-insumo';

@NgModule({
  declarations: [
    AgregarInsumoPage,
  ],
  imports: [
    IonicPageModule.forChild(AgregarInsumoPage),
  ],
})
export class AgregarInsumoPageModule {}
