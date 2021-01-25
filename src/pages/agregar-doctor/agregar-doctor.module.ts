import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgregarDoctorPage } from './agregar-doctor';

@NgModule({
  declarations: [
    AgregarDoctorPage,
  ],
  imports: [
    IonicPageModule.forChild(AgregarDoctorPage),
  ],
})
export class AgregarDoctorPageModule {}
