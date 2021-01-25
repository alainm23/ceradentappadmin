import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistorialDoctorPage } from './historial-doctor';
import { OrderModule } from 'ngx-order-pipe';
import { TooltipsModule } from 'ionic-tooltips';

@NgModule({
  declarations: [
    HistorialDoctorPage,
  ],
  imports: [
    IonicPageModule.forChild(HistorialDoctorPage),
    OrderModule,
    TooltipsModule
  ],
})
export class HistorialDoctorPageModule {}
