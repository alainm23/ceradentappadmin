import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, NavParams, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

export interface ItemInsumo {
  codigo: string;
  cantidad: number;
}

@IonicPage()
@Component({
  selector: 'page-edit-servicio',
  templateUrl: 'edit-servicio.html',
})
export class EditServicioPage implements OnInit {
  servicioForm: FormGroup;
  public loading:Loading;
  codigoServicio:string;
  operacion:string;
  path:string="Servicios";
  state: string;
  titulo:string;
  listaInsumos: any;
  subscription:Subscription;
  subscription1:Subscription;
  subscription2:Subscription;
  insumosSeleccionados: Map<string, ItemInsumo> = new Map<string, ItemInsumo>();
  private insumos_actuales:any=[];
  categorias: any [] = [];

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navParams: NavParams
  ) {
  }

  ngOnInit () {
    if (this.navParams.get("operacion")!=undefined && this.navParams.get("operacion")!=null){
      this.operacion=this.navParams.get("operacion");
      this.inicializarFormulario ();
      if (this.navParams.get("servicio")!=undefined && this.navParams.get("servicio")!=null) {
        this.codigoServicio=this.navParams.get("servicio");
        this.path=this.path+'/'+this.codigoServicio;
        this.titulo="Editar Servicio";
        this.subscription1=this.database.getInsumosServicioObservable(this.codigoServicio).subscribe(async dataInsumosServicio=>{
          await dataInsumosServicio.forEach(element => {
            this.insumos_actuales.push(element.insumo);
            let insumo:ItemInsumo={codigo: element.insumo, cantidad:element.cantidad};
            this.insumosSeleccionados.set(element.insumo, insumo);
          });
          this.subscription=this.database.getInsumos().subscribe(data=>{
            this.listaInsumos=data;
            this.listaInsumos.forEach(elementt => {

              if (this.existeInsumo(elementt.id)==true){
                elementt.open=true;
              }
            });
          })
        });

        this.subscription2 = this.database.get_servicios_categorias ().subscribe ((res: any) => {
          this.categorias = res;
        });
      }else this.titulo="Registrar Servicio";
    }
    else{
      this.navCtrl.setRoot("ServiciosPage");
    }
    //console.log(this.path)
  }

  existeInsumo(item){

    if (this.insumos_actuales.indexOf(item)>=0) {

      return true
    } else {

      return false;
      }

  }

  inicializarFormulario(){
    this.servicioForm = new FormGroup({
      'nombre': new FormControl("",[Validators.required]),
      'precio': new FormControl("",[Validators.required]),
      'puntos': new FormControl("",[Validators.required, Validators.pattern(/^[0-9]*?$/)]),
      'tipo': new FormControl("",[Validators.required]),
      'descripcion': new FormControl (""),
      'precio_duplicado': new FormControl ("",[Validators.required]),
      'mostrar_comanda': new FormControl (false, [Validators.required]),
      'categoria_id': new FormControl (false, [Validators.required])
    })
  }

  changeHandler(e) {
    this.state = e;
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
    if (this.subscription2!=undefined && this.subscription2!=null)
    this.subscription2.unsubscribe();
  }

  toggleInsumo (indice:string, insumo:string){
    //if (this.listaInsumos[indice].open){
    if (this.insumosSeleccionados.get(insumo)){
      //this.listaInsumos[indice].open=false;
      let cantidad_nueva=this.insumosSeleccionados.get(insumo).cantidad+1;
      let insumo_aux:ItemInsumo={codigo: insumo, cantidad:cantidad_nueva};
      this.insumosSeleccionados.set(insumo, insumo_aux);
      let loading = this.loadingCtrl.create({
        content: "Actualizando...",
      })
      loading.present().then(()=>{
        this.database.actualizarInsumoServicio(insumo, this.codigoServicio, cantidad_nueva).then(_=>{
          loading.dismiss().then(()=>{
            this.presentToast("La información se actualizo correctamente","exito");
          });
        })
      });
      /*let loading = this.loadingCtrl.create({
        content: "Actualizando...",
      })
      loading.present().then(()=>{
        this.database.deleteInsumoServicio(insumo, this.codigoServicio).then(_=>{
          loading.dismiss().then(()=>{
            this.presentToast("Se quito el insumo del servicio","exito");
          });
        })
      });*/
    }
    else{
      let loading = this.loadingCtrl.create({
        content: "Actualizando...",
      })
      loading.present().then(()=>{
        this.database.registerInsumoServicio(insumo, this.codigoServicio).then(_=>{
          loading.dismiss().then(()=>{
            this.presentToast("Se adjunto el insumo al servicio","exito");
            //this.listaInsumos[indice].open=true;
          });
        })
      });
    }
  }

  quitarInsumo(indice, insumo){
    let loading = this.loadingCtrl.create({
      content: "Actualizando...",
    })
    loading.present().then(()=>{
      this.database.deleteInsumoServicio(insumo, this.codigoServicio).then(_=>{
        loading.dismiss().then(()=>{
          this.presentToast("Se quito el insumo del servicio","exito");
          //this.listaInsumos[indice].open=false;
          this.insumosSeleccionados.delete(insumo);
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
