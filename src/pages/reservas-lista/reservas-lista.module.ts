import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReservasListaPage } from './reservas-lista';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    ReservasListaPage,
  ],
  imports: [
    IonicPageModule.forChild(ReservasListaPage),
    OrderModule
  ],
})
export class ReservasListaPageModule {}
