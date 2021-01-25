import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireStorage } from 'angularfire2/storage';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-mostrar-servicios-venta',
  templateUrl: 'mostrar-servicios-venta.html',
})
export class MostrarServiciosVentaPage implements OnInit {
placa:string;
listaServicios: Observable<any[]>;
imagenesServicios: Map<string, Array<Observable<string | null>>> = new Map<string, Array<Observable<string | null>>>();
subscription:Subscription;
subscription1:Subscription;
datosPlaca:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public database: DatabaseProvider,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController) {
  }

  ngOnInit(){
    this.placa=this.navParams.get('placa');
    let loading:any = this.loadingCtrl.create({
      content: "Cargando...",      
    })
    loading.present().then(()=>{
      this.subscription=this.database.getServiciosPlaca(this.placa).subscribe(data=>{
        this.listaServicios=data; 
        loading.dismiss().then(_=>{
          data.forEach(servicio=>{
            this.imagenesServicios.set(servicio.data.servicio,[]);
            let partes=servicio.data.imagenes.split("|", 10);
            for (let pa of partes){
              if (pa!=""){
                const ref = this.storage.ref(pa+"-photo.jpg");
                let actuales= this.imagenesServicios.get(servicio.data.servicio);
                actuales.push(ref.getDownloadURL());
                this.imagenesServicios.set(servicio.data.servicio,actuales);
              }
            }          
          })
        });        
      });
    })    
  }

  cambiarInsumos(servicio){
    let modal = this.modalCtrl.create("AgregarInsumoPage",{"placa":this.placa, "servicio":servicio});     
    modal.present(); 

  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  abrirSubirImagen(servicio){
    let modal = this.modalCtrl.create("SubirImagenPage",{"placa":this.placa, "servicio":servicio});     
    modal.present();   
  }

  prepararDuplicado(precio:string, servicio:string, imagenes:string){
    let prompt = this.alertCtrl.create({      
      title: "Generar Dupicado",      
      message: "Para poder generar un duplicado ingrese el costo del duplicado en soles (S/.) solo incluir el monto",
      inputs: [{ name: 'precio', placeholder: '20', value:precio }],
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Generar',
          handler: data => {
            //cargamos loading y generamos duplicado
            let loading = this.loadingCtrl.create({
              content: "procesando informacion..."                
            })
            loading.present().then(_=>{
              this.subscription1=this.database.getPlaca(this.placa).subscribe(datosPlaca=>{
                this.database.registrarDuplicadoPlaca(datosPlaca.cliente, datosPlaca.nombre_cliente, datosPlaca.doctor, datosPlaca.nombre_doctor, datosPlaca.sucursal, Number(data.precio), 0, 0, "", 0, datosPlaca.nombre_sucursal, servicio, imagenes).then(_=>{
                  loading.dismiss().then(()=>{ 
                    this.presentToast("El duplicado se genero correctamente","exito")
                    this.viewCtrl.dismiss();
                  })
                })
              })
            })                   
          }
        }
      ]
    });
    prompt.present(); 
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
    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
  }

}
