import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, ActionSheetController, ViewController, ModalController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';
const algoliasearch = require ('algoliasearch');

@IonicPage()
@Component({
  selector: 'page-buscar-doctor',
  templateUrl: 'buscar-doctor.html',
})
export class BuscarDoctorPage implements OnInit {
  listaDoctores: any;
  listaDoctores_bak: any;
  public loading:Loading;
  subscription:Subscription;

  client: any;
  index: any;
  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController) {
  }

  ngOnInit () {
    this.client = algoliasearch ("S9Z0BUVW9R", "34d4989ee34f43acce877f2d15c61611");
    this.index = this.client.initIndex ("Doctores");

    // this.loading = this.loadingCtrl.create({
    //   content: "Procesando informacion..."
    // });

    // this.loading.present ().then (() => {
    //   this.subscription=this.database.getDoctores().subscribe(data=>{
    //     this.listaDoctores=data;
    //     this.listaDoctores_bak=data;
    //     console.log (data);
    //     this.loading.dismiss();
    //   });
    // });
  }

  onInput ($event){
    // this.listaDoctores = this.listaDoctores_bak;
    // let q = $event.target.value;
    // if (q != "") {
    //   this.listaDoctores = this.listaDoctores.filter ( item => {
    //     return (item.apellidos.toLowerCase().indexOf (q.toLowerCase()) > -1)
    //   });
    // }

    let q = $event.target.value;
    if (q != "") {
      this.index
      .search(q)
      .then(({ hits }) => {
        console.log (hits);
        this.listaDoctores = hits;
      })
      .catch(err => {
        console.log (err);
      });
    }
  }

  dismiss () {
    this.viewCtrl.dismiss();
  }

  seleccionarDoctor(codigo:string, nombres:string, apellidos:string, puntaje:string){
    let data:any={
      "nombres":nombres + " " + apellidos,
      "codigo":codigo,
      "puntaje":puntaje
    }

    this.viewCtrl.dismiss(data);
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

  abrirRegistrarDoctor () {
    let modal = this.modalCtrl.create("AgregarDoctorPage");
    modal.onDidDismiss (data=>{
      if (data!=undefined) {
        this.viewCtrl.dismiss(data);
      }
    });
    modal.present();
  }
}
