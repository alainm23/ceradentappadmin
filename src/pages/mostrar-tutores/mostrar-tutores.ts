import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, ModalController, ToastController, ActionSheetController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-mostrar-tutores',
  templateUrl: 'mostrar-tutores.html',
})
export class MostrarTutoresPage implements OnInit {
menor:string;
listaTutores:any;
subscription:Subscription;
codigoTutor:string;
nombreTutor:string;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController) {
  }

  ngOnInit(){
    if (this.navParams.get('menor')!=undefined){
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."            
      })
      loading.present().then(()=>{
        this.menor=this.navParams.get('menor');
        this.listaTutores=this.database.getTutoresMenor(this.menor);
        this.subscription=this.database.getTutoresMenor(this.menor).subscribe(data=>{          
          loading.dismiss();
        })
      });
    }      
    else this.viewCtrl.dismiss();
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  abrirRegistrarTutor(){
    let modal = this.modalCtrl.create("BuscarClientePage"); 
    modal.onDidDismiss(data=>{      
      if (data!=undefined) {
        if (data.respuesta=="registrar"){
          let modal = this.modalCtrl.create("RegistrarClientePage",{"apoderado":true}); 
          modal.onDidDismiss(data=>{      
            if (data!=undefined) {
              this.codigoTutor=data.codigo;  
              this.nombreTutor=data.nombres;
              let loading:any = this.loadingCtrl.create({
                content: "Procesando informacion..."            
              })
              loading.present().then(()=>{
                this.database.asignarTutorAMenor(this.menor, this.codigoTutor).then(_=>{
                  loading.dismiss().then(()=>{
                    this.presentToast("El usuario "+this.nombreTutor+" fue anexado como tutor", "exito"); 
                  })
                })
              })  
            }            
          });   
          modal.present();
        }else{          
          this.codigoTutor=data.codigo;  
          this.nombreTutor=data.nombres;
          let loading:any = this.loadingCtrl.create({
            content: "Procesando informacion..."            
          })
          loading.present().then(()=>{
            this.database.asignarTutorAMenor(this.menor, this.codigoTutor).then(_=>{
              loading.dismiss().then(()=>{
                this.presentToast("El usuario "+this.nombreTutor+" fue anexado como tutor", "exito"); 
              })
            })
          })          
        }           
      }     
    });   
    modal.present();
    /*let modal = this.modalCtrl.create("RegistrarClientePage",{"apoderado":true}); 
    modal.onDidDismiss(data=>{      
      /*if (data!=undefined) {
        this.nombreCliente=data.nombres; 
        this.codigoCliente=data.codigo;    
        this.telefonoCliente=data.telefono;
        this.dniCliente=data.dni;
        this.tipoCliente=data.tipo;
        this.presentToast("El cliente "+this.nombreCliente+" fue registrado y anexado a la venta correctamente", "exito");    
      }
      else {              
        if (this.nombreCliente=="No seleccionado") this.presentToast("NO se ha seleccionado ningun cliente", "error");
      }
    });   
    modal.present();*/
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

  openOpcionesTutor(codigo:string, telefono:string){    
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',      
      buttons: [
        {
          text: 'Ver / Editar informacion',                    
          handler: () => {
            let modal = this.modalCtrl.create("EditClientePage",{"cliente":codigo,"telefono":telefono}); 
            modal.present();
          }
        },
        {
          text: 'Mostrar Historial',          
          handler: () => {
            this.navCtrl.push("HistorialClientePage",{"codigo":codigo});
          }
        },
        {
          text: 'Cambiar Nro. Celular',          
          handler: () => {
            if (telefono!="")
            this.actualizarTelefonoCliente(telefono);
            else
            this.asignarTelefonoCliente(codigo);
          }
        },
        {
          text: 'Esta persona ya no será Tutor',          
          handler: () => {
            let alert = this.alertCtrl.create({
              title: "Confimación",
              subTitle: "Esta seguro que desea quitar el rol de Tutor a esta persona",
              message: "Esta persona ya no podra acceder a las placas del menor desde la App móvil",
              buttons: [
                { text: 'Confirmar',                  
                  handler: data => { 
                    let loading:any = this.loadingCtrl.create({
                      content: "procesando informacion...",               
                    })
                    loading.present().then(_=>{
                      this.database.quitarTutorAMenor(this.menor, codigo).then(_=>{
                        loading.dismiss(_=>{
                          this.presentToast("EL rol de tutor fue eliminado correctamente","exito")
                        });
                      })
                    });                    
                  }
                },
                { text: 'Cancelar',
                  role: "cancelar",
                  handler: data => { }
                }
              ]
            })
            alert.present();
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
              let loading = this.loadingCtrl.create({
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

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();    
  }

}
