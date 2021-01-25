import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditarVentaPage } from './editar-venta';

@NgModule({
  declarations: [
    EditarVentaPage,
  ],
  imports: [
    IonicPageModule.forChild(EditarVentaPage),
  ],
})
export class EditarVentaPageModule {}
