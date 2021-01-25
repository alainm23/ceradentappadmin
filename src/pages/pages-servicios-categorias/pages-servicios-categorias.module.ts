import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagesServiciosCategoriasPage } from './pages-servicios-categorias';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    PagesServiciosCategoriasPage,
  ],
  imports: [
    IonicPageModule.forChild(PagesServiciosCategoriasPage),
    OrderModule
  ],
})
export class PagesServiciosCategoriasPageModule {}
