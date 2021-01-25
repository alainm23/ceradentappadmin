import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuscarDoctorPage } from './buscar-doctor';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    BuscarDoctorPage,
  ],
  imports: [
    IonicPageModule.forChild(BuscarDoctorPage),
    OrderModule
  ],
})
export class BuscarDoctorPageModule {}
