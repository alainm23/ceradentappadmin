import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import { Subscription } from 'rxjs';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
listaSucursales: Observable<any[]>;
datosUsuario:any;
subscription:Subscription;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController) {
      this.database.estaLogueado().then((data)=>{
        if (!data) this.navCtrl.setRoot("LoginPage");
        else{
          //cargamos loading
          let loading:any = this.loadingCtrl.create({
            content: "Procesando informacion..."
          })
          loading.present().then(()=>{
            this.database.traerDatosUsuarioLocal().then(data=>{
              //console.log(data);

              if (data!=null && data!=undefined)
              {
                this.datosUsuario=JSON.parse(data);
                console.log(this.datosUsuario.codigo);
                /*this.datosUsuario={
                  codigo:"N5HE8Kkw6SPVdVa7nxIU"
                }*/
                this.listaSucursales = this.database.getSucursalesAdministrador (this.datosUsuario.codigo);
                this.subscription = this.database.getSucursalesAdministrador (this.datosUsuario.codigo).subscribe (info=>{
                  loading.dismiss().then(()=>{
                    if (info.length==1){
                      //console.log(info[0].data.sucursal);
                      this.navCtrl.setRoot("VentasMensualesPage",{"sucursal":info[0].data.sucursal,"usuario":this.datosUsuario.codigo,"nombresucursal":info[0].nombre});
                    }
                  });
                })
              }
              else{
                loading.dismiss().then(_=>{
                  console.log('debe cerrar sesion porque no hay codigo')
                  //this.database.cerrarSesion();
                })
              }
            })
          });
        }
      })
  }

  ngOnInit(){

  }

  probar(){
    //this.database.enviarNotificaciones("123456");
    /*this.database.getSucursales().subscribe(data=>{
      console.log(data);
      this.database.exportAsExcelFile(data, 'sample');
    })*/

  }

  openSucursal(sucursal:string, nombreSucursal:string){
    this.navCtrl.setRoot("VentasMensualesPage",{"sucursal":sucursal,"usuario":this.datosUsuario.codigo,"nombresucursal":nombreSucursal});
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
  }

}
