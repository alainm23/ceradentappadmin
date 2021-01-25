import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-insumos',
  templateUrl: 'insumos.html',
})
export class InsumosPage implements OnInit {
listaInsumos: Observable<any[]>;
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
      this.listaInsumos=this.database.getInsumos();
      this.subscription=this.database.getInsumos().subscribe(info=>{                
        if (loading!=null && loading!=undefined) loading.dismiss();                 
      })      
    })
  }

  editarInsumo(insumo){
    this.navCtrl.push("EditInsumoPage",{"insumo":insumo,"operacion":"editar"});
  }

  registrarInsumo(){
    this.navCtrl.push("EditInsumoPage",{"operacion":"registrar"});
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

}
