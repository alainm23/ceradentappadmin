import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MostrarTutoresPage } from './mostrar-tutores';

@NgModule({
  declarations: [
    MostrarTutoresPage,
  ],
  imports: [
    IonicPageModule.forChild(MostrarTutoresPage),
  ],
})
export class MostrarTutoresPageModule {}
