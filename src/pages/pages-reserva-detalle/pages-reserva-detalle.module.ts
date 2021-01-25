import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagesReservaDetallePage } from './pages-reserva-detalle';

@NgModule({
  declarations: [
    PagesReservaDetallePage,
  ],
  imports: [
    IonicPageModule.forChild(PagesReservaDetallePage),
  ],
})
export class PagesReservaDetallePageModule {}
