import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VentasMensualesPage } from './ventas-mensuales';
import { OrderModule } from 'ngx-order-pipe';
import { TooltipsModule } from 'ionic-tooltips';

@NgModule({
  declarations: [
    VentasMensualesPage,
  ],
  imports: [
    IonicPageModule.forChild(VentasMensualesPage),
    OrderModule,
    TooltipsModule
  ],
})
export class VentasMensualesPageModule {}
