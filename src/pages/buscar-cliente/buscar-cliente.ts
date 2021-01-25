import { Component, OnInit,} from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, LoadingController } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';


@IonicPage()
@Component({
  selector: 'page-buscar-cliente',
  templateUrl: 'buscar-cliente.html',
})
export class BuscarClientePage implements OnInit {
  phonedniForm: FormGroup;
  subscription:Subscription;
  listaClientes: any;
  listaClientes_bak: any;
  letras=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','ñ','o','p','q','r','s','t','u','v','w','x','y','z'];
  carga:boolean=false;
  segment: string = 'dni';
  dni: string = '';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public database: DatabaseProvider,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController) {
  }

  abrirRegistrarCliente (){
    let data:any= {
      "respuesta":"registrar",
    }

    this.viewCtrl.dismiss (data);
  }

  seleccionarCliente (codigo, nombres, apellidos, tipo, telefono, dni) {
    let data: any = {
      "respuesta":"anexar",
      "nombres":nombres+ " "+ apellidos,
      "codigo": codigo,
      "telefono": telefono,
      "tipo": tipo,
      "dni":dni
    };
    //console.log(data);
    this.viewCtrl.dismiss(data);
  }

  dismiss () {
    this.viewCtrl.dismiss ();
  }

  onInput ($event){
    this.listaClientes = this.listaClientes_bak;
    let q = $event.target.value;
    if (q != "") {
      this.listaClientes = this.listaClientes.filter ( item => {
        return (item.nombres.toLowerCase().indexOf (q.toLowerCase()) > -1)
      });
    }
  }

  buscarClientesLetra(letra:string){
    console.log(letra);
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(()=>{
      this.subscription=this.database.getClientesLetra(letra).subscribe(data=>{
        this.carga=true;
        this.listaClientes=data;
        this.listaClientes_bak=data;
        loading.dismiss();
      });
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

  ngOnInit(){
    this.phonedniForm = new FormGroup({
      'tipocliente': new FormControl("adulto",[Validators.required]),
      'phonedni': new FormControl("",[Validators.required, Validators.minLength(8)])
    })
  }

  ngOnDestroy (){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

  buscar_dni () {
    console.log (this.dni);

    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then (async () => {
      let res =  await this.database.get_cliente_dni (this.dni.toLowerCase ());
      console.log (res);
      this.listaClientes = res;
      loading.dismiss ();
    });
  }
}
