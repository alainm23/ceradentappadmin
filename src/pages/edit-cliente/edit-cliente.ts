import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-edit-cliente',
  templateUrl: 'edit-cliente.html',
})
export class EditClientePage implements OnInit {
clienteForm: FormGroup;  
codigoCliente:string;
datosCliente:Observable<any>;
telefonoCliente:string;
fechanac="";

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
    if (this.navParams.get('cliente')!=undefined){
      this.codigoCliente=this.navParams.get('cliente');
      this.telefonoCliente=this.navParams.get('telefono');
      this.datosCliente=this.database.getDatosClienteObsevable(this.codigoCliente);
      this.database.getCliente(this.codigoCliente).then(dc=>{
        this.fechanac=dc.fecha_nacimiento;
        console.log(this.fechanac);
      })
    }
    else{
      this.viewCtrl.dismiss();
    }
    this.clienteForm = new FormGroup({      
      'nombres': new FormControl("",[Validators.required]),
      'apellidos': new FormControl("",[Validators.required]),
      'email': new FormControl(""),      
      'dni': new FormControl("",[Validators.pattern(/^[0-9]{8}$/)]),
      "fecha_nacimiento":new FormControl(this.fechanac)   
    })
  }

  dismiss(){
    this.viewCtrl.dismiss();
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

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onSubmit(){
    let loading:any = this.loadingCtrl.create({
      content: "actualizando...",              
    })
    loading.present();   
    const value= this.clienteForm.value; 
    //verificamos que el telefono no este registrado
    this.database.actualizarDatosCliente(this.capitalizeFirstLetter(value.nombres), this.capitalizeFirstLetter(value.apellidos), value.email, value.dni, this.codigoCliente, this.telefonoCliente).then(_=>{
      loading.dismiss().then(()=>{       
        this.viewCtrl.dismiss();
        this.presentToast("Informacion actualizada","exito")
      })
    })    
  }

}
