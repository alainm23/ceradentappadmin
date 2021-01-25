import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-sucursales',
  templateUrl: 'sucursales.html',
})
export class SucursalesPage implements OnInit {
listaSucursales: Observable<any[]>;
subscription:Subscription;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController) {
  }

  ngOnInit(){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."            
    })
    loading.present().then(_=>{
      this.listaSucursales=this.database.getSucursales();
      this.subscription=this.database.getSucursales().subscribe(info=>{                
        if (loading!=null && loading!=undefined) loading.dismiss();                 
      })      
    })
    
  }

  editarSucursal(sucursal){
    this.navCtrl.push("EditSucursalPage",{"sucursal":sucursal,"operacion":"editar"});
  }

  registrarSucursal(){
    this.navCtrl.push("EditSucursalPage",{"operacion":"registrar"});
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

}
