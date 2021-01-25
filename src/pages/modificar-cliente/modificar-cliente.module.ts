import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModificarClientePage } from './modificar-cliente';

@NgModule({
  declarations: [
    ModificarClientePage,
  ],
  imports: [
    IonicPageModule.forChild(ModificarClientePage),
  ],
})
export class ModificarClientePageModule {}
