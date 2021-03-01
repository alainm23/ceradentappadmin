import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import * as moment from 'moment';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-pages-reserva-detalle',
  templateUrl: 'pages-reserva-detalle.html',
})
export class PagesReservaDetallePage {
  reserva: any = {
    servicio: {
      senos_maxilares: false,
      atm_b_abierta_b_cerrada: false,
      area_patologica: false,
      localizacion_conductos: false,

      panoramica_sola: false,
      panoramica_con_informe: false,
      panoramica_informe_cd: false,
      panoramica_periapicales_bite_wing: false,
      radio_ext_orl_atm_b_abierta_b_cerrada: false,
      carpal: false,
      carpal_con_studio: false,
      posterio_anterior: false,
      radio_ext_orl_senos_maxilares: false,
      radio_ext_orl_otros: false,
      radio_ext_orl_otros_texto: '',
      lineal_estricta: false,
      lateral_7ms: false,

      bitewing_morales_der: false,
      bitewing_morales_izq: false,
      bitewing_premolares_der: false,
      bitewing_premolares_izq: false,
      oclusal_superior: false,
      oclusal_inferior: false,

      ricketts: false,
      tweed: false,
      u_s_p_0_unicamp: false,
      steiner: false,
      roth_jarabak: false,
      bjork_jarabak: false,
      mc_namara: false,
      schwarz: false,
      adenoides: false,
      down: false,
      vto_de_ricketts: false,
      vto_de_ricketts_anios: '',

      fotos_extra_intraorales_standar: false,
      fotos_extra_intraorales_profesional: false,
    }
  };
  doctor: any;
  sucursal: any;

  tomografia_volumetrica_derecho: any [] = [];
  tomografia_volumetrica_izq: any [] = [];

  radio_intra_d_01: any [] = [];
  radio_intra_d_02: any [] = [];
  radio_intra_i_01: any [] = [];
  radio_intra_i_02: any [] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private database: DatabaseProvider, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
  }

  async ionViewDidLoad () {
    if (this.navParams.get ("sucursal") !== undefined && this.navParams.get ("item") !== undefined) {
      moment.locale ('es');
      this.reserva = this.navParams.get ("item");
      this.sucursal = this.navParams.get ("sucursal");
      console.log (this.reserva);

      this.tomografia_volumetrica_derecho = this.reserva.servicio_extras.tomografia_volumetrica_derecho;
      this.tomografia_volumetrica_izq = this.reserva.servicio_extras.tomografia_volumetrica_izq;
      this.radio_intra_d_01 = this.reserva.servicio_extras.radio_intra_d_01;
      this.radio_intra_d_02 = this.reserva.servicio_extras.radio_intra_d_02;
      this.radio_intra_i_01 = this.reserva.servicio_extras.radio_intra_i_01;
      this.radio_intra_i_02 = this.reserva.servicio_extras.radio_intra_i_02;

      if (this.reserva.doctor_id === null || this.reserva.doctor_id === undefined) {
        return;
      }

      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."
      });

      loading.present ();

      // Get doctor
      this.database.update_reserva (this.reserva.id, {visto: true});
      this.doctor = await this.database.getDoctor (this.reserva.doctor_id);
      if (this.doctor !== undefined && this.doctor !== null) {
        console.log (this.doctor);
        loading.dismiss ();
      } else {
        this.navCtrl.setRoot (HomePage);
      }
    } else {
      this.navCtrl.setRoot (HomePage);
    }
  }

  select (map: Map <string, boolean>, value: string) {
    if (map.has (value)) {
      map.set (value, !map.get (value));
    } else {
      map.set (value, true);
    }
  }

  get_fecha_format (fecha: string) {
    if (fecha === null || fecha === undefined) {
      return '';
    }

    return moment (fecha.substring (0, 10)).format ('ll');
  }

  registrar_venta () {
    this.navCtrl.push ("EditarVentaPage",{
      sucursal: this.sucursal,
      operacion: "registrar",
      reserva: this.reserva
    });
  }

  eliminar () {
    const prompt = this.alertCtrl.create({
      title: 'Confirmar',
      message: "¿Esta seguro que desea eliminar esta orden?",
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmar',
          handler: data => {
            let loading = this.loadingCtrl.create({
              content: "Procesando informacion..."
            });

            loading.present ();

            this.database.delete_reserva (this.reserva.id).then (() => {
              loading.dismiss ();
              this.navCtrl.pop ();
            }, error => {
              console.log (error);
              loading.dismiss ();
            });
          }
        }
      ]
    });

    prompt.present ();
  }

  validar_color (list: any [], value: string) {
    if (list === undefined || list === null) {
      return false;
    }

    if (list.find (x => x === value) === undefined) {
      return false;
    }

    return true;
  }
}
