import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';


@IonicPage()
@Component({
  selector: 'page-agregar-insumo',
  templateUrl: 'agregar-insumo.html',
})
export class AgregarInsumoPage {
placa:string;
servicio:string;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public database: DatabaseProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AgregarInsumoPage');
  }

}
