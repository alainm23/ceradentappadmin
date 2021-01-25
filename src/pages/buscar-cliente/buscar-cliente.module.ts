import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuscarClientePage } from './buscar-cliente';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    BuscarClientePage,
  ],
  imports: [
    IonicPageModule.forChild(BuscarClientePage),
    OrderModule
  ],
})
export class BuscarClientePageModule {}
