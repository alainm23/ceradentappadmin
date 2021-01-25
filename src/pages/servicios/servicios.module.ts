import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServiciosPage } from './servicios';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    ServiciosPage,
  ],
  imports: [
    IonicPageModule.forChild(ServiciosPage),
    OrderModule
  ],
})
export class ServiciosPageModule {}
