import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-servicios',
  templateUrl: 'servicios.html',
})
export class ServiciosPage implements OnInit {
listaServicios: Observable<any[]>;
subscription:Subscription;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController
  ) {
  }

  ngOnInit(){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(_=>{
      this.listaServicios=this.database.getServicios();
      this.subscription=this.database.getServicios().subscribe(info=>{
        if (loading!=null && loading!=undefined) loading.dismiss();
      })
    })

  }

  editarServicio(servicio){
    this.navCtrl.push("EditServicioPage",{"servicio":servicio,"operacion":"editar"});
  }

  registrarServicio(){
    this.navCtrl.push("EditServicioPage",{"operacion":"registrar"});
  }

  ngOnDestroy () {
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

  ver_categorias () {
    this.navCtrl.push ('PagesServiciosCategoriasPage');
  }
}
