import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MostrarServiciosVentaPage } from './mostrar-servicios-venta';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    MostrarServiciosVentaPage,
  ],
  imports: [
    IonicPageModule.forChild(MostrarServiciosVentaPage),
    IonicImageViewerModule
  ],
})
export class MostrarServiciosVentaPageModule {}
