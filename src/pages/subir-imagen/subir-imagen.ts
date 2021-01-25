import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController, ToastController } from 'ionic-angular';
import { AngularFireStorage } from 'angularfire2/storage';
import moment from 'moment';
import { finalize } from 'rxjs/operators';
import { DatabaseProvider } from '../../providers/database/database';

export interface ItemImagen {
  imagen: any;
  url: string;
}

@IonicPage()
@Component({
  selector: 'page-subir-imagen',
  templateUrl: 'subir-imagen.html',
})
export class SubirImagenPage implements OnInit {
placa:string;
servicio:string;
listaImagenes = new Array<ItemImagen>();

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    private afStorage: AngularFireStorage,
    public database: DatabaseProvider,
    public toastCtrl: ToastController) {
  }

  ngOnInit(){
    this.placa=this.navParams.get('placa');
    this.servicio=this.navParams.get('servicio');
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  detectFiles(event, servicio){
    this.listaImagenes=[];
    let files = event.target.files;
    if (files){
      for (let file of files){
        let reader = new FileReader();
        reader.onload = (e:any)=>{
          let item:ItemImagen={imagen: file, url:e.target.result};
          this.listaImagenes.push(item);
        }
        reader.readAsDataURL(file);
      }
    }
    console.log(this.listaImagenes);
  }

  subirImagenes(){
    //cargamos loading
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion...",
    })
    loading.present().then(_=>{
      let mes_actual=moment().format('MM');
      let anio_actual=moment().format('YYYY');
      let imagenes_procesadas=0;
      let total_imagenes=this.listaImagenes.length;
      console.log(total_imagenes);
      console.log(this.listaImagenes)
      for (let image of this.listaImagenes){
        let id = Math.random().toString(36).substring(2);
        let file_name = mes_actual+'-'+anio_actual+'/servicio-'+ id + new Date().getTime();
        let ref = this.afStorage.ref(file_name+'-photo.jpg');
        let task = ref.put(image.imagen);
        task.snapshotChanges().pipe(finalize(()=>{
          imagenes_procesadas=imagenes_procesadas+1;
          console.log(imagenes_procesadas)
          this.database.registrarImagenPlaca(this.placa, this.servicio, file_name).then(async _=>{
            if (imagenes_procesadas==total_imagenes){
              // this.database.enviarNotificaciones(this.placa);
              loading.dismiss().then(_=>{
                this.presentToast("Las imagenes fueron cargadas correctamente","exito");
                if (loading!=null && loading!=undefined) this.dismiss();
              });
            }
          })
        })
        ).subscribe()
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

}
