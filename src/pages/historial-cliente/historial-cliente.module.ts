import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistorialClientePage } from './historial-cliente';
import { OrderModule } from 'ngx-order-pipe';
import { TooltipsModule } from 'ionic-tooltips';

@NgModule({
  declarations: [
    HistorialClientePage,
  ],
  imports: [
    IonicPageModule.forChild(HistorialClientePage),
    OrderModule,
    TooltipsModule
  ],
})
export class HistorialClientePageModule {}
