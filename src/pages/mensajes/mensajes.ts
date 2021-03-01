import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, LoadingController } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import { DatabaseProvider } from '../../providers/database/database';
const algoliasearch = require ('algoliasearch');
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-mensajes',
  templateUrl: 'mensajes.html',
})
export class MensajesPage implements OnInit {
  doctores: any [] = [];
  doctores_busqueda: any [] = [];
  historial_mensajes: any [] = [];
  doctor: any;
  tipo: string = '';
  client: any;
  index: any;
  busqueda_doctores: boolean = false;
  readonly: boolean = false;
  para_todos: boolean = false;
  form: FormGroup;
  constructor (
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ViewController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public database: DatabaseProvider) {
  }

  ngOnInit () {
    moment.locale ('es');
    this.form = new FormGroup ({
      'asunto': new FormControl("", [Validators.required]),
      'mensaje': new FormControl("", [Validators.required])
    });
  }

  ionViewDidLoad () {
    this.client = algoliasearch ("S9Z0BUVW9R", "34d4989ee34f43acce877f2d15c61611");
    this.index = this.client.initIndex ("Doctores");

    this.tipo = this.navParams.get ('tipo');
    console.log (this.tipo);
    if (this.tipo === 'directo') {
      let loading = this.loadingCtrl.create ({
        content: "Procesando informacion..."
      });

      loading.present ();

      this.doctor = this.navParams.get ('doctor');
      console.log (this.doctor);

      this.database.get_historial_mensajes (this.doctor.id).subscribe ((res: any []) => {
        this.historial_mensajes = res;
        loading.dismiss ();
      });
    } else {
      this.doctores = this.navParams.get ('doctores');
      console.log (this.doctores);
    }
  }

  close () {
    this.modalCtrl.dismiss ();
  }

  onInput($event: any) {
    let q = $event.target.value;
    if (q != "") {
      this.index
      .search(q)
      .then(({ hits }) => {
        console.log (hits);
        this.doctores_busqueda = hits.filter ((e: any) => {
          e.id = e.objectID;
          return true;
        });
      })
      .catch(err => {
        console.log (err);
      });
    }
  }

  agregar_doctor (doctor: any) {
    if (this.doctores.find (x => x.id === doctor.id) === undefined) {
      this.doctores.push (doctor);

      let toast = this.toastCtrl.create({
        message: 'El doctor se agrego correctamente',
        duration: 1500,
        position: 'bottom'
      });

      toast.present ();
    } else {
      let toast = this.toastCtrl.create({
        message: 'El doctor ya fue agregado',
        duration: 1500,
        position: 'bottom'
      });

      toast.present ();
    }
  }

  validar_doctor_disponible (doctor: any) {
    if (this.doctores.find (x => x.id === doctor.id) === undefined) {
      return true;
    }

    return false;
  }

  eliminar_doctor (doctor: any) {
    for (let index = 0; index < this.doctores.length; index++) {
      if (this.doctores [index].id === doctor.id) {
        this.doctores.splice (index, 1);
      }
    }
  }

  toggle_busqueda () {
    if (this.busqueda_doctores) {
      this.busqueda_doctores = false;
      this.doctores_busqueda = [];
    } else {
      this.busqueda_doctores = true;
    }
  }

  onSubmit () {
    let loading = this.loadingCtrl.create ({
      content: "Procesando informacion..."
    });

    loading.present ();

    let mensaje: any = this.form.value;
    mensaje.id = this.database.createId ();
    mensaje.fecha = moment ().format ();
    mensaje.leido = false;
    mensaje.para_todos = false;

    if (this.tipo === 'directo') {
      this.database.enviar_mensaje (this.doctor.id, mensaje).then (() => {
        let push_data = {
          titulo: 'Ceradent - Nuevo Mensaje',
          detalle: mensaje.asunto,
          destino: 'mensajes',
          mode: 'tags',
          clave: 'placa',
          tokens: this.doctor.id
        };

        this.database.enviar_notificacion_mensaje (push_data).subscribe ((res: any) => {
          console.log (res);
        }, error => {
          console.log ('error', error);
        });

        console.log ('Agregado');
        loading.dismiss ();
        this.form.reset ();

        let toast = this.toastCtrl.create({
          message: 'El mensaje se envio correctamente',
          duration: 1500,
          position: 'bottom'
        });

        toast.present ();
      }, error => {
        console.log (error);
        loading.dismiss ()
      });
    } else {
      if (this.para_todos) {
        mensaje.para_todos = true;
        mensaje.leidos = [];
        this.database.enviar_mensaje_todos (mensaje).then (() => {
          loading.dismiss ();
          this.form.reset ();

          let push_data = {
            titulo: 'Ceradent - Nuevo Mensaje',
            detalle: mensaje.asunto,
            destino: 'mensajes',
            mode: 'tags',
            clave: 'placa',
            tokens: 'Doctor'
          };

          this.database.enviar_notificacion_mensaje (push_data).subscribe ((res: any) => {
            console.log (res);
          }, error => {
            console.log ('error', error);
          });

          let toast = this.toastCtrl.create({
            message: 'El mensaje se envio correctamente',
            duration: 1500,
            position: 'bottom'
          });

          toast.present ();
          this.close ();
        }, error => {
          console.log (error);
          loading.dismiss ()
        });
      } else {
        this.database.enviar_mensaje_doctores (mensaje, this.doctores).then (() => {
          let tokens = [];
          this.doctores.forEach ((doctor: any) => {
            tokens.push(doctor.id);
          });

          let push_data = {
            titulo: 'Ceradent - Nuevo Mensaje',
            detalle: mensaje.asunto,
            destino: 'mensajes',
            mode: 'tags',
            clave: 'placa',
            tokens: tokens.join (',')
          };

          this.database.enviar_notificacion_mensaje (push_data).subscribe ((res: any) => {
            console.log (res);
          }, error => {
            console.log ('error', error);
          });

          console.log ('Agregado');
          loading.dismiss ();
          this.form.reset ();

          let toast = this.toastCtrl.create({
            message: 'El mensaje se envio correctamente',
            duration: 1500,
            position: 'bottom'
          });

          toast.present ();
          this.close ();
        }, error => {
          console.log (error);
          loading.dismiss ()
        });
      }
    }
  }

  reiniciar_mensaje () {
    this.readonly = false;
    this.form.reset ();
  }

  get_fecha_format (fecha: string) {
    return moment (fecha).format ('lll');
  }

  ver_mensaje (mensaje: any) {
    this.form.patchValue (mensaje);
    this.readonly = true;
  }
}
