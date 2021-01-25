import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, ActionSheetController, AlertController, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-doctores',
  templateUrl: 'doctores.html',
})
export class DoctoresPage implements OnInit {
listaDoctores: any;
listaDoctores_bak: any;
subscription:Subscription;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
  }

  ngOnInit(){
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(_=>{
      this.subscription=this.database.getDoctores().subscribe(data=>{
        this.listaDoctores=data;
        this.listaDoctores_bak=data;
        if (loading!=null && loading!=undefined) loading.dismiss();
      });
    })

  }

  onInput($event){
    this.listaDoctores = this.listaDoctores_bak;
    let q = $event.target.value;
    if (q != "") {
      this.listaDoctores = this.listaDoctores.filter ( item => {
        return (item.apellidos.toLowerCase().indexOf (q.toLowerCase()) > -1)
      });
    }
  }

  registrarDoctor(){
    this.navCtrl.push("EditDoctorPage",{"operacion":"registrar"});
  }

  openOpcionesDoctor(doctor:string, telefono:string){
    console.log(doctor);
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',
      buttons: [
        {
          text: 'Editar Informacion',
          handler: () => {
            this.navCtrl.push("EditDoctorPage",{"doctor":doctor,"operacion":"editar"});
          }
        },
        {
          text: 'Mostrar Historial',
          handler: () => {
            this.navCtrl.push("HistorialDoctorPage",{"doctor":doctor});
          }
        },
        {
          text: 'Cambiar Nro. Celular',
          handler: () => {
            this.actualizarTelefonoDoctor(telefono);
          }
        },
        {
          text: 'Eliminar Doctor',
          handler: () => {
            this.eliminar_doctor (doctor, telefono);
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

  actualizarTelefonoDoctor(telefono:string){
    let prompt = this.alertCtrl.create({
      title: "Modificar Nro. Celular Doctor",
      subTitle: "Usted va vambiar el acceso a la App Movil para este doctor",
      message: "El numero de telefono es el acceso a la App, realize esta operacion solo si el Doctor a cambiado de numero de celular. Por favor ingrese el nuevo numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
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
              this.presentToast("No se observaron cambios en el numero de celular del doctor","error");
              return false;
            }else{
              if (data.phone.length >= 12){
                let loading:any = this.loadingCtrl.create({
                  content: "procesando informacion..."
                })
                loading.present().then(_=>{
                  this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                    if (dataUsuario){
                      if (loading!=null && loading!=undefined){
                        loading.dismiss().then(()=>{
                          this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error")
                          return false;
                        })
                      }
                    }
                    else{
                      //treamos los datos del telefono actual
                      this.database.existeTelefonoRegistrado(telefono).then(dataActual=>{
                        this.database.modificarTelefonoGeneral(dataActual.isadmin, dataActual.isadminprincipal, dataActual.iscliente, dataActual.isdoctor, dataActual.isgerente, dataActual.usuario, telefono, data.phone).then(_=>{
                          if (loading!=null && loading!=undefined){
                            loading.dismiss().then(()=>{
                              this.presentToast("El numero de celular "+telefono+" fue cambiado a "+ data.phone+" en la base de datos. Ha cambiado correctamente el acceso de este doctor","exito")
                            })
                          }
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
  }

  exportarDoctores(){

    this.listaDoctores_bak.forEach(element => {
      if (element.dataNumero!=undefined)
      element.pacientes_enviados=element.dataNumero.nro_placas;
      else element.pacientes_enviados=0;
    });
    this.database.exportAsExcelFile(this.listaDoctores_bak, "doctores");
  }

  eliminar_doctor (doctor_id: string, telefono: string) {
    let alert = this.alertCtrl.create({
      title: 'Confirmar operación',
      message: '¿Esta seguro que desea eliminar al doctor seleccionado?',
      buttons: [
        {
          text: 'Atras',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            let loading = this.loadingCtrl.create({
              content: 'Please wait...'
            });

            loading.present();

            this.database.eliminar_doctor (doctor_id, telefono)
              .then (() => {
                this.presentToast("El doctor se elimino correctamente","exito");
                loading.dismiss();
              })
              .catch ((error: any) => {
                this.presentToast("¡Ups! sucedio un error","error");
                console.log ('Error', error);
                loading.dismiss();
              })
          }
        }
      ]
    });
    alert.present();
  }
}
