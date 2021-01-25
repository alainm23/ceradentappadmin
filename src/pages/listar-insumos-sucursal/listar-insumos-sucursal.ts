import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

/**
 * Generated class for the ListarInsumosSucursalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-listar-insumos-sucursal',
  templateUrl: 'listar-insumos-sucursal.html',
})
export class ListarInsumosSucursalPage implements OnInit {
subscription:Subscription;
codigo_sucursal:string;
sucursal:any;
stockSucursal:any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private database: DatabaseProvider,
    public loadingCtrl: LoadingController) {
  }

  async ngOnInit(){   
    console.log('entro')   ;
    if (this.navParams.get('sucursal')!=undefined){
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."            
      })
      loading.present().then(_=>{  
        this.codigo_sucursal=  this.navParams.get('sucursal');
        this.database.getSucursalEstatico(this.codigo_sucursal).then(data=>{
          this.sucursal=data;
        })
        this.subscription=this.database.getStockSucursalTotal(this.codigo_sucursal).subscribe(dataStock=>{
          console.log(dataStock);
          this.stockSucursal=dataStock;
          loading.dismiss();
        })
      })      
    }
    else this.dismiss();
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();    
  } 
  

}
