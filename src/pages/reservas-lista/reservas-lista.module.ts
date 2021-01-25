import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReservasListaPage } from './reservas-lista';

@NgModule({
  declarations: [
    ReservasListaPage,
  ],
  imports: [
    IonicPageModule.forChild(ReservasListaPage),
  ],
})
export class ReservasListaPageModule {}
