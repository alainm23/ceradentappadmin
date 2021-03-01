import { Component, OnInit } from '@angular/core';
import {
  IonicPage,
  NavController,
  LoadingController,
  ActionSheetController,
  AlertController,
  ToastController,
  ModalController
} from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
const algoliasearch = require ('algoliasearch');

@IonicPage()
@Component({
  selector: 'page-doctores',
  templateUrl: 'doctores.html',
})
export class DoctoresPage implements OnInit {
  listaDoctores: any;
  listaDoctores_bak: any;
  subscription:Subscription;
  client: any;
  index: any;
  doctores_map: Map <string, any> = new Map <string, any> ();
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

  ngOnInit () {
    this.client = algoliasearch ("S9Z0BUVW9R", "34d4989ee34f43acce877f2d15c61611");
    this.index = this.client.initIndex ("Doctores");

    this.init_subscription_doctores ();
  }

  init_subscription_doctores () {
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    });

    loading.present().then (_=> {
      // this.subscription=this.database.get_doctores ().subscribe(data=>{
      this.subscription = this.database.getDoctoresLimit (20).subscribe(data=>{
        this.listaDoctores=data;
        this.listaDoctores_bak=data;
        loading.dismiss ();
        console.log (data);
      });
    });
  }

  onInput($event) {
    let q = $event.target.value;
    if (q != "") {
      this.index
      .search(q)
      .then(({ hits }) => {
        console.log (hits);
        this.limpiar_map ();
        this.listaDoctores = hits.filter ((e: any) => {
          e.id = e.objectID;
          return true;
        });
      })
      .catch(err => {
        console.log (err);
      });
    }
  }

  registrarDoctor() {
    this.navCtrl.push("EditDoctorPage",{"operacion":"registrar"});
  }

  openOpcionesDoctor (doctor:string, telefono:string){
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
          text: 'Enviar Mensaje',
          handler: () => {
            let profileModal = this.modalCtrl.create('MensajesPage',{
              doctor: this.listaDoctores.find (x => x.id === doctor),
              tipo: 'directo'
            });

            profileModal.present ();
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

  ngOnDestroy () {
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe ();
  }

  exportarDoctores () {
    this.ngOnDestroy ();

    let loading:any = this.loadingCtrl.create ({
      content: "Procesando informacion..."
    });

    loading.present ();

    let unsubscribe = this.database.get_doctores ().subscribe ((res: any []) => {
      unsubscribe.unsubscribe ();
      console.log (res);
      loading.dismiss ();
      res.forEach (element => {
        if (element.dataNumero!=undefined) {
          element.pacientes_enviados = element.dataNumero.nro_placas;
        } else {
          element.pacientes_enviados = 0;
        }
      });

      this.database.exportAsExcelFile (res, "doctores");
      this.init_subscription_doctores ();
    }, error => {
      console.log (error);
      loading.dismiss ();
      this.init_subscription_doctores ();
    });
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

  doctor_checked (event: any, doctor: any) {
    console.log (event);
    if (event.value) {
      if (!this.doctores_map.has (doctor.id)) {
        this.doctores_map.set (doctor.id, {
          doctor,
          check: event
        });
      }
    } else {
      if (this.doctores_map.has (doctor.id)) {
        this.doctores_map.delete (doctor.id);
      }
    }

    console.log (this.doctores_map);
  }

  limpiar_map () {
    this.doctores_map.forEach ((value: any) => {
      value.check.value = false;
    });

    this.doctores_map.clear ();
  }

  enviar_mensaje () {
    if (this.doctores_map.size <= 1) {
      let doctor: any;
      let index = 0;
      this.doctores_map.forEach ((value: any) => {
        if (index <= 0) {
          doctor = value.doctor;
        }
        index++;
      });

      let profileModal = this.modalCtrl.create('MensajesPage',{
        doctor: doctor,
        tipo: 'directo'
      });

      profileModal.present ();
    } else {
      let doctores: any [] = [];
      this.doctores_map.forEach ((value: any) => {
        doctores.push (value.doctor);
      });

      let profileModal = this.modalCtrl.create ('MensajesPage',{
        doctores: doctores,
        tipo: 'multiple'
      });

      profileModal.present ();
    }
  }

  enviar () {
    var list: any [] = [];
    this.listaDoctores_bak.forEach ((element: any) => {
      // const data: any = {
      //   'apellidos': element.apellidos,
      //   'dni': element.dni,
      //   'email': element.email,
      //   'especialidades': element.especialidades,
      //   'nombres': element.nombres,
      //   'nro_colegiatura': element.nro_colegiatura,
      //   'puntaje': element.puntaje,
      //   'telefono': element.telefono,
      //   'objectID': element.id
      // };

      list.push (element.id);
      // const objectID = element.id;
      // this.index.saveObject ({
      //   objectID,
      //   ...data
      // });
    });

    console.log (list);
    this.database.update_docs (list).then ((res: any) => {
      console.log (res);
    }, error => {
      console.log (error);
    });

    // this.index.saveObjects (list).then ((res) => {
    //   console.log (res);
    // }).catch ((error: any) => {
    //   console.log (error);
    // });
  }
}
