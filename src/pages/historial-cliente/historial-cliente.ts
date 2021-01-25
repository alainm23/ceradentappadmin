import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, ActionSheetController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-historial-cliente',
  templateUrl: 'historial-cliente.html',
})
export class HistorialClientePage implements OnInit {  
subscription:Subscription;
subscription1:Subscription;
historialCliente:Observable<any[]>;
datosCliente:Observable<any>;
codigoUsuario:string;
codigoUsuarioParam:string="";
telefonoUsuario:string;
color:string="primary";
tipoCliente:string;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public actionSheetCtrl:ActionSheetController,
    public alertCtrl: AlertController) {
  }

  ngOnInit(){    
    
    if (this.navParams.get('codigo')!=undefined && this.navParams.get('codigo')!=null){
      this.codigoUsuarioParam=this.navParams.get('codigo');      
      this.codigoUsuario=this.navParams.get('codigo'); 
      this.mostrarHistorialCliente(this.codigoUsuario);
    } 
  }

  openBuscarCliente(){
    let modal = this.modalCtrl.create("BuscarClientePage"); 
    modal.onDidDismiss(data=>{ 
      if (data!=undefined) {
        this.color="primary";
        this.codigoUsuario=data.codigo; 
        this.mostrarHistorialCliente(this.codigoUsuario);
      } 
    });
    modal.present();
  }

  mostrarHistorialCliente(codigo){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."         
    })
    loading.present().then(_=>{
      this.historialCliente=this.database.getHistorialCliente(codigo);
      this.subscription=this.database.getHistorialCliente(codigo).subscribe(_=>{          
        //this.database.getClienteObservable(data.usuario);      
        this.subscription1=this.database.getClienteObservable(codigo).subscribe(info=>{
          this.datosCliente=info;           
          this.telefonoUsuario=info[0].telefono;
          this.tipoCliente=info[0].tipo;
          if (info[0].tipo=='menor'){
            if (info[0].dni=="") this.color="danger"; else this.color="primary";
          }else{
            if (info[0].tipo=='adulto'){
              if (info[0].telefono=="") this.color="danger"; else this.color="primary";
            } 
          }
          if (loading!=null && loading!=undefined) loading.dismiss();
          
        })          
      })
    });
    
  }

  onSubmit(){
    /*this.loading = this.loadingCtrl.create({
      content: "Procesando informacion..."           
    })
    this.loading.present();
    const value=this.phoneForm.value;
    let telefonoProceso:string;
    if (this.telefonosUsuarioParam!="") telefonoProceso=this.telefonosUsuarioParam;
    else telefonoProceso=value.phoneNumber;

    this.database.existeTelefonoRegistrado("+51"+telefonoProceso).then(data=>{
      if (data && data.iscliente){
        this.historialCliente=this.database.getHistorialCliente(data.usuario);
        this.subscription=this.database.getHistorialCliente(data.usuario).subscribe(_=>{          
          //this.database.getClienteObservable(data.usuario);
          this.codigoUsuario=data.usuario;
          this.subscription1=this.database.getClienteObservable(data.usuario).subscribe(info=>{
            this.datosCliente=info;           
            this.telefonosUsuario=info[0].telefono;
            this.loading.dismiss().then(()=>{            
              this.presentToast("Usuario encontrado con el numero de celular +51"+ telefonoProceso,"exito");
            }) 
          })          
        })
      }else{
        this.loading.dismiss().then(()=>{ 
          this.presentToast("No hay ningun cliente registrado con el numero de telefono +51"+ telefonoProceso,"error");
        })        
      }
    })*/
  }

  opcionesCliente(){    
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',      
      buttons: [
        {
          text: 'Editar informacion',                    
          handler: () => {            
            let modal = this.modalCtrl.create("EditClientePage",{"cliente":this.codigoUsuario, "telefono":this.telefonoUsuario}); 
            modal.present();
          }
        },        
        {
          text: 'Cambiar Nro. Celular',         
          handler: () => {
            if (this.telefonoUsuario!="")
            this.actualizarTelefonoCliente(this.telefonoUsuario);
            else
            this.asignarTelefonoCliente(this.codigoUsuario);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom          
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  opcionesClienteMenor(){    
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',      
      buttons: [
        {
          text: 'Ver / Editar Tutores',                    
          handler: () => {
            let modal = this.modalCtrl.create("MostrarTutoresPage",{"menor":this.codigoUsuario}); 
            modal.present();
          }
        },
        {
          text: 'Editar informacion',                    
          handler: () => {            
            let modal = this.modalCtrl.create("EditClientePage",{"cliente":this.codigoUsuario, "telefono":this.telefonoUsuario}); 
            modal.present();
          }
        },               
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom          
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  asignarTelefonoCliente(codigo){
    let prompt = this.alertCtrl.create({      
      title: "Asignar Nro. Celular al Cliente",
      subTitle: "Crear acceso a la App móvil para este usuario",
      message: "El numero de telefono es el acceso a la App. Por favor ingrese el numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
      inputs: [{ name: 'phone', placeholder: '+51984780945', value:'+51' }],
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Confirmar',
          handler: data => {
            //cargamos loading            
            if (data.phone.length >= 12){
              let loading:any = this.loadingCtrl.create({
                content: "procesando informacion...",               
              })
              loading.present().then(_=>{
                this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                  if (dataUsuario){
                    loading.dismiss().then(()=>{ 
                      this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error")
                    })
                  }
                  else{
                    //creamos cuenta app movil al usuario 
                    this.database.crearCuentaCliente(data.phone, codigo).then(_=>{
                      loading.dismiss().then(()=>{ 
                        this.color="primary";
                        this.telefonoUsuario=data.phone;
                        this.presentToast("El numero de celular "+data.phone+" fue registrado correctamente","exito")
                      })
                    })                   
                  }
                })
              })                            
            }else{
              this.presentToast("El numero de celular debe tener al menos 12 digitos","error");
              return false;
            }                       
          }
        }
      ]
    });
    prompt.present(); 
  }

  openActualizarPago(placa, montoPendiente, tipoBoleta, nroBoleta, sucursal, fecha, doctor, puntosGanados:number){
    let modal = this.modalCtrl.create("FormaPagoPage",{"monto":montoPendiente, "tipo_boleta":tipoBoleta, "nro_boleta":nroBoleta}); 
    modal.onDidDismiss(datapago=>{
      if (datapago!=undefined){        
        let loading:any = this.loadingCtrl.create({
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

  actualizarTelefonoCliente(telefono){
    let prompt = this.alertCtrl.create({      
      title: "Modificar Nro. Celular Cliente",
      subTitle: "Usted va vambiar el acceso a la App Movil para este cliente",
      message: "El numero de telefono es el acceso a la App, realize esta operacion solo si el Cliente a cambiado de numero de celular. Por favor ingrese el nuevo numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
      inputs: [{ name: 'phone', placeholder: '+51984780945', value:telefono }],
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Confirmar',
          handler: data => {
            //cargamos loading
            if (telefono==data.phone){
              this.presentToast("No se observaron cambios en el numero de celular del cliente","error")
              return false;
            }else{
              if (data.phone.length >= 12){
                let loading:any = this.loadingCtrl.create({
                  content: "procesando informacion...",               
                })
                loading.present().then(_=>{
                  this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                    if (dataUsuario){
                      loading.dismiss().then(()=>{ 
                        this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error")
                      })
                    }
                    else{
                      this.database.existeTelefonoRegistrado(telefono).then(dataActual=>{
                        //treamos los datos del telefono actual                   
                        this.database.modificarTelefonoGeneral(dataActual.isadmin, dataActual.isadminprincipal, dataActual.iscliente, dataActual.isdoctor, dataActual.isgerente, dataActual.usuario, telefono, data.phone).then(_=>{
                          loading.dismiss().then(()=>{ 
                            this.presentToast("El numero de celular "+telefono+" fue cambiado a "+ data.phone+" en la base de datos. Ha cambiado correctamente el acceso de este cliente","exito")
                          })
                        }) 
                      });                                        
                    }
                  }) 
                })                             
              }else{
                this.presentToast("El numero de celular debe tener al menos 12 digitos","error");
                return false;
              }
            }            
          }
        }
      ]
    });
    prompt.present(); 
  }

  mostrarServicios(placa:string){
    let modal = this.modalCtrl.create("MostrarServiciosVentaPage",{"placa":placa}); 
    modal.present();
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

  openHistorialPagos(placa:string){
    let modal = this.modalCtrl.create("HistorialPagoPage",{"placa":placa}); 
    modal.present();
  }

}
