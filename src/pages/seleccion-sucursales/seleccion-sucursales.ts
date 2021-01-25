import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-seleccion-sucursales',
  templateUrl: 'seleccion-sucursales.html',
})
export class SeleccionSucursalesPage implements OnInit {
codigoAdministrador:string;
sucursalesAdministrador:Observable<any[]>;
listaSucursales:Observable<any[]>;
codigosSucursales:string[]=[];
subscription:Subscription;
codigosActuales: Map<string, string> = new Map<string, string>();

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,        
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public navParams: NavParams
  ) {
  }

  ngOnInit(){
    if (this.navParams.get('administrador')!=undefined){
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."            
      })
      loading.present().then(_=>{
        this.codigoAdministrador=this.navParams.get('administrador');
        //treamos la lista de sucursales de la base de datos
        this.listaSucursales=this.database.getSucursales();
        this.subscription=this.database.getSoloSucursalesAdministrador(this.codigoAdministrador).subscribe(data=>{
          data.forEach(element => {
            this.codigosActuales.set(element.sucursal,element.id);          
          }); 
          loading.dismiss();           
        })
      });
      
    }
    else{
      this.viewCtrl.dismiss();
    }
  }

  verificarSucursal(sucursal):boolean{    
    //if (this.codigosSucursales.indexOf(sucursal)<0) return false; else return true;
    //console.log(this.codigosActuales.get(sucursal));
    if (this.codigosActuales.get(sucursal)!=undefined) return true; else return false;
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }  

  cambiarSucursal(sucursal, event){    
    
    if (event.checked==true){      
      //registramos admin sucursal
      let loadingLocal:any;
      loadingLocal = this.loadingCtrl.create({
        content: "Procesando informacion..."            
      })
      loadingLocal.present().then(_=>{
        this.database.registrarSucursalAdministrador(this.codigoAdministrador, sucursal).then(_=>{
          loadingLocal.dismiss().then(()=>{                                      
            this.presentToast("Informacion actualizada","exito")                            
          }) 
        })
      });      
    }
    else{
      //eliminamos admin sucursal
      let loadingLocal:any;
      loadingLocal = this.loadingCtrl.create({
        content: "Procesando informacion..."            
      })
      loadingLocal.present().then(_=>{
        this.database.eliminarSucursalAdministrador(this.codigosActuales.get(sucursal)).then(_=>{
          this.codigosActuales.delete(sucursal);
          loadingLocal.dismiss().then(()=>{                                      
            this.presentToast("Informacion actualizada","exito")                            
          })
        })
      });
    }
    
  }

  presentToast(message,type) {
    if (type=="exito"){
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: 'bottom',
        cssClass: "toast-success"
      });
      toast.present();
    }else{
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: 'bottom',
        cssClass: "toast-error"
      });
      toast.present();
    }    
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

}
