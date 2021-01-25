import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-administradores',
  templateUrl: 'administradores.html',
})
export class AdministradoresPage implements OnInit {
listaAdministradores: Observable<any[]>;
subscription:Subscription;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController
  ) {
  }

  ngOnInit(){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."            
    })
    loading.present().then(_=>{
      this.listaAdministradores=this.database.getAdministradores();
      this.subscription=this.database.getAdministradores().subscribe(data=>{      
        loading.dismiss();  
      });
    })     
  }

  registrarAdministrador(){
    this.navCtrl.push("EditAdministradorPage",{"operacion":"registrar"});
  }

  openOpcionesAdministrador(admin:string, telefono:string){    
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',      
      buttons: [
        {
          text: 'Editar informacion',                    
          handler: () => {
            this.navCtrl.push("EditAdministradorPage",{"administrador":admin,"operacion":"editar"});
          }
        },
        {
          text: 'Editar Accesos',                    
          handler: () => {
            let modal = this.modalCtrl.create("SeleccionSucursalesPage",{"administrador":admin}); 
            modal.present();            
          }
        },
        {
          text: 'Cambiar Nro. Celular',          
          handler: () => {
            this.actualizarTelefonoAdministrador(telefono);
          }
        },
        {
          text: 'Eliminar administrador',          
          handler: () => {
            let prompt = this.alertCtrl.create({      
              title: "Va eliminar un administrador",
              subTitle: "Esta seguro de realizar esta operacion?. Este administrador ya no podra acceder al sistema",  
              buttons: [
                { text: 'Cancelar',
                  role: "cancelar",
                  handler: data => { }
                },
                { text: 'Confirmar',
                  handler: data => {
                    this.eliminarAdministrador(admin, telefono);                        
                  }
                }
              ]
            });
            prompt.present();   
            
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

  actualizarTelefonoAdministrador(telefono:string){
    let prompt = this.alertCtrl.create({      
      title: "Modificar Nro. Celular Administrador",
      subTitle: "Usted va vambiar el acceso al sistema para este administrador",
      message: "El numero de telefono es el acceso al sistema, realize esta operacion solo si el Administrador a cambiado de numero de celular. Por favor ingrese el nuevo numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
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
              this.presentToast("No se observaron cambios en el numero de celular","error");
              return false;
            }else{
              if (data.phone.length >= 12){
                let loading:any = this.loadingCtrl.create({
                  content: "procesando informacion..."                
                })
                loading.present().then(_=>{
                  this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                    if (dataUsuario){
                      loading.dismiss().then(()=>{ 
                        this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error")
                      })
                    }
                    else{
                      //treamos los datos del telefono actual
                      this.database.existeTelefonoRegistrado(telefono).then(dataActual=>{
                        this.database.modificarTelefonoGeneral(dataActual.isadmin, dataActual.isadminprincipal, dataActual.iscliente, dataActual.isdoctor, dataActual.isgerente, dataActual.usuario, telefono, data.phone).then(_=>{
                          loading.dismiss().then(()=>{ 
                            this.presentToast("El numero de celular "+telefono+" fue cambiado a "+ data.phone+" en la base de datos. Ha cambiado correctamente el acceso de este administrador","exito")
                          })
                        })
                      })
                    }
                  }) 
                });                             
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

  eliminarAdministrador(codigo, telefono){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."            
    })
    loading.present().then(_=>{
      this.database.eliminarAdministrador(codigo, telefono).then(_=>{
        loading.dismiss().then(()=>{                                      
          this.presentToast("El administrador fue retirado del sistema","exito")                            
        })
      })
    });
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
