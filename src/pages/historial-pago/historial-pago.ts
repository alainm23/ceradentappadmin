import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-historial-pago',
  templateUrl: 'historial-pago.html',
})
export class HistorialPagoPage implements OnInit {
placa:string;
subscription:Subscription;
historialPagos:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public database: DatabaseProvider,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController) {
  }  

  ngOnInit(){
    this.placa=this.navParams.get('placa');
    let loading:any = this.loadingCtrl.create({
      content: "Cargando...",      
    })
    loading.present().then(()=>{
      this.subscription=this.database.getHistorialPago(this.placa).subscribe(data=>{
        loading.dismiss().then(_=>{
          this.historialPagos=data;
        })        
      })
    });
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  fecha(fecha){
    return moment(fecha).locale('es').format('DD [de] MMMM [del] YYYY, h:mm:ss a');
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();    
  }

}
