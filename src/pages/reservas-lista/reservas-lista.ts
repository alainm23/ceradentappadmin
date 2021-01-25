import { Component } from '@angular/core';

import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-reservas-lista',
  templateUrl: 'reservas-lista.html',
})
export class ReservasListaPage {
  items: any [] = [];
  _items: any [] = [];

  search_text: string = '';
  sucursal: any;
  constructor (
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public database: DatabaseProvider) {
  }

  ionViewDidLoad () {
    console.log (this.navParams.data);
    if (this.navParams.get("sucursal") != undefined) {
      this.sucursal = this.navParams.get ('sucursal');
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."
      });

      loading.present ();

      this.database.get_reservas ().subscribe ((res:any) => {
        console.log (res);
        loading.dismiss ();
        this.items = res;
        this._items = res;
      });
    } else {
      this.navCtrl.setRoot (HomePage);
    }
  }

  ver_detalle (item: any) {
    this.navCtrl.push ('PagesReservaDetallePage', {
      item: item,
      sucursal: this.sucursal
    });
  }

  filtrar () {
    this.items = this._items;

    if (this.search_text.trim () !== '') {
      this.items = this.items.filter ((i: any) => {
        return i.cliente_nombres.toLowerCase ().indexOf (this.search_text.toLowerCase ()) > -1;
      });
    }
  }
}
