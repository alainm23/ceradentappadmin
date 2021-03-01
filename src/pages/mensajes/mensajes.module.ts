import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MensajesPage } from './mensajes';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    MensajesPage,
  ],
  imports: [
    IonicPageModule.forChild(MensajesPage),
    OrderModule
  ],
})
export class MensajesPageModule {}
