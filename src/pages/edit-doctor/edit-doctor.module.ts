import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditDoctorPage } from './edit-doctor';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    EditDoctorPage,
  ],
  imports: [
    IonicPageModule.forChild(EditDoctorPage),
    DirectivesModule
  ],
})
export class EditDoctorPageModule {}
