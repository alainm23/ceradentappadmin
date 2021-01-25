import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';
import { HomePage } from '../home/home';
import { Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-ventas-mensuales',
  templateUrl: 'ventas-mensuales.html',
})
export class VentasMensualesPage implements OnInit {
  mesActual=moment().format('MM');
  anioActual=moment().format('YYYY');
  fechaActual=moment().format('YYYY-MM-DD');
  listaSucursales: Observable<any[]>;
  sucursal:string;
  usuario:string;
  ventasMensuales: any;
  saldosMensuales:any;
  subscription:Subscription;
  subscription1:Subscription;
  subscription2:Subscription;
  subscription3:Subscription;
  montoVendidoEfectivo:any=0;
  montoVendidoTarjeta:any=0;
  montoSaldosEfectivo:any=0;
  montoSaldonSelectTipoosEfectivo:any;
  montoSaldosTarjeta:any=0;
  tipoActual:string="diario";
  mostrarDatepicker:boolean=true;
  isGerente=false;
  ordenes: any [] = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public database: DatabaseProvider,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
  }

  ngOnInit(){
    this.database.traerDatosUsuarioLocal().then(datos=>{
      //console.log('jaja');
      if (datos!=null && datos!=undefined){
        //this.datosUsuario=JSON.parse(datos);
        console.log(JSON.parse(datos));
        this.isGerente=JSON.parse(datos).isgerente;
      }
    })

    if (this.navParams.get("sucursal")!=undefined && this.navParams.get("usuario")!=undefined){
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."
      })
      loading.present().then((_: any) => {
        this.usuario=this.navParams.get("usuario");
        this.sucursal=this.navParams.get("sucursal");
        this.database.get_ordenes_badge ().subscribe ((res: any []) => {
          this.ordenes = res;
        });

        this.listaSucursales = this.database.getSucursalesAdministrador(this.usuario);
        this.subscription=this.database.getSucursalesAdministrador(this.usuario).subscribe(_=>{
          this.subscription1=this.database.getVentasDiariasSucursal(this.sucursal, this.fechaActual).subscribe(ventas=>{
            this.ventasMensuales=ventas;
            console.log(this.ventasMensuales);
            this.subscription3=this.database.getSaldosDiariosSucursal(this.fechaActual, this.sucursal).subscribe(saldos=>{
              this.saldosMensuales=saldos;
              loading.dismiss().then(_=>{
                if (this.ventasMensuales.length>0){
                  this.montoVendidoEfectivo = this.ventasMensuales.filter ((item) =>item.primer_pago_efectivo).map((item) => +item.primer_pago_efectivo).reduce((sum, current) => sum + current, 0);
                  this.montoVendidoTarjeta = this.ventasMensuales.filter ((item) =>item.primer_pago_tarjeta).map((item) => +item.primer_pago_tarjeta).reduce((sum, current) => sum + current, 0);
                }
                if (this.saldosMensuales.length>0){
                  this.montoSaldosEfectivo = this.saldosMensuales.filter ((item) =>item.efectivo).map((item) => +item.efectivo).reduce((sum, current) => sum + current, 0);
                  this.montoSaldosTarjeta = this.saldosMensuales.filter ((item) =>item.tarjeta).map((item) => +item.tarjeta).reduce((sum, current) => sum + current, 0);
                }
              })
            })
          })
        })
      })
    }
    else{
      this.navCtrl.setRoot(HomePage);
    }
  }

  openActualizarPago(placa, montoPendiente:number, tipoBoleta, nroBoleta, sucursal, fecha, doctor, puntosGanados:number){
    let modal = this.modalCtrl.create("FormaPagoPage",{"monto":montoPendiente, "tipo_boleta":tipoBoleta, "nro_boleta":nroBoleta});
    modal.onDidDismiss(datapago=>{
      if (datapago!=undefined){
        let loading:any = this.loadingCtrl.create({
          content: "Procesando informacion..."
        })
        loading.present().then(_=>{
          this.database.actualizarPago(placa, datapago.efectivo, datapago.tarjeta, datapago.tipo_recibo, datapago.nro_recibo, sucursal, fecha, montoPendiente, doctor, puntosGanados).then(_=>{
            loading.dismiss();
          })
        })
      }
    });
    modal.present();
  }

  onSelectSucursal(selectedValue: any){
    this.eliminarSuscripciones();
    this.montoVendidoEfectivo=0;
    this.montoVendidoTarjeta=0;
    this.montoSaldosEfectivo=0;
    this.montoSaldosTarjeta=0;
    this.sucursal=selectedValue;
    let loading = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(async ()=>{
      if (this.tipoActual=="diario"){
        this.subscription1=this.database.getVentasDiariasSucursal(this.sucursal, this.fechaActual).subscribe(ventas=>{
          this.ventasMensuales=ventas;
          this.subscription3=this.database.getSaldosDiariosSucursal(this.fechaActual, this.sucursal).subscribe(saldos=>{
            this.saldosMensuales=saldos;
            loading.dismiss().then(_=>{
              if (this.ventasMensuales.length>0){
                this.montoVendidoEfectivo = this.ventasMensuales.filter ((item) =>item.primer_pago_efectivo).map((item) => +item.primer_pago_efectivo).reduce((sum, current) => sum + current, 0);
                this.montoVendidoTarjeta = this.ventasMensuales.filter ((item) =>item.primer_pago_tarjeta).map((item) => +item.primer_pago_tarjeta).reduce((sum, current) => sum + current, 0);
              }
              if (this.saldosMensuales.length>0){
                this.montoSaldosEfectivo = this.saldosMensuales.filter ((item) =>item.efectivo).map((item) => +item.efectivo).reduce((sum, current) => sum + current, 0);
                this.montoSaldosTarjeta = this.saldosMensuales.filter ((item) =>item.tarjeta).map((item) => +item.tarjeta).reduce((sum, current) => sum + current, 0);
              }
            })
          })
        })
      }else{
        this.subscription1= await this.database.getVentasMensualesSucursal(this.sucursal, this.mesActual, this.anioActual).subscribe(ventas=>{
          this.ventasMensuales=ventas;
        })
        this.subscription2=this.database.getVentaMensualTotal(this.sucursal, this.anioActual, this.mesActual).subscribe(montoTotal=>{
          loading.dismiss().then(_=>{
            console.log('Muestra datos mensuales '+this.mesActual + "del "+this.anioActual);
            if (montoTotal!=undefined && montoTotal!=null){
              this.montoVendidoEfectivo=montoTotal.monto_total_efectivo;
              this.montoVendidoTarjeta=montoTotal.monto_total_tarjeta;
            }else{
              this.montoVendidoEfectivo=0;
              this.montoVendidoTarjeta=0;
            }
            this.montoSaldosEfectivo=0;
            this.montoSaldosTarjeta=0;
          })
        })
      }
    })
  }

  onSelectAnio(selectedValue: any){
    this.eliminarSuscripciones();
    this.anioActual=selectedValue;
    this.montoVendidoEfectivo=0;
    this.montoVendidoTarjeta=0;
    this.montoSaldosEfectivo=0;
    this.montoSaldosTarjeta=0;
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(async ()=>{
      this.subscription1= await this.database.getVentasMensualesSucursal(this.sucursal, this.mesActual, this.anioActual).subscribe(ventas=>{
        this.ventasMensuales=ventas;
      })
      this.subscription2=this.database.getVentaMensualTotal(this.sucursal, this.anioActual, this.mesActual).subscribe(montoTotal=>{
        loading.dismiss().then(_=>{
          console.log('Muestra datos mensuales '+this.mesActual + "del "+this.anioActual);
          if (montoTotal!=undefined && montoTotal!=null){
            this.montoVendidoEfectivo=montoTotal.monto_total_efectivo;
            this.montoVendidoTarjeta=montoTotal.monto_total_tarjeta;
          }else{
            this.montoVendidoEfectivo=0;
            this.montoVendidoTarjeta=0;
          }
          this.montoSaldosEfectivo=0;
          this.montoSaldosTarjeta=0;
        })
      })
    })
  }

  onSelectMes(selectedValue: any){
    this.eliminarSuscripciones();
    this.mesActual=selectedValue;
    this.montoVendidoEfectivo=0;
    this.montoVendidoTarjeta=0;
    this.montoSaldosEfectivo=0;
    this.montoSaldosTarjeta=0;
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(async()=>{
      this.subscription1= await this.database.getVentasMensualesSucursal(this.sucursal, this.mesActual, this.anioActual).subscribe(ventas=>{
        this.ventasMensuales=ventas;
      })
      this.subscription2=this.database.getVentaMensualTotal(this.sucursal, this.anioActual, this.mesActual).subscribe(montoTotal=>{
        loading.dismiss().then(_=>{
          console.log('Muestra datos mensuales '+this.mesActual + "del "+this.anioActual);
          if (montoTotal!=undefined && montoTotal!=null){
            this.montoVendidoEfectivo=montoTotal.monto_total_efectivo;
            this.montoVendidoTarjeta=montoTotal.monto_total_tarjeta;
          }else{
            this.montoVendidoEfectivo=0;
            this.montoVendidoTarjeta=0;
          }
          this.montoSaldosEfectivo=0;
          this.montoSaldosTarjeta=0;
        })
      })
    })
  }

  onSelectTipo(selectedValue:any){
    this.eliminarSuscripciones();
    this.tipoActual=selectedValue;
    this.mostrarDatepicker=!this.mostrarDatepicker;
    this.fechaActual=moment().format('YYYY-MM-DD');
    this.mesActual=moment().format('MM');
    this.anioActual=moment().format('YYYY');
    this.montoVendidoEfectivo=0;
    this.montoVendidoTarjeta=0;
    this.montoSaldosEfectivo=0;
    this.montoSaldosTarjeta=0;
    let loading = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(async()=>{
      if (this.tipoActual=="diario"){
        this.subscription1=this.database.getVentasDiariasSucursal(this.sucursal, this.fechaActual).subscribe(ventas=>{
          this.ventasMensuales=ventas;
          this.subscription3=this.database.getSaldosDiariosSucursal(this.fechaActual, this.sucursal).subscribe(saldos=>{
            this.saldosMensuales=saldos;
            console.log(saldos);
            loading.dismiss().then(_=>{
              console.log('Muestra datos diarios '+this.fechaActual)
              if (this.ventasMensuales.length>0){
                this.montoVendidoEfectivo = this.ventasMensuales.filter ((item) =>item.primer_pago_efectivo).map((item) => +item.primer_pago_efectivo).reduce((sum, current) => sum + current, 0);
                this.montoVendidoTarjeta = this.ventasMensuales.filter ((item) =>item.primer_pago_tarjeta).map((item) => +item.primer_pago_tarjeta).reduce((sum, current) => sum + current, 0);
              }
              if (this.saldosMensuales.length>0){
                this.montoSaldonSelectTipoosEfectivo = this.saldosMensuales.filter ((item) =>item.efectivo).map((item) => +item.efectivo).reduce((sum, current) => sum + current, 0);
                this.montoSaldosTarjeta = this.saldosMensuales.filter ((item) =>item.tarjeta).map((item) => +item.tarjeta).reduce((sum, current) => sum + current, 0);
              }
            })
          });
        })
      } else {
        this.subscription1= await this.database.getVentasMensualesSucursal(this.sucursal, this.mesActual, this.anioActual).subscribe(ventas=>{
          this.ventasMensuales=ventas;
        })
        this.subscription2=this.database.getVentaMensualTotal(this.sucursal, this.anioActual, this.mesActual).subscribe(montoTotal=>{
          loading.dismiss().then(_=>{
            console.log('Muestra datos mensuales '+this.mesActual + "del "+this.anioActual);
            if (montoTotal!=undefined && montoTotal!=null){
              this.montoVendidoEfectivo=montoTotal.monto_total_efectivo;
              this.montoVendidoTarjeta=montoTotal.monto_total_tarjeta;
            }else{
              this.montoVendidoEfectivo=0;
              this.montoVendidoTarjeta=0;
            }
            this.montoSaldosEfectivo=0;
            this.montoSaldosTarjeta=0;
          })
        })
      }
    })
  }

  onSelectDate(selectedValue:any){
    this.eliminarSuscripciones();
    this.fechaActual=moment(selectedValue.year+'-'+selectedValue.month+'-'+selectedValue.day).format('YYYY-MM-DD');
    console.log(moment(this.fechaActual).format('YYYY-MM-DD'));
    this.montoVendidoEfectivo=0;
    this.montoVendidoTarjeta=0;
    this.montoSaldosEfectivo=0;
    this.montoSaldosTarjeta=0;
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion..."
    })
    loading.present().then(()=>{
      this.subscription1=this.database.getVentasDiariasSucursal(this.sucursal, this.fechaActual).subscribe(ventas=>{
        this.ventasMensuales=ventas;
        console.log(this.ventasMensuales);
        this.subscription3=this.database.getSaldosDiariosSucursal(this.fechaActual, this.sucursal).subscribe(saldos=>{
          this.saldosMensuales=saldos;
          console.log(saldos);
          loading.dismiss().then(_=>{
            console.log('Muestra datos diarios '+this.fechaActual)
            if (this.ventasMensuales.length>0){
              this.montoVendidoEfectivo = this.ventasMensuales.filter ((item) =>item.primer_pago_efectivo).map((item) => +item.primer_pago_efectivo).reduce((sum, current) => sum + current, 0);
              this.montoVendidoTarjeta = this.ventasMensuales.filter ((item) =>item.primer_pago_tarjeta).map((item) => +item.primer_pago_tarjeta).reduce((sum, current) => sum + current, 0);
            }
            if (this.saldosMensuales.length>0){
              this.montoSaldosEfectivo = this.saldosMensuales.filter ((item) =>item.efectivo).map((item) => +item.efectivo).reduce((sum, current) => sum + current, 0);
              this.montoSaldosTarjeta = this.saldosMensuales.filter ((item) =>item.tarjeta).map((item) => +item.tarjeta).reduce((sum, current) => sum + current, 0);
            }
          })
        });
      })
    });
  }

  registrarVenta(){
    this.navCtrl.push ("EditarVentaPage",{
      "sucursal":this.sucursal,
      "operacion":"registrar"
    });
  }

  mostrarServicios(placa:string){
    let modal = this.modalCtrl.create("MostrarServiciosVentaPage",{"placa":placa});
    modal.present();
  }

  openHistorialPagos(placa:string){
    let modal = this.modalCtrl.create("HistorialPagoPage",{"placa":placa});
    modal.present();
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
    if (this.subscription2!=undefined && this.subscription2!=null)
    this.subscription2.unsubscribe();
    if (this.subscription3!=undefined && this.subscription3!=null)
    this.subscription3.unsubscribe();
  }

  eliminarVenta(placa){
    let alert = this.alertCtrl.create({
      title: "Eliminar venta",
      subTitle: "Seguro que desea eliminar esta información?",
      message: "Borrando este registro se eliminará toda la información relacionada a esta venta",
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Eliminar',
          handler: data => {
            let loading:any = this.loadingCtrl.create({
              content: "Procesando informacion..."
            })
            loading.present().then(_=>{
              this.database.deletePlaca(placa).then(rpta=>{
                loading.dismiss().then(_=>{
                  this.presentToast("La venta fue eliminada correctamente","exito")
                });
              })
            });
            //console.log(placa);
          }
        }
      ]
    });
    alert.present()
  }

  eliminarSuscripciones(){

    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
    if (this.subscription2!=undefined && this.subscription2!=null)
    this.subscription2.unsubscribe();
    if (this.subscription3!=undefined && this.subscription3!=null)
    this.subscription3.unsubscribe();
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

  openInsumos(){
    let modal = this.modalCtrl.create("ListarInsumosSucursalPage",{"sucursal":this.sucursal});
    modal.present();
  }

  async exportar () {
    // let loading:any = this.loadingCtrl.create({
    //   content: "Procesando informacion..."
    // })
    // loading.present ();

    // const meses: any [] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    // let list: any [] = [];
    // for (const sucursal of ['PgGs8StuTTc6D7MtfVDz', 'cc0XUi1mEG3B7a1iaN33', 'q86OozrgQO75llVriQAM']) {
    //   for (const mes of meses) {
    //     let data = await this.database.getVentasMensualesSucursal (sucursal, mes, '2020').pipe(first ()).toPromise ();
    //     list = list.concat (data);
    //   }
    // }

    // loading.dismiss ();
    // console.log (list);
    // let map = new Map <string, any> ();
    // list.forEach ((l: any) => {
    //   if (map.has (l.doctor)) {
    //     map.get (l.doctor).Envios++;
    //   } else {
    //     map.set (l.doctor, { Envios: 1, Nombre: l.nombre_doctor });
    //   }
    // });
    // // console.log (map);
    // let final: any [] = [];
    // map.forEach ((value: any, key: string) => {
    //   final.push (value);
    // });
    // final = final.sort ((a: any, b: any) => {
    //   if (a.Envios < b.Envios) {
    //     return -1;
    //   }

    //   if (a.Envios > b.Envios) {
    //     return 1;
    //   }

    //   return 0;
    // });

    // console.log (final.reverse ());
    this.database.exportAsExcelFile (this.ventasMensuales, 'ventas');

    // this.database.exportAsExcelFile (final, 'ventas');
    // console.log (this.ventasMensuales);
  }

  openReservas () {
    this.navCtrl.setRoot ('ReservasListaPage', {
      sucursal: this.sucursal
    });
  }
}
