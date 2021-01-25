import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DoctoresPage } from './doctores';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    DoctoresPage,
  ],
  imports: [
    IonicPageModule.forChild(DoctoresPage),
    OrderModule
  ],
})
export class DoctoresPageModule {}
