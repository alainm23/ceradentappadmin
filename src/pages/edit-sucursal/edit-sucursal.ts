import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, NavParams, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-edit-sucursal',
  templateUrl: 'edit-sucursal.html',
})
export class EditSucursalPage implements OnInit {
sucursalForm: FormGroup;
public loading:Loading;
codigoSucursal:string;
operacion:string;
path:string="Sucursales";
state: string;
titulo:string;
listaInsumos:any;
cantidadesActuales: Map<string, number> = new Map<string, number>();

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public toastCtrl: ToastController) {
  }

  ngOnInit(){
    if (this.navParams.get("operacion")!=undefined && this.navParams.get("operacion")!=null){
      this.operacion=this.navParams.get("operacion");
      this.inicializarFormulario();
      if (this.navParams.get("sucursal")!=undefined && this.navParams.get("sucursal")!=null) {
        this.codigoSucursal=this.navParams.get("sucursal");
        this.path=this.path+'/'+this.codigoSucursal;
        this.titulo="Editar Sucursal";
        this.database.getInsumos().subscribe(dataInsumos=>{
          this.listaInsumos=dataInsumos;
          dataInsumos.forEach((element: any) => {
            this.database.getStockSucursal(this.codigoSucursal, element.id).then(dataInsumo=>{
              if (dataInsumo) this.cantidadesActuales.set(element.id,dataInsumo.stock);
              else this.cantidadesActuales.set(element.id,0);
            })
          });
        });
        this.database.getStockSucursal
      }else this.titulo="Registrar Sucursal";
    }
    else{
      this.navCtrl.setRoot("SucursalesPage");
    }
    console.log(this.path)
  }

  inicializarFormulario(){
    this.sucursalForm = new FormGroup({
      'nombre': new FormControl("",[Validators.required]),
      'direccion': new FormControl("",[Validators.required]),
      'celular': new FormControl("",[Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
      'telefono': new FormControl("")
    })
  }

  changeHandler(e) {
    this.state = e;
  }

  actualizarStock(valor:number, insumo:string){
    let loading = this.loadingCtrl.create({
      content: "Actualizando...",
    })
    loading.present().then(()=>{
      this.database.actualizarStockInsumoSucursal(this.codigoSucursal, insumo, valor).then(_=>{
        loading.dismiss().then(()=>{
          this.presentToast("Se actualizo el stock","exito");
        });
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

}
