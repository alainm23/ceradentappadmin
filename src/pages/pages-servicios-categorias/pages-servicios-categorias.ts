import { Component } from '@angular/core';

// Services
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController, ActionSheetController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage()
@Component({
  selector: 'page-pages-servicios-categorias',
  templateUrl: 'pages-servicios-categorias.html',
})
export class PagesServiciosCategoriasPage {
  items: any [] = [];
  subscribe: any;
  constructor (
      public navCtrl: NavController,
      public navParams: NavParams,
      public database: DatabaseProvider,
      public alertCtrl: AlertController,
      public toastCtrl: ToastController,
      public actionSheetCtrl: ActionSheetController,
      public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad () {
    const loader = this.loadingCtrl.create({
      content: "Procesando informacion..."
    });

    loader.present ();

    this.subscribe = this.database.get_servicios_categorias ().subscribe ((res: any []) => {
      loader.dismiss ();
      this.items = res;
      console.log (res);
    }, (error: any) => {
      loader.dismiss ();
      console.log (error);
    });
  }

  ngOnDestroy () {
    if (this.subscribe !== undefined && this.subscribe !== null) {
      this.subscribe.unsubscribe();
    }
  }

  registrar_categoria_alert (categoria: any=null) {
    let title: string = 'Registrar';
    let message: string = 'Ingrese el nombre de la categoria';
    let value: string = '';
    if (categoria !== null) {
      value = categoria.nombre;
      title = 'Actualizar';
      message = 'Ingrese un nuevo nombre para la categoria';
    }

    const prompt = this.alertCtrl.create  ({
      title: title,
      message: message,
      inputs: [
        {
          name: 'nombre',
          placeholder: 'Categoria',
          value: value
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: title,
          handler: (data: any) => {
            if (categoria === null) {
              this.registrar_categoria (data.nombre);
            } else {
              if (data.nombre.trim () !== '') {
                const loader = this.loadingCtrl.create({
                  content: "Procesando informacion..."
                });

                loader.present ();

                categoria.nombre = data.nombre;
                this.database.update_servicio_categoria (categoria).then (() => {
                  loader.dismiss ();
                  this.presentToast ('Categoria actualizada');
                }).catch ((error) => {
                  console.log (error);
                  loader.dismiss ();
                  this.presentToast ('Error', 'error');
                });
              } else {
                this.presentToast ('Ingrese un nombre de categoria valido', 'error');
              }
            }
          }
        }
      ]
    });

    prompt.present ();
  }

  registrar_categoria (nombre: string) {
    if (nombre.trim () !== '') {
      const loader = this.loadingCtrl.create({
        content: "Procesando informacion..."
      });

      loader.present ();

      let data: any = {
        id: this.database.createId (),
        nombre: nombre
      };

      this.database.add_servicio_categoria (data).then (() => {
        loader.dismiss ();
        this.presentToast ('Categoria registrada correctamente');
      }).catch ((error: any) => {
        this.presentToast ('Error', 'error');
        console.log (error);
        loader.dismiss ();
      });
    } else {
      this.presentToast ('Ingrese un nombre de categoria valido', 'error');
    }
  }

  editarServicio (data: any) {
    const actionSheet = this.actionSheetCtrl.create ({
      buttons: [
        {
          text: 'Editar',
          handler: () => {
            this.registrar_categoria_alert (data);
          }
        },{
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmar_eliminar (data.id);
          }
        }, {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  confirmar_eliminar (id: string) {
    const prompt = this.alertCtrl.create  ({
      title: 'Eliminar',
      message: "¿Esta seguro que desea eliminar la categoria seleccionada?",
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Eliminar',
          handler: (data: any) => {
            const loader = this.loadingCtrl.create({
              content: "Procesando informacion..."
            });

            loader.present ();

            this.database.delete_servicio_categoria (id).then (() => {
              loader.dismiss ();
              this.presentToast ('Categoria eliminada correctamente');
            }).catch ((error: any) => {
              loader.dismiss ();
              this.presentToast ('Error', 'error');
            });
          }
        }
      ]
    });

    prompt.present ();
  }

  presentToast (message: string,type: string='exito') {
    if (type == "exito"){
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: 'bottom',
        cssClass: "toast-success"
      });
      toast.present();
    } else {
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
