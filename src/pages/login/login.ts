import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading, ToastController } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import firebase from 'firebase';
import { Subscription } from 'rxjs';
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../home/home';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {
phoneForm: FormGroup;
public loading:Loading;
public recaptchaVerifier:firebase.auth.RecaptchaVerifier;
subscription:Subscription;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private database: DatabaseProvider,
    public events: Events) {
  }

  ionViewDidLoad() {
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
  }

  ngOnInit(){
    this.phoneForm = new FormGroup({
      'phoneNumber': new FormControl("",[Validators.required, Validators.pattern(/^[0-9]{9}$/)])
    })
  }

  openExplicacion (){
    let alert = this.alertCtrl.create({
      title: "Seguridad primero",
      subTitle: "Porque debo ingresar mi numero de celular?",
      message: "<b>Para proteger su información</b>.<br><br>Porque de esta manera nos aseguramos que usted es el titular, el cual debe tener acceso.<br><br>Un mensaje de texto con un codigo será enviado a su celular, como proceso de verificación.",
      buttons: [
        {
          text: "Entendido",
          role: "cancelar"
        }
      ]
    });
    alert.present()
  }

  onSubmit () {
    const value= this.phoneForm.value;
    const appVerifier = this.recaptchaVerifier;
    let phoneNumberString='+51'+value.phoneNumber;
    //cargamos loading
    this.loading = this.loadingCtrl.create({
      content: "Procesando informacion...",
      dismissOnPageChange: true
    })
    this.loading.present();
    //verificamos que el telefono esta en la base de datos de telefonos registrados
    this.database.existeTelefonoRegistrado (phoneNumberString).then(dataUsuario=>{
      if (dataUsuario)
      {
        if (dataUsuario.isadmin==true){
          this.loading.dismiss().then(()=>{
            this.presentToast("Por favor confirme que no es un robot :)", "exito");
          })
          firebase.auth ().signInWithPhoneNumber (phoneNumberString, appVerifier)
            .then( confirmationResult => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              let prompt = this.alertCtrl.create({
                enableBackdropDismiss: false,
                title: "Verificacion",
                subTitle: "ingrese el codigo de confirmación",
                message: "Un mensaje de texto se ha enviado a <b>"+value.phoneNumber+"</b> con el codigo de acceso.",
                inputs: [{ name: 'confirmationCode', placeholder: 'codigo' }],
                buttons: [
                  { text: 'Cancel',
                    role: "cancelar",
                    handler: data => { }
                  },
                  { text: 'Confirmar',
                    handler: data => {
                      //cargamos loading
                      this.loading = this.loadingCtrl.create({
                        content: "verificando codigo...",
                        dismissOnPageChange: true
                      })
                      this.loading.present();
                      // Here we need to handle the confirmation code
                      confirmationResult.confirm(data.confirmationCode).then((result)=> {
                        //this.subscription=this.database.getTelefonoCuenta(phoneNumberString).subscribe(data=>{
                          //guardamos los datos del logueo en el local storage
                          this.database.guardarDatosUsuarioLocal(dataUsuario.usuario, dataUsuario.nombres, dataUsuario.isadmin, dataUsuario.isadminprincipal, dataUsuario.isdoctor, dataUsuario.iscliente, dataUsuario.isgerente).then(()=>{
                            this.loading.dismiss().then(()=>{
                              this.events.publish('user:login');
                              this.navCtrl.setRoot(HomePage,{"telefono": phoneNumberString, "codigoUsuario": dataUsuario.usuario});
                            })
                          })
                        //})
                      },(error)=>{
                        this.loading.dismiss().then(()=>{
                          this.presentToast('Error de verificacion: ingreso un codigo invalido o ya expirado, intentelo nuevamente', "error");
                        });
                      })
                    }
                  }
                ]
              });
              prompt.present();
          })
          .catch(function (error) {
            //this.presentToast('Error al enviar el mensaje de verificación :( '+error, "error");
            console.log(error);
          });
        }else{
          this.loading.dismiss().then(()=>{
            let alert = this.alertCtrl.create({
              title: "Opppppsss!",
              subTitle: "Sin permisos",
              message: "El numero de celular <b>"+value.phoneNumber+"</b> no tiene permisos de administrador.",
              buttons: [
                {
                  text: "Entendido",
                  role: "cancelar"
                }
              ]
            })
            alert.present();
          })
        }
      }else{//el numero de celular no esta registrado
        this.loading.dismiss().then(()=>{
          let alert = this.alertCtrl.create({
            title: "Opppppsss!",
            subTitle: "Numero de celular no encontrado",
            message: "El numero de celular <b>"+value.phoneNumber+"</b> no esta registrado en nuestro sistema.<br><br>Por favor verifique que haya ingresado el numero correcto. Si persiste el problema, comuniquese con su proveedor.",
            buttons: [
              {
                text: "Entendido",
                role: "cancelar"
              }
            ]
          })
          alert.present();
        })
      }
    })
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
