import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditInsumoPage } from './edit-insumo';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    EditInsumoPage,
  ],
  imports: [
    IonicPageModule.forChild(EditInsumoPage),
    DirectivesModule
  ],
})
export class EditInsumoPageModule {}
