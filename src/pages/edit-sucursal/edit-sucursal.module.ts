import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditSucursalPage } from './edit-sucursal';
import { DirectivesModule } from '../../directives/directives.module';



@NgModule({
  declarations: [
    EditSucursalPage,
    
  ],
  imports: [
    IonicPageModule.forChild(EditSucursalPage),
    DirectivesModule
    
  ],
})
export class EditSucursalPageModule {}
