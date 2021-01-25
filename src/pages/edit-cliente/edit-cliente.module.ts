import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditClientePage } from './edit-cliente';

@NgModule({
  declarations: [
    EditClientePage,
  ],
  imports: [
    IonicPageModule.forChild(EditClientePage),
  ],
})
export class EditClientePageModule {}
