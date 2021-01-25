import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdministradoresPage } from './administradores';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    AdministradoresPage,
  ],
  imports: [
    IonicPageModule.forChild(AdministradoresPage),
    OrderModule
  ],
})
export class AdministradoresPageModule {}
