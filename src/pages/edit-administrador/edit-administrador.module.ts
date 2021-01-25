import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditAdministradorPage } from './edit-administrador';

@NgModule({
  declarations: [
    EditAdministradorPage,
  ],
  imports: [
    IonicPageModule.forChild(EditAdministradorPage),
  ],
})
export class EditAdministradorPageModule {}
