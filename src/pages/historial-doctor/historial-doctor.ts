import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-historial-doctor',
  templateUrl: 'historial-doctor.html',
})
export class HistorialDoctorPage implements OnInit {
subscription:Subscription;
historialDoctor: Observable<any[]>;
codigoDoctor:string;
datosDoctor:Observable<any>;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public database: DatabaseProvider,
    public modalCtrl: ModalController) {
  }

  ngOnInit(){
    if (this.navParams.get('doctor')!=undefined && this.navParams.get('doctor')!=null){
      let loading = this.loadingCtrl.create({
        content: "Procesando informacion..."           
      })
      loading.present().then(_=>{
        this.codigoDoctor=this.navParams.get('doctor');
        this.historialDoctor=this.database.getHistorialDoctor(this.codigoDoctor);
        this.datosDoctor=this.database.getDoctorObservable(this.codigoDoctor);
        this.subscription=this.database.getHistorialDoctor(this.codigoDoctor).subscribe(info=>{                        
          if (loading!=null && loading!=undefined) loading.dismiss();                 
        })    
      });        
    }else{
      this.navCtrl.setRoot('DoctoresPage')
    }    
  }

  openActualizarPago(placa, montoPendiente, tipoBoleta, nroBoleta, sucursal, fecha, doctor, puntosGanados:number){
    let modal = this.modalCtrl.create("FormaPagoPage",{"monto":montoPendiente, "tipo_boleta":tipoBoleta, "nro_boleta":nroBoleta}); 
    modal.onDidDismiss(datapago=>{
      if (datapago!=undefined){        
        let loading = this.loadingCtrl.create({
          content: "Procesando informacion..."            
        })
        loading.present().then(_=>{
          this.database.actualizarPago(placa, datapago.efectivo, datapago.tarjeta, datapago.tipo_recibo, datapago.nro_recibo, sucursal, fecha, montoPendiente, doctor, puntosGanados).then(_=>{
            if (loading!=null && loading!=undefined) loading.dismiss();
          })
        })                
      }      
    });
    modal.present();   
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

  mostrarServicios(placa:string){
    let modal = this.modalCtrl.create("MostrarServiciosVentaPage",{"placa":placa}); 
    modal.present();
  }

  openHistorialPagos(placa:string){
    let modal = this.modalCtrl.create("HistorialPagoPage",{"placa":placa}); 
    modal.present();
  }

}
