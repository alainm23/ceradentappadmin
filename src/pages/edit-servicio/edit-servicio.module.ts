import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditServicioPage } from './edit-servicio';
import { DirectivesModule } from '../../directives/directives.module';


@NgModule({
  declarations: [
    EditServicioPage,
   
  ],
  imports: [
    IonicPageModule.forChild(EditServicioPage),
    DirectivesModule
  ],
})
export class EditServicioPageModule {}
