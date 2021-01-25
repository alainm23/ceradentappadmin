import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListarInsumosSucursalPage } from './listar-insumos-sucursal';

@NgModule({
  declarations: [
    ListarInsumosSucursalPage,
  ],
  imports: [
    IonicPageModule.forChild(ListarInsumosSucursalPage),
  ],
})
export class ListarInsumosSucursalPageModule {}
