import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, ModalController, AlertController, ToastController, ActionSheetController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormControl, FormGroup, Validators} from "@angular/forms";
import { HomePage } from '../home/home';
import { AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { Subscription } from 'rxjs';

export interface ItemServicio {
  codigo: string;
  precio: string;
  nombre: string;
  cantidad: number;
  puntaje:string;
}

@IonicPage()
@Component({
  selector: 'page-editar-venta',
  templateUrl: 'editar-venta.html',
})
export class EditarVentaPage implements OnInit {
  placaForm: FormGroup;
  codigoSucursal:string;
  operacion:string;
  titulo:string;
  codigoCliente:string="";
  telefonoCliente:string="";
  dniCliente:string="";
  tipoCliente:string="";
  codigoDoctor:string="";
  puntajeDoctor:string="";
  nombreCliente:string="No seleccionado";
  nombreDoctor:string="No seleccionado";
  listaServicios:any;
  monto_total:number=0;
  urls = new Array<string>();
  serviciosSeleccionados: Map<string, ItemServicio> = new Map<string, ItemServicio>();
  cantidadesActuales: Map<string, number> = new Map<string, number>();
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  puntaje:number=0;
  subscription:Subscription;
  subscription1:Subscription;
  subscription2:Subscription;
  nombreSucursal:string;
  color:string="primary";
  reserva: any =  null;
  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,

  ) {
  }

  ngOnInit(){
    this.serviciosSeleccionados.clear();
    this.cantidadesActuales.clear();
    this.inicializarFormulario();
    if (this.navParams.get("sucursal")!=undefined && this.navParams.get("sucursal")!=null){
      let loading:any = this.loadingCtrl.create({
        content: "Procesando informacion..."
      });

      loading.present().then (async () => {
        this.codigoSucursal=this.navParams.get("sucursal");
        if (this.navParams.get("operacion")!=undefined && this.navParams.get("operacion")!=null) {
          this.subscription2=await this.database.getServicios().subscribe(dataServicios=>{
            this.listaServicios=dataServicios;
          })
          this.subscription=this.database.getSucursal(this.codigoSucursal).subscribe (async dataSucursal => {
            this.nombreSucursal=dataSucursal.nombre;
            this.operacion=this.navParams.get ("operacion");
            if (this.operacion=="registrar"){
              this.titulo="Registrar Venta";
            } else {
              if (this.operacion=="editar"){
                this.titulo="Editar Venta"
              }else {
                this.navCtrl.setRoot(HomePage);
              }
            }

            if (this.navParams.get ('reserva') !== undefined && this.navParams.get ('reserva') !== null) {
              this.reserva = this.navParams.get ('reserva');
              // Buscar Doctor
              let doctor = await this.database.getDoctor (this.reserva.doctor_id);
              this.nombreDoctor = doctor.nombres;
              this.codigoDoctor = this.reserva.doctor_id;
              this.puntajeDoctor = doctor.puntaje;

              // Buscar Cliente
              let cliente = await this.database.getCliente (this.reserva.cliente_id);
              console.log ('cliente', cliente);
              this.nombreCliente = cliente.nombres;
              this.codigoCliente = this.reserva.cliente_id;
              this.telefonoCliente = cliente.telefono;
              this.dniCliente = cliente.dni;
              this.tipoCliente = cliente.tipo;
              if (this.tipoCliente=='adulto'){
                  if (this.telefonoCliente=="") this.color="danger"; else this.color="primary";
              } else{
                if (this.dniCliente=="") this.color="danger"; else this.color="primary";
              }

              loading.dismiss ();
            } else {
              loading.dismiss ();
            }
          })
        }else{
          loading.dismiss().then(()=>{
           this.navCtrl.setRoot(HomePage);
          });
        }
      });
    }
    else{
      this.navCtrl.setRoot(HomePage);
    }
  }

  toggleSection(indice:string, servicio:string, precio:string, puntaje:string, nombre:string) {
    if (this.listaServicios[indice].open){
      /*this.serviciosSeleccionados.delete(servicio);
      this.monto_total-=Number(precio);
      this.puntaje=this.puntaje-Number(puntaje);*/
      let cantidad=this.serviciosSeleccionados.get(servicio).cantidad+1;
      let item:ItemServicio={codigo: servicio, precio: precio, nombre:nombre, cantidad:cantidad, puntaje:puntaje};
      this.serviciosSeleccionados.set(servicio, item);
      this.monto_total+=Number(precio);
      console.log(servicio);
      //preguntar si el puntaje tambien se va duplicar
    }
    else{
      let item:ItemServicio={codigo: servicio, precio: precio, nombre:nombre, cantidad:1, puntaje:puntaje};
      this.serviciosSeleccionados.set(servicio, item);
      this.monto_total+=Number(precio);
      this.puntaje=this.puntaje+Number(puntaje);
      this.listaServicios[indice].open=true;
      console.log(servicio);
    }
    //this.listaServicios[indice].open = !this.listaServicios[indice].open;
  }

  quitarServicio(indice, servicio){
    console.log(servicio);
    this.listaServicios[indice].open=false;
    let cantidad=this.serviciosSeleccionados.get(servicio).cantidad;
    let puntaje=this.serviciosSeleccionados.get(servicio).puntaje;
    let precio=this.serviciosSeleccionados.get(servicio).precio;
    this.serviciosSeleccionados.delete(servicio);
    this.monto_total-=(Number(precio)*cantidad);
    this.puntaje=this.puntaje-Number(puntaje);
  }

  inicializarFormulario(){
    this.placaForm = new FormGroup({
      'cliente': new FormControl("",[Validators.required]),
      'nombre_cliente': new FormControl("",[Validators.required]),
      'doctor': new FormControl("",[Validators.required]),
      'nombre_doctor': new FormControl("",[Validators.required]),
      'monto_total': new FormControl(0,[Validators.required]),
    })
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  openSeleccionarTipoCliente () {
    let modal = this.modalCtrl.create ("BuscarClientePage");
    modal.onDidDismiss (data => {
      if (data!=undefined) {
        if (data.respuesta=="registrar") {
          let modal = this.modalCtrl.create ("RegistrarClientePage");
          modal.onDidDismiss(data=>{
            if (data!=undefined) {
              console.log (data);

              this.nombreCliente=data.nombres;
              this.codigoCliente=data.codigo;
              this.telefonoCliente=data.telefono;
              this.dniCliente=data.dni;
              this.tipoCliente=data.tipo;
              if (this.tipoCliente=='adulto'){
                if (this.telefonoCliente=="") this.color="danger"; else this.color="primary";
              } else{
                if (this.dniCliente=="") this.color="danger"; else this.color="primary";
              }
              this.presentToast("El cliente "+this.nombreCliente+" fue registrado y anexado a la venta correctamente", "exito");
            }
            else {
              if (this.nombreCliente=="No seleccionado") this.presentToast("NO se ha seleccionado ningun cliente", "error");
            }
          });
          modal.present();
        } else {
          console.log (data);

          this.nombreCliente = data.nombres;
          this.codigoCliente = data.codigo;
          this.telefonoCliente = data.telefono;
          this.dniCliente = data.dni;
          this.tipoCliente = data.tipo;
          if (this.tipoCliente=='adulto'){
              if (this.telefonoCliente=="") this.color="danger"; else this.color="primary";
          } else{
            if (this.dniCliente=="") this.color="danger"; else this.color="primary";
          }

          this.presentToast("El cliente "+this.nombreCliente+" fue anexado a la venta correctamente", "exito");
        }
      } else {
        if (this.nombreCliente=="No seleccionado") this.presentToast("NO se ha seleccionado ningun cliente", "error");
      }
    });
    modal.present();
  }

  openBuscarCliente(){
    let prompt = this.alertCtrl.create({
      title: "Buscar Usuario",
      message: "Ingrese el numero de celular del cliente",
      inputs: [{ name: 'telefono', placeholder: '984780541' }],
      buttons: [
        { text: 'Cancel',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Confirmar',
          handler: data => {
            //cargamos loading
            if (data.telefono.length==9){
              let loading = this.loadingCtrl.create({
                content: "buscando cliente...",
              })
              loading.present().then(()=>{
                // Here we need to handle the confirmation code
                this.database.existeTelefonoRegistrado("+51"+data.telefono).then(async dataUsuario=>{
                  if (dataUsuario){
                    if (dataUsuario.iscliente==true){
                      this.subscription1=this.database.getDatosClienteObsevable(dataUsuario.usuario).subscribe(nombresUsuario=>{
                        loading.dismiss().then(()=>{
                          this.codigoCliente=dataUsuario.usuario;
                          this.nombreCliente=nombresUsuario.nombres+" "+nombresUsuario.apellidos;
                          this.telefonoCliente=data.telefono;
                          //this.presentToast("Cliente "+ this.nombreCliente+ " fue anexado a la venta","exito")
                        })
                      })
                    }
                    else{
                      let actual_rol="";
                      let datosActuales:any;
                      if (dataUsuario.isdoctor) {
                        actual_rol="doctor";
                        await this.database.getDoctor(dataUsuario.usuario).then(data=>{
                          datosActuales=data;
                        })
                      }
                      else{
                        actual_rol="administrador"
                        await this.database.getAdministrador(dataUsuario.usuario).then(data=>{
                          datosActuales=data;
                        })
                      }
                      loading.dismiss().then(()=>{
                        let prompt = this.alertCtrl.create({
                          title: "Usuario ya esta registrado",
                          subTitle: "El telefono ingresado ya pertenece al "+actual_rol+": "+datosActuales.nombres+" "+datosActuales.apellidos,
                          message: "¿Si desea, puede crear un perfil de cliente para este usuario?, caso contrario verifique que haya digitado correctamente el numero de celular.",
                          buttons: [
                            { text: 'Cancelar',
                              role: "cancelar",
                              handler: data2 => { }
                            },
                            { text: 'Crear perfil',
                              handler: data2 => {
                                /*let loading1 = this.loadingCtrl.create({
                                  content: "Registrando cliente...",
                                })
                                loading1.present().then(()=>{
                                  this.database.registrarClienteImagen(this.capitalizeFirstLetter(datosActuales.nombres), this.capitalizeFirstLetter(datosActuales.apellidos), datosActuales.email, datosActuales.dni, datosActuales.telefono, dataUsuario.usuario).then(_=>{
                                    loading1.dismiss().then(()=>{
                                      this.codigoCliente=dataUsuario.usuario;
                                      this.nombreCliente=datosActuales.nombres+" "+datosActuales.apellidos;
                                      this.telefonoCliente=datosActuales.telefono;
                                      this.presentToast("El cliente "+ this.nombreCliente+ " fue anexado a la venta","exito")
                                    })
                                  })
                                })  */
                              }
                            }
                          ]
                        });
                        prompt.present();
                      })
                    }
                  }
                  else{
                    loading.dismiss().then(()=>{
                      let modal = this.modalCtrl.create("RegistrarClientePage",{"telefono":data.telefono});
                      modal.onDidDismiss(data=>{
                        if (data!=undefined) {
                          this.nombreCliente=data.nombres;
                          this.codigoCliente=data.codigo;
                          this.telefonoCliente=data.telefono;
                          this.presentToast("El cliente "+this.nombreCliente+" fue registrado correctamente", "exito");
                        }
                        else this.presentToast("NO se ha seleccionado ningun cliente", "error");
                      });
                      modal.present();
                    })
                  }
                })
              });
            }else{
              this.presentToast("El numero de celular debe tener 9 digitos","error");
                return false;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  openBuscarDoctor(){
    let modal = this.modalCtrl.create("BuscarDoctorPage");
    modal.onDidDismiss(data=>{
      if (data!=undefined) {
        this.nombreDoctor=data.nombres;
        this.codigoDoctor=data.codigo;
        this.puntajeDoctor=data.puntaje;
        this.presentToast("El doctor "+this.nombreDoctor+" fue anexado a la venta", "exito");
      }
      //else this.presentToast("no se ha seleccionado", "error");
    });
    modal.present();
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

  //este servicio ya se usa pero lo dejo como referencia para subir imagenes y urls a un objeto para
  //posteriormente subirlo a storage firebase
  detectFiles(event, servicio){
    let files = event.target.files;
    if (files){
      for (let file of files){
        let reader = new FileReader();
        reader.onload = (e:any)=>{
          //this.serviciosSeleccionados.get(servicio).urls.push(e.target.result)
          //this.serviciosSeleccionados.get(servicio).imagenes.push(file);
        }
        reader.readAsDataURL(file);
      }
    }
    console.log(this.serviciosSeleccionados);
  }

  onSubmit() {
    let bandera:boolean=true;
    if (this.serviciosSeleccionados.size>0){
      if (!bandera){
        let alert = this.alertCtrl.create({
          title: "Opsssss!",
          subTitle: "Olvidaste subir las imagenes",
          message: "Es necesario que los servicios que seleccionastes incluyan la imagen de la(s) placa(s) tomadas",
          buttons: [
            {
              text: "Entendido",
              role: "cancelar"
            }
          ]
        })
        alert.present();
      }else{
        if (this.monto_total==0){
          let alert = this.alertCtrl.create({
            title: "Opsssss!",
            message: "El monto total del servicio no puede ser 0",
            buttons: [
              {
                text: "Entendido",
                role: "cancelar"
              }
            ]
          })
          alert.present();
        }else{
          let modal = this.modalCtrl.create("CulminarVentaPage",{"puntajedoctor":this.puntajeDoctor, "total":this.monto_total, "puntosventa":this.puntaje});
          modal.onDidDismiss(data=>{
            if (data!=undefined){
              this.monto_total=Number(data.nuevo_total);
              this.puntaje=Number(data.nuevo_puntaje);
              let modal = this.modalCtrl.create("FormaPagoPage",{"monto":this.monto_total});
              modal.onDidDismiss(datapago=>{
                if (datapago!=undefined){
                  //console.log("puntos_usados:"+data.puntos_usados);
                  //console.log("pago_efectivo:"+datapago.efectivo);
                  //console.log(datapago);
                  this.registrarVenta (data.descuento, data.puntos_usados, data.motivo_descuento, this.monto_total, datapago.efectivo, datapago.tarjeta, datapago.tipo_recibo, datapago.nro_recibo);
                }

              });
              modal.present();
            }
            //else this.presentToast("no se ha seleccionado", "error");
          });
          modal.present();
        }
      }
    }
    else{
      let alert = this.alertCtrl.create({
        title: "Opsssss!",
        subTitle: "Olvidaste seleccionar algun servicio",
        message: "Es necesario que selecciones un servicio al menos antes de continuar",
        buttons: [
          {
            text: "Entendido",
            role: "cancelar"
          }
        ]
      })
      alert.present();
    }
  }

  registrarVenta(descuento, puntosusados, motivodescuento, nuevototal, efectivo, tarjeta, tipoRecibo, nroRecibo){
    const value= this.placaForm.value;
    //cargamos loading
    let loading:any = this.loadingCtrl.create({
      content: "Procesando informacion...",
    })

    loading.present().then(_=>{
      this.database.traerDatosUsuarioLocal().then(datos=>{
        if (datos!=null && datos!=undefined){
          let datosUsuario=JSON.parse(datos);
          this.database.getAdministrador(datosUsuario.codigo).then(nombre=>{
            let administrador=nombre.nombres+" "+nombre.apellidos;
            let cantidadServicios=0;
            //let descuento_parcial=Math.round((descuento/this.serviciosSeleccionados.size)*100) /100;
            let nombresServicios="";
            let cantidadReal=0;

            //traemos los nombres de los servicios que se consumieron
            this.serviciosSeleccionados.forEach(servicio=>{
              nombresServicios=nombresServicios+"("+ servicio.cantidad +") "+servicio.nombre+", ";
              //tremos la cantidad de servicios
              cantidadReal+=servicio.cantidad;
            });
            let descuento_parcial=Math.round((descuento/cantidadReal)*100) /100;
            //verificamos que si se ha hecho de puntos no se haga sumatoria de puntaje de venta
            if (Number(puntosusados)>0) this.puntaje=0;
            this.database.registrarPlacaNuevo(value.cliente, value.nombre_cliente, value.doctor, value.nombre_doctor, this.codigoSucursal, Number(nuevototal), Number(descuento), Number(puntosusados), motivodescuento, Number(this.puntaje), this.nombreSucursal, Number(efectivo), Number(tarjeta), tipoRecibo, nroRecibo, nombresServicios, this.tipoCliente, administrador).then(newCodigo=>{
              //let nombresImagenes:string[]=[];
              this.serviciosSeleccionados.forEach (servicio=>{
                //this.cantidadesActuales.set(servicio.codigo,0);
                //nombresImagenes[servicio.codigo]="";
                this.database.registrarServicioPlacaNuevo(newCodigo, servicio.codigo, "", Number(servicio.precio), this.codigoSucursal, Number(descuento_parcial), servicio.cantidad).then(_=>{
                  cantidadServicios=cantidadServicios+1;
                  if (cantidadServicios==this.serviciosSeleccionados.size){
                    //termino el proceso
                    if (this.reserva === null) {
                      loading.dismiss().then(()=>{
                        this.presentToast("La venta se registro correctamente","exito")
                        this.navCtrl.pop ();
                      });
                    } else {
                      this.database.delete_reserva (this.reserva.id).then (() => {
                        loading.dismiss().then(()=>{
                          this.presentToast("La venta se registro correctamente","exito")
                          this.navCtrl.pop ();
                        });
                      }, error => {
                        console.log (error);
                      })
                    }
                  }
                })
              })
            })
          })
        }else{
          loading.dismiss().then(()=>{
            this.presentToast("El sistema no puede encontrar al administrador actual","error")
            //this.navCtrl.pop();
          })
        }
      })
    });

    /*for (let image of servicio.imagenes){
      let id = Math.random().toString(36).substring(2);
      let file_name = 'servicio-'+ id + new Date().getTime();
      let ref = this.afStorage.ref(file_name+'-photo.jpg');
      let task = ref.put(image);
      task.snapshotChanges().pipe(
        finalize(()=>{
          this.cantidadesActuales.set(servicio.codigo, this.cantidadesActuales.get(servicio.codigo)+1);
          console.log(this.cantidadesActuales.get(servicio.codigo)+"|"+servicio.codigo);
          nombresImagenes[servicio.codigo]=nombresImagenes[servicio.codigo]+file_name+"|";
          //this.ref.getDownloadURL
          //verificamos si ya se subieron todas las imagenes
          if (this.cantidadesActuales.get(servicio.codigo)==servicio.imagenes.length){
            //guardamos el servicio
            this.database.registrarServicioPlacaNuevo(newCodigo, servicio.codigo, nombresImagenes[servicio.codigo], Number(servicio.precio), this.codigoSucursal, Number(descuento_parcial)).then(_=>{
              cantidadServicios=cantidadServicios+1;
              if (cantidadServicios==this.serviciosSeleccionados.size){
                //termino el proceso
                this.loading.dismiss().then(()=>{
                  this.presentToast("La venta se registro correctamente","exito")
                  this.navCtrl.pop();
                })
              }
            })
          }
        })
      ).subscribe()
    }*/
  }

  openOpcionesClienteMenor(){
    console.log("El codigo es:"+this.codigoCliente)
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',
      buttons: [
        {
          text: 'Ver / Editar Tutores',
          handler: () => {
            let modal = this.modalCtrl.create("MostrarTutoresPage",{"menor":this.codigoCliente});
            modal.present();
          }
        },
        {
          text: 'Ver / Editar informacion',
          handler: () => {
            let modal = this.modalCtrl.create("EditClientePage",{"cliente":this.codigoCliente,"telefono":this.telefonoCliente});
            modal.present();
          }
        },
        {
          text: 'Mostrar Historial',
          handler: () => {
            this.navCtrl.push("HistorialClientePage",{"codigo":this.codigoCliente});
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  openOpcionesCliente(){
    console.log("El codigo es:"+this.codigoCliente)
    let actionSheet = this.actionSheetCtrl.create({
      title: '¿Que desea realizar?',
      buttons: [
        {
          text: 'Ver / Editar informacion',
          handler: () => {
            let modal = this.modalCtrl.create("EditClientePage",{"cliente":this.codigoCliente,"telefono":this.telefonoCliente});
            modal.present();
          }
        },
        {
          text: 'Mostrar Historial',
          handler: () => {
            this.navCtrl.push("HistorialClientePage",{"codigo":this.codigoCliente});
          }
        },
        {
          text: 'Cambiar Nro. Celular',
          handler: () => {
            if (this.telefonoCliente!="")
            this.actualizarTelefonoCliente(this.telefonoCliente);
            else
            this.asignarTelefonoCliente(this.codigoCliente);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  asignarTelefonoCliente(codigo){
    let prompt = this.alertCtrl.create({
      title: "Asignar Nro. Celular al Cliente",
      subTitle: "Crear acceso a la App móvil para este usuario",
      message: "El numero de telefono es el acceso a la App. Por favor ingrese el numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
      inputs: [{ name: 'phone', placeholder: '+51984780945', value:'+51' }],
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Confirmar',
          handler: data => {
            //cargamos loading
            if (data.phone.length >= 12){
              let loading = this.loadingCtrl.create({
                content: "procesando informacion...",
              })
              loading.present().then(_=>{
                this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                  if (dataUsuario){
                    loading.dismiss().then(()=>{
                      this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error")
                    })
                  }
                  else{
                    //creamos cuenta app movil al usuario
                    this.database.crearCuentaCliente(data.phone, codigo).then(_=>{
                      loading.dismiss().then(()=>{
                        this.color="primary";
                        this.telefonoCliente=data.phone;
                        this.presentToast("El numero de celular "+data.phone+" fue registrado correctamente","exito")
                      })
                    })
                  }
                })
              })
            }else{
              this.presentToast("El numero de celular debe tener al menos 12 digitos","error");
              return false;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  actualizarTelefonoCliente(telefono){
    let prompt = this.alertCtrl.create({
      title: "Modificar Nro. Celular Cliente",
      subTitle: "Usted va vambiar el acceso a la App Movil para este cliente",
      message: "El numero de telefono es el acceso a la App, realize esta operacion solo si el Cliente a cambiado de numero de celular. Por favor ingrese el nuevo numero de celular con los codigos de pais/ciudad Ejem: +51984796542",
      inputs: [{ name: 'phone', placeholder: '+51984780945', value:telefono }],
      buttons: [
        { text: 'Cancelar',
          role: "cancelar",
          handler: data => { }
        },
        { text: 'Confirmar',
          handler: data => {
            //cargamos loading
            if (telefono==data.phone){
              this.presentToast("No se observaron cambios en el numero de celular del cliente","error");
              return false;
            }else{
              if (data.phone.length >= 12){
                let loading:any = this.loadingCtrl.create({
                  content: "procesando informacion...",
                })
                loading.present().then(_=>{
                  this.database.existeTelefonoRegistrado(data.phone).then(dataUsuario=>{
                    if (dataUsuario){
                      loading.dismiss().then(()=>{
                        this.presentToast("El numero de celular "+ data.phone+" ya esta registrado en la base de datos. No se puede proceder","error");
                      })
                    }
                    else{
                      //treamos los datos del telefono actual
                      this.database.existeTelefonoRegistrado(telefono).then(dataActual=>{
                        this.database.modificarTelefonoGeneral(dataActual.isadmin, dataActual.isadminprincipal, dataActual.iscliente, dataActual.isdoctor, dataActual.isgerente, dataActual.usuario, telefono, data.phone).then(_=>{
                          loading.dismiss().then(()=>{
                            this.telefonoCliente=data.phone;
                            this.presentToast("El numero de celular "+telefono+" fue cambiado a "+ data.phone+" en la base de datos. Ha cambiado correctamente el acceso de este cliente","exito")
                          })
                        })
                      })
                    }
                  })
                })
              }else{
                this.presentToast("El numero de celular debe tener 9 digitos","error");
                return false;
              }
            }
          }
        }
      ]
    });
    prompt.present();
  }

  ngOnDestroy(){
    if (this.subscription!=undefined && this.subscription!=null)
    this.subscription.unsubscribe();
    if (this.subscription1!=undefined && this.subscription1!=null)
    this.subscription1.unsubscribe();
  }

}
