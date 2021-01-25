import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubirImagenPage } from './subir-imagen';

@NgModule({
  declarations: [
    SubirImagenPage,
  ],
  imports: [
    IonicPageModule.forChild(SubirImagenPage),
  ],
})
export class SubirImagenPageModule {}
