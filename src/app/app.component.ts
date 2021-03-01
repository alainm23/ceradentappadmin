import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Observable } from 'rxjs/Observable';

import { HomePage } from '../pages/home/home';
import { DatabaseProvider } from '../providers/database/database';
import { Events } from 'ionic-angular';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = HomePage;
  @ViewChild(Nav) nav: Nav;
  usuario: Observable<any>;
  datosUsuario:any={'nombres':'Admin','isadmin':false,'isadminprincipal':false,'isdoctor':false,'iscliente':false, 'isgerente':false};
  subscription:Subscription;
  subscription1:Subscription;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public database: DatabaseProvider,
    public modalCtrl: ModalController,
    public events: Events) {
    events.subscribe('user:login', () => {
      this.cargarMenu();
    });
    this.cargarMenu();
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

    });


  }

  cargarMenu(){
    this.database.traerDatosUsuarioLocal().then((datos=>{
      if (datos!=null && datos!=undefined){
        this.datosUsuario=JSON.parse(datos);
        /*this.datosUsuario={
          'codigo':"N5HE8Kkw6SPVdVa7nxIU",
          'nombres':"Juan Carlos",
          'isadmin':true,
          'isadminprincipal':true,
          'isdoctor':true,
          'iscliente':true,
          'isgerente':true
        }*/
        console.log(this.datosUsuario.codigo);
        //traemos el nombre del ususario
        this.subscription=this.database.getAdministradorObservable(this.datosUsuario.codigo).subscribe(nombre=>{
          this.datosUsuario.nombres=nombre.nombres;
          //ahora traemoa los roles que tiene
          this.subscription1=this.database.getRoles(nombre.telefono).subscribe(roles=>{
            this.datosUsuario.isadmin=roles.isadmin;
            this.datosUsuario.isadminprincipal=roles.isadminprincipal;
            this.datosUsuario.iscliente=roles.iscliente;
            this.datosUsuario.isdoctor=roles.isdoctor;
            this.datosUsuario.isgerente=roles.isgerente;
          })
        })

      }
      else{
        console.log('no hay datos de usuario almacenado');
      }
    }))
  }

  openAdministrador(){
    this.nav.push("AdministradorPage")
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    this.database.borrarDatosUsuario();
    this.database.cerrarSesion();
    this.nav.setRoot("LoginPage");
  }

  openInicio(){
    this.nav.setRoot(HomePage);
  }

  openSucursales(){
    this.nav.setRoot("SucursalesPage");
  }

  openServicios(){
    this.nav.setRoot("ServiciosPage");
  }

  openDoctores(){
    this.nav.setRoot("DoctoresPage");
  }

  openClientes(){
    this.nav.setRoot("HistorialClientePage");
  }

  openAdministradores(){
    this.nav.setRoot("AdministradoresPage");
  }

  openInsumos(){
    this.nav.setRoot("InsumosPage");
  }

  openMensajes () {
    let profileModal = this.modalCtrl.create ('MensajesPage',{
      doctores: [],
      tipo: 'multiple'
    });

    profileModal.present ();
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();

    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
  }
}

