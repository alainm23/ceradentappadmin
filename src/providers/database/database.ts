import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { combineLatest, of } from "rxjs/index";
import { first, map } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import * as firebase from 'firebase';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class DatabaseProvider {

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private storage: Storage,
    private http: HttpClient){

  }

  /* INICIO FUNCIONES PRA EL STORAGE LOCAL */

  createId () {
    return this.db.createId ();
  }

  guardarCodigoUsuarioLocal(codigo:string){
    return this.storage.set('codigo',codigo);
  }

  traerCodigoUsuarioLocal(){
    return  this.storage.get('codigo');
  }

  guardarNombresUsuarioLocal(nombres:string){
    return this.storage.set('nombres',nombres);
  }

  traerNombresUsuarioLocal(){
    return this.storage.get('nombres');
  }

  guardarDatosUsuarioLocal(codigo:string, nombres:string, isadmin:boolean, isadminprincipal:boolean, isdoctor:boolean, iscliente:boolean, isgerente:boolean){
    let data ={
      'codigo':codigo,
      'nombres':nombres,
      'isadmin':isadmin,
      'isadminprincipal':isadminprincipal,
      'isdoctor':isdoctor,
      'iscliente':iscliente,
      'isgerente':isgerente
    }
    return this.storage.set('datausuario',JSON.stringify(data));
  }

  traerDatosUsuarioLocal(){
    return this.storage.get('datausuario');
  }

  borrarDatosUsuario(){
    this.storage.clear();
  }

  /* FIN FUNCIONES PRA EL STORAGE LOCAL */

  cerrarSesion(): Promise<any> {
    return this.afAuth.auth.signOut();
  }

  getUsuario(codigo:string){
    return this.db.collection('Usuarios').doc(codigo).valueChanges();
  }

  getRoles(telefono):any{
    return this.db.collection('Telefonos_Usuarios').doc(telefono).valueChanges ();
  }

  async existeTelefonoRegistrado(telefono:string):Promise<any>{
    const doc = await this.db.collection('Telefonos_Usuarios').doc(telefono).valueChanges().pipe(first()).toPromise()
    if (doc) {
        return doc;
    } else {
        return false
    }
  }

  async existeDniRegistrado(dni:string):Promise<any>{
    const doc = await this.db.collection('Dni_Usuarios').doc(dni).valueChanges().pipe(first()).toPromise()
    if (doc) {
        return doc;
    } else {
        return false
    }
  }

  async estaLogueado() {
    const user = await this.afAuth.authState.pipe(first()).toPromise();
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  getCliente(cliente):Promise<any>{
    return this.db.collection('Clientes').doc(cliente).valueChanges().pipe(first()).toPromise();
  }

  getDatosClienteObservable(cliente){
    return this.db.collection('Clientes').doc(cliente).valueChanges();
  }

  getDatosClienteObsevable(cliente):any{
    return this.db.collection('Clientes').doc(cliente).valueChanges();
  }

  getClienteObservable(cliente):Observable<any>{
    //return this.db.collection('Clientes').doc(cliente).valueChanges();
    const collection= this.db.collection('Clientes').doc(cliente);
    return collection.snapshotChanges().map(refReferencia=>{
      const data:any = refReferencia.payload.data();
      data.id= refReferencia.payload.id;
      return this.getNumeroPlacasCliente(data.id).pipe(map(dataNumero=> Object.assign({},{dataNumero, ...data})));
    }).mergeMap(observables => combineLatest(observables));
  }

  getAdministrador(administrador):Promise<any>{
    return this.db.collection('Administradores').doc(administrador).valueChanges().pipe(first()).toPromise();
  }

  getDoctor(doctor):Promise<any>{
    return this.db.collection('Doctores').doc(doctor).valueChanges().pipe(first()).toPromise();
  }

  getDoctorObservable(doctor):Observable<any>{
    return this.db.collection('Doctores').doc(doctor).valueChanges();
  }

  getAdministradorObservable(administrador):Observable<any>{
    return this.db.collection('Administradores').doc(administrador).valueChanges();
  }

  getPlaca(placa):Observable<any>{
    return this.db.collection('Placas').doc(placa).valueChanges();
  }

  getPlacaEstatic(placa):Promise<any>{
    return this.db.collection('Placas').doc(placa).valueChanges().pipe(first()).toPromise();
  }

  getHistorialPagosPlacaEstatic(placa):Promise<any>{
    return this.db.collection('Placas').doc(placa).collection("Pagos").valueChanges().pipe(first()).toPromise();
  }

  getServiciosPagosPlacaEstatic(placa):Promise<any>{
    return this.db.collection('Placas').doc(placa).collection("Servicios").valueChanges().pipe(first()).toPromise();
  }

  getServicio(servicio){
    return this.db.collection('Servicios').doc(servicio).valueChanges()
  }

  getServicioEstatic(servicio){
    return this.db.collection('Servicios').doc(servicio).valueChanges().pipe(first()).toPromise();
  }

  setIsCliente(phone){
    return this.db.collection('Telefonos_Usuarios').doc(phone).update({"iscliente":true});
  }

  setIsDoctor(phone){
    return this.db.collection('Telefonos_Usuarios').doc(phone).update({"isdoctor":true});
  }

  setIsAdministrador(phone){
    return this.db.collection('Telefonos_Usuarios').doc(phone).update({"isadmin":true});
  }

  getVentasMensualesSucursal(sucursal:string, mes:string, anio:string):Observable<any>{
    const collection = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio).collection("Meses").doc(mes).collection("Placas");
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getPlaca(data.placa).pipe(map(dataPlaca=> Object.assign({},{data, ...dataPlaca})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getVentasDiariasSucursal(sucursal:string, fecha:string):Observable<any>{
    const collection = this.db.collection("Ventas_Diarias").doc(sucursal).collection("Placas").doc(fecha).collection("Placas");
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getPlaca(data.placa).pipe(map(dataPlaca=> Object.assign({},{data, ...dataPlaca})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }


  getServiciosPlaca(placa:string):Observable<any>{
    const collection = this.db.collection("Placas").doc(placa).collection("Servicios");
    return collection.snapshotChanges().pipe(map(refReferencias=>{
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getServicio(data.servicio).pipe(map(dataServicio=> Object.assign({},{data, ...dataServicio})));
        })
    })).mergeMap(observables => combineLatest(observables));
  }

  registrarClienteSoloDatos(nombres:string, apellidos:string, email:string, dni:string, telefono:string, codigo:string){
    return this.db.collection("Clientes").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono})
  }

  registrarDoctorSoloDatos(nombres:string, apellidos:string, email:string, dni:string, telefono:string, nroColegiatura:string, especialidades:string, codigo:string){
    return this.db.collection("Doctores").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "especialidades":especialidades, "nro_colegiatura":nroColegiatura, "puntaje":0})
  }

  registrarAdministradorSoloDatos(nombres:string, apellidos:string, email:string, dni:string, telefono:string, codigo:string){
    return this.db.collection("Administradores").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono})
  }







  registrarClienteNuevo(nombres:string, apellidos:string, email:string, dni:string, telefono:string):Promise<any>{
    let codigo=this.db.createId();
    return this.db.collection("Clientes").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono}).then(_=>{
      return codigo;
    })
  }

  registrarDoctorNuevo(nombres:string, apellidos:string, email:string, dni:string, telefono:string, nroColegiatura:string, especialidades:string):Promise<any>{
    let codigo=this.db.createId();
    return this.db.collection("Doctores").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "especialidades":especialidades, "nro_colegiatura":nroColegiatura, "puntaje":0}).then(_=>{
      return codigo;
    })
  }

  registrarAdministradorNuevo(nombres:string, apellidos:string, email:string, dni:string, telefono:string):Promise<any>{
    let codigo=this.db.createId();
    return this.db.collection("Administradores").doc(codigo).set({"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono}).then(_=>{
      return codigo;
    })
  }

  registrarTelefonoCuentaCliente(phone, codigo){
    return this.db.collection('Telefonos_Usuarios').doc(phone).set({"usuario":codigo, "isadmin":false, "isadminprincipal":false, "iscliente":true, "isdoctor":false, "isgerente":false});
  }

  registrarTelefonoCuentaDoctor(phone, codigo){
    return this.db.collection('Telefonos_Usuarios').doc(phone).set({"usuario":codigo, "isadmin":false, "isadminprincipal":false, "iscliente":false, "isdoctor":true, "isgerente":false});
  }

  registrarTelefonoCuentaAdministrador(phone, codigo){
    return this.db.collection('Telefonos_Usuarios').doc(phone).set({"usuario":codigo, "isadmin":true, "isadminprincipal":false, "iscliente":false, "isdoctor":false, "isgerente":false});
  }

  registrarSucursalAdministrador(administrador:String, sucursal:string){
    return this.db.collection('Administradores_Sucursales').add({"administrador":administrador, "sucursal":sucursal})
  }

  eliminarSucursalAdministrador(codigo:string){
    return this.db.collection('Administradores_Sucursales').doc(codigo).delete();
  }

  registrarPlaca(cliente:string, nombreCliente:string, doctor:string, nombreDoctor:string, sucursal:string, monto:number, descuento:number, puntosUsados:number, motivoDescuento:string, puntosVenta:number, nombreSucursal:string):Promise<any>{
    let codigo=this.db.createId();
    let fecha_actual=moment().format('YYYY-MM-DD');
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    const clientesPlacasReference = this.db.collection("Clientes_Placas").doc(cliente);
    const doctorPlacasReference = this.db.collection("Doctor_Placas").doc(doctor);
    const sucursalTotalReference = this.db.collection("Ventas_Mensuales").doc(sucursal);
    const sucursalAnualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual);
    const sucursalMensualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual);
    const doctoresReference = this.db.collection("Doctores").doc(doctor);
    return this.db.collection("Placas").doc(codigo).set({"fecha":fecha_actual, "monto":monto, "cliente":cliente, "doctor":doctor, "sucursal":sucursal, "nombre_doctor":nombreDoctor, "nombre_cliente":nombreCliente, "descuento":descuento, "puntos_usados":puntosUsados, "motivo_descuento":motivoDescuento, "puntos_ganados":puntosVenta}).then(_=>{
      return firebase.firestore().runTransaction(t => {
        return t.get(clientesPlacasReference.ref).then(async doc => {
          if (!doc.exists){
            t.set(clientesPlacasReference.ref, {nro_placas:1})
          }
          else{nombreDoctor
            const newValue = doc.data().nro_placas + 1;
            t.update(clientesPlacasReference.ref, {nro_placas: newValue});
          }
          await this.db.collection("Clientes_Placas").doc(cliente).collection("Placas").add({"placa":codigo, "fecha":fecha_actual, "doctor":doctor, "nombre_doctor":nombreDoctor, "monto_total":monto, "nombre_sucursal":nombreSucursal});
        });
      }).then(res => {
        console.log('Transaction client completed!')
        return firebase.firestore().runTransaction(td=>{
          return td.get(doctorPlacasReference.ref).then(async docDoctor=>{
            if (!docDoctor.exists){
              td.set(doctorPlacasReference.ref, {nro_placas:1})
            }else{
              const newValue = docDoctor.data().nro_placas + 1;
              td.update(doctorPlacasReference.ref, {nro_placas: newValue});
            }
            await this.db.collection("Doctor_Placas").doc(doctor).collection("Placas").add({"placa":codigo, "fecha":fecha_actual, "paciente":cliente, "nombre_paciente":nombreCliente, "monto_total":monto, "nombre_sucursal":nombreSucursal});
          })
        }).then(res=>{
          console.log('Transaction doctor completed!')
          return firebase.firestore().runTransaction(tvmt=>{
            return tvmt.get(sucursalTotalReference.ref).then(docVmt=>{
              if (!docVmt.exists){
                tvmt.set(sucursalTotalReference.ref, {ventas_totales:1,monto_total:monto})
              }else{
                const newValue = docVmt.data().ventas_totales + 1;
                const newValue2 = docVmt.data().monto_total + monto;
                tvmt.update(sucursalTotalReference.ref, {ventas_totales: newValue, monto_total: newValue2});
              }
            })
          }).then(res=>{
            console.log('Transaction ventas mensuales totales completed!')
            return firebase.firestore().runTransaction(tvma=>{
              return tvma.get(sucursalAnualReference.ref).then(docVma=>{
                if (!docVma.exists){
                  tvma.set(sucursalAnualReference.ref, {ventas_totales:1, monto_total:monto, descuento_total:descuento, canje_total:puntosUsados})
                }else{
                  const newValue = docVma.data().ventas_totales + 1;
                  const newValue2 = docVma.data().monto_total + monto;
                  const newValue3 = docVma.data().descuento_total + descuento;
                  const newValue4 = docVma.data().canje_total + puntosUsados;
                  tvma.update(sucursalAnualReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total:newValue3, canje_total:newValue4});
                }
              })
            }).then(res=>{
              console.log('Transaction ventas mensuales anuales completed!')
              return firebase.firestore().runTransaction(tvmm=>{
                return tvmm.get(sucursalMensualReference.ref).then(docVmm=>{
                  if (!docVmm.exists){
                    tvmm.set(sucursalMensualReference.ref, {ventas_totales:1, monto_total:monto, descuento_total:descuento, canje_total:puntosUsados})
                  }else{
                    const newValue = docVmm.data().ventas_totales + 1;
                    const newValue2 = docVmm.data().monto_total + monto;
                    const newValue3 = docVmm.data().descuento_total + descuento;
                    const newValue4 = docVmm.data().canje_total + puntosUsados;
                    tvmm.update(sucursalMensualReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total:newValue3, canje_total:newValue4});
                  }
                })
              }).then(res=>{
                console.log('Transaction ventas mensuales mensuales completed!')
                if (puntosUsados>0){
                  return firebase.firestore().runTransaction(tdr=>{
                    return tdr.get(doctoresReference.ref).then(docDr=>{
                      if (!docDr.exists){
                        tdr.set(doctoresReference.ref, {puntaje:0})
                      }else{
                        const newValue = docDr.data().puntaje - puntosUsados;
                        tdr.update(doctoresReference.ref, {puntaje: newValue});
                      }
                    })
                  }).then(res=>{
                    console.log('Transaction puntaje doctor completed!')
                    return codigo;
                  })
                }else{
                  return firebase.firestore().runTransaction(tdr=>{
                    return tdr.get(doctoresReference.ref).then(docDr=>{
                      if (!docDr.exists){
                        tdr.set(doctoresReference.ref, {puntaje:puntosVenta})
                      }else{
                        const newValue = docDr.data().puntaje + puntosVenta;
                        tdr.update(doctoresReference.ref, {puntaje: newValue});
                      }
                    })
                  }).then(async res=>{
                    console.log('Transaction puntaje doctor completed!')
                    await this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Placas").add({"placa":codigo});
                    return codigo;
                  })
                }
              })
            })
          })
        })
      }, err => console.error(err));
    })
  }

  registrarServicioPlaca(placa:string, servicio:string, imagenes:string, monto: number, sucursal:string){
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    const sucursalAnualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Servicios").doc(servicio);
    const sucursalMensualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Servicios").doc(servicio);
    return this.db.collection('Placas').doc(placa).collection("Servicios").add({"servicio":servicio, "imagenes":imagenes}).then(_=>{
      return firebase.firestore().runTransaction(t=>{
        return t.get(sucursalAnualServiciosReference.ref).then(doc=>{
          if (!doc.exists){
            t.set(sucursalAnualServiciosReference.ref, {ventas_totales:1, monto_total:monto})
          }else{
            const newValue = doc.data().ventas_totales + 1;
            const newValue2 = doc.data().monto_total + monto;
            t.update(sucursalAnualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2});
          }
        })
      }).then(res=>{
        console.log('Transaction servicios anual completado!')
        return firebase.firestore().runTransaction(t=>{
          return t.get(sucursalMensualServiciosReference.ref).then(doc=>{
            if (!doc.exists){
              t.set(sucursalMensualServiciosReference.ref, {ventas_totales:1, monto_total:monto})
            }else{
              const newValue = doc.data().ventas_totales + 1;
              const newValue2 = doc.data().monto_total + monto;
              t.update(sucursalMensualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2});
            }
          })
        }).then(res=>{
          console.log('Transaction servicios mensual completado!')
          return sucursal;
        })
      })
    });
  }

  getTelefonoCuenta(phone:string){
    return this.db.collection('Telefonos_Usuarios').doc(phone).valueChanges().pipe(first());
  }

  getSucursal(sucursal:string):any{
    return this.db.collection('Sucursales').doc(sucursal).valueChanges();
  }

  getSucursalEstatico(sucursal:string):any{
    return this.db.collection('Sucursales').doc(sucursal).valueChanges().pipe(first()).toPromise();
  }

  getSucursales(){
    return this.db.collection('Sucursales').snapshotChanges().map(sucursales => {
      return sucursales.map(sucursal => {
        const data = sucursal.payload.doc.data();
        const id = sucursal.payload.doc.id;
        return { id, ...data };
      });
    })
  }

  getInsumos(){
    return this.db.collection('Insumos').snapshotChanges().map(insumos => {
      return insumos.map(insumo => {
        const data = insumo.payload.doc.data();
        const id = insumo.payload.doc.id;
        return { id, ...data };
      });
    })
  }

  getServicios(){
    return this.db.collection('Servicios').snapshotChanges().map(servicios => {
      return servicios.map(servicio => {
        const data = servicio.payload.doc.data();
        const id = servicio.payload.doc.id;
        return { id, ...data };
      });
    })
  }

  getStockSucursal(sucursal, insumo):Promise<any>{
    return this.db.collection("Sucursales").doc(sucursal).collection("Insumos").doc(insumo).valueChanges().pipe(first()).toPromise();
  }

  getInsumo(insumo){
    return this.db.collection("Insumos").doc(insumo).valueChanges();
  }

  getStockSucursalTotal(sucursal){
    const collection= this.db.collection("Sucursales").doc(sucursal).collection("Insumos");
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            data.id= refReferencia.payload.doc.id;
            return this.getInsumo(data.id).pipe(map(dataInsumo=> Object.assign({},{dataInsumo, ...data})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  actualizarStockInsumoSucursal(sucursal, insumo, cantidad:number){
    return this.db.collection("Sucursales").doc(sucursal).collection("Insumos").doc(insumo).set({"stock":cantidad})
  }

  getInsumosServicio(servicio:string){
    return this.db.collection("Servicios").doc(servicio).collection("Insumos").valueChanges().pipe(first()).toPromise();
  }

  getInsumosServicioObservable(servicio:string){
    return this.db.collection("Servicios").doc(servicio).collection("Insumos").valueChanges();
  }

  async registerInsumoServicio(insumo:string, servicio:string){
    var batch=this.db.firestore.batch();
    let insumoServicioref=this.db.collection('Servicios').doc(servicio).collection('Insumos').doc(insumo).ref;
    batch.set(insumoServicioref,{"insumo":insumo, "cantidad":1});
    await batch.commit();
    return insumo;
  }

  async actualizarInsumoServicio(insumo:string, servicio:string, cantidad:number){
    var batch=this.db.firestore.batch();
    let insumoServicioref=this.db.collection('Servicios').doc(servicio).collection('Insumos').doc(insumo).ref;
    batch.update(insumoServicioref,{"cantidad":cantidad});
    await batch.commit();
    return insumo;
  }

  async deleteInsumoServicio(insumo:string, servicio:string){
    var batch=this.db.firestore.batch();
    let insumoServicioref=this.db.collection('Servicios').doc(servicio).collection('Insumos').doc(insumo).ref;
    batch.delete(insumoServicioref);
    await batch.commit();
    return insumo;
  }

  getNumeroPlacasDoctor(doctor:string){
    return this.db.collection('Doctor_Placas').doc(doctor).valueChanges();
  }

  getNumeroPlacasCliente(cliente:string){
    return this.db.collection('Clientes_Placas').doc(cliente).valueChanges();
  }

  getVentaMensualTotal(sucursal:string, anio:string, mes:string):any{
    return this.db.collection('Ventas_Mensuales').doc(sucursal).collection('Anios').doc(anio).collection('Meses').doc(mes).valueChanges();
  }

  getHistorialPago(placa:string){
    return this.db.collection('Placas').doc(placa).collection('Pagos').valueChanges();
  }

  getDoctores(){
    const collection= this.db.collection('Doctores');
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            data.id= refReferencia.payload.doc.id;
            return this.getNumeroPlacasDoctor(data.id).pipe(map(dataNumero=> Object.assign({},{dataNumero, ...data})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getClientesLetra(letra:string){
    const collection= this.db.collection('Clientes_Letra').doc(letra).collection('Clientes');
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            //data.id= refReferencia.payload.doc.id;
            return this.getDatosClienteObservable(data.usuario).pipe(map(dataCliente=> Object.assign({},{data, ...dataCliente})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getAdministradores(){
    return this.db.collection('Administradores').snapshotChanges().map(administradores => {
      return administradores.map(administrador => {
        const data = administrador.payload.doc.data();
        const id = administrador.payload.doc.id;
        return { id, ...data };
      });
    })
  }

  getHistorialDoctor(doctor:string):Observable<any[]>{
    const collection= this.db.collection('Doctor_Placas').doc(doctor).collection('Placas');
    //const doc =  this.db.collection('Telefonos_Usuarios').doc(telefono).valueChanges().pipe(first()).toPromise()
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getPlaca(data.placa).pipe(map(dataPlaca=> Object.assign({},{data, ...dataPlaca})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getHistorialCliente(cliente:string){
    const collection= this.db.collection('Clientes_Placas').doc(cliente).collection('Placas');
    //const doc =  this.db.collection('Telefonos_Usuarios').doc(telefono).valueChanges().pipe(first()).toPromise()
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getPlaca(data.placa).pipe(map(dataPlaca=> Object.assign({},{data, ...dataPlaca})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getSucursalesAdministrador(usuario:string):Observable<any>{
    const collection = this.db.collection('Administradores_Sucursales',ref=>ref.where('administrador','==',usuario));
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getSucursal(data.sucursal).pipe(map(dataSucursal=> Object.assign({},{data, ...dataSucursal})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getSoloSucursalesAdministrador(usuario:string):Observable<any>{
    return this.db.collection('Administradores_Sucursales',ref=>ref.where('administrador','==',usuario)).snapshotChanges().map(administradores => {
      return administradores.map(administrador => {
        const data = administrador.payload.doc.data();
        const id = administrador.payload.doc.id;
        return { id, ...data };
      });
    })
  }

  getTutoresMenor(menor:string){
    const collection = this.db.collection('Tutores_Menor').doc(menor).collection('Tutores');
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getDatosClienteObsevable(data.usuario).pipe(map(dataCliente=> Object.assign({},{data, ...dataCliente})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  getSaldosDiariosSucursal(fecha:string, sucursal:string){
    const collection = this.db.collection('Saldos_Diarios').doc(sucursal).collection('Saldos').doc(fecha).collection('Saldos');
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getPlaca(data.placa).pipe(map(dataPlaca=> Object.assign({},{dataPlaca, ...data})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  /*operaciones con batch*/
  actualizarPago(placa:string, efectivo:number, tarjeta:number, tipoBoleta:string, nroBoleta:string, sucursal:string, fecha:string, montoPendiente:number, doctor:string, puntosGanados:number){
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    let dia_actual=moment().format('DD');
    //console.log(dia_actual);
    let mes_placa=moment(fecha).format('MM');
    let anio_placa=moment(fecha).format('YYYY');
    let dia_placa=moment(fecha).format('DD');
    //console.log(dia_placa);

    const doctoresReference = this.db.collection("Doctores").doc(doctor);

    var batch=this.db.firestore.batch();
    let codigoHistorial=this.db.createId();
    let fecha_completa1=moment().format('YYYY-MM-DD');
    let fecha_completa=moment().format('YYYY-MM-DD, h:mm:ss a');
    let historialPlacaref=this.db.collection('Placas').doc(placa).collection('Pagos').doc(codigoHistorial).ref;
    batch.set(historialPlacaref,{"efectivo":efectivo, "tarjeta":tarjeta, "fecha":fecha_completa, "codigo":codigoHistorial})

    if (mes_placa==mes_actual && anio_placa==anio_actual && dia_placa==dia_actual){
      //es el mismo dia entonces solo actualizamos el pago y cremoa el historial
    }else{
      let codigoUnicoDiario=this.db.createId();
      let saldosDiariosref=this.db.collection('Saldos_Diarios').doc(sucursal).collection('Saldos').doc(fecha_completa1).collection('Saldos').doc(codigoUnicoDiario).ref;
      batch.set(saldosDiariosref,{"efectivo":efectivo, "tarjeta":tarjeta, "placa":placa, "fecha":fecha_completa})
      /*if (mes_placa==mes_actual && anio_placa==anio_actual){
        //se pago otro dia del mismo mes
      }else{
        if (anio_actual==anio_placa){
          //se pago en otro mes
          let codigoUnico=this.db.createId();
          let saldosMensualesref=this.db.collection('Saldos_Mensuales').doc(sucursal).collection('Saldos').doc(anio_actual+'-'+mes_actual).collection('Saldos').doc(codigoUnico).ref;
          batch.set(saldosMensualesref,{"efectivo":efectivo, "tarjeta":tarjeta, "placa":placa, "fecha":fecha_completa})
        }
      }*/
    }

    const sucursalTotalReference = this.db.collection("Ventas_Mensuales").doc(sucursal);
    const sucursalAnualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual);
    const sucursalMensualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual);
    const PlacaReference = this.db.collection("Placas").doc(placa);

    return firebase.firestore().runTransaction(t => {
      return t.get(PlacaReference.ref).then(doc => {
        if (mes_placa==mes_actual && anio_placa==anio_actual && dia_placa==dia_actual){
          const newValue = doc.data().monto_efectivo + efectivo;
          const newValue1 = doc.data().monto_tarjeta + tarjeta;
          const newValue2 = doc.data().primer_pago_efectivo + efectivo;
          const newValue3 = doc.data().primer_pago_tarjeta + tarjeta;
          t.update(PlacaReference.ref, {monto_efectivo: newValue, monto_tarjeta:newValue1, tipo_recibo:tipoBoleta, nro_recibo:nroBoleta, primer_pago_efectivo:newValue2, primer_pago_tarjeta:newValue3});
        }else{
          const newValue = doc.data().monto_efectivo + efectivo;
          const newValue1 = doc.data().monto_tarjeta + tarjeta;
          t.update(PlacaReference.ref, {monto_efectivo: newValue, monto_tarjeta:newValue1, tipo_recibo:tipoBoleta, nro_recibo:nroBoleta});
        }
      });
    }).then(res=>{
      console.log('Transaction placa completed!')
      return firebase.firestore().runTransaction(tvmt=>{
        return tvmt.get(sucursalTotalReference.ref).then(docVmt=>{
          if (!docVmt.exists){
            tvmt.set(sucursalTotalReference.ref, {ventas_totales:0,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:0})
          }else{
            const newValue2 = docVmt.data().monto_total_efectivo + efectivo;
            const newValue3 = docVmt.data().monto_total_tarjeta + tarjeta;
            tvmt.update(sucursalTotalReference.ref, {monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3});
          }
        })
      }).then(res=>{
        console.log('Transaction ventas totales completed!')
        return firebase.firestore().runTransaction(tvma=>{
          return tvma.get(sucursalAnualReference.ref).then(docVma=>{
            if (!docVma.exists){
              tvma.set(sucursalAnualReference.ref, {ventas_totales:0,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:0, canje_total:0})
            }else{
              const newValue2 = docVma.data().monto_total_efectivo + efectivo;
              const newValue3 = docVma.data().monto_total_tarjeta + tarjeta;
              tvma.update(sucursalAnualReference.ref, {monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3});
            }
          })
        }).then(res=>{
          console.log('Transaction ventas anuales completed!')
          return firebase.firestore().runTransaction(tvmm=>{
            return tvmm.get(sucursalMensualReference.ref).then(docVmm=>{
              if (!docVmm.exists){
                tvmm.set(sucursalMensualReference.ref, {ventas_totales:0,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:0, canje_total:0})
              }else{
                const newValue2 = docVmm.data().monto_total_efectivo + efectivo;
                const newValue3 = docVmm.data().monto_total_tarjeta + tarjeta;
                tvmm.update(sucursalMensualReference.ref, {monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3});
              }
            })
          }).then(async res=>{
            console.log('Transaction ventas mensuales completed!')
            if (montoPendiente<=tarjeta+efectivo){
              return firebase.firestore().runTransaction(tvdo=>{
                return tvdo.get(doctoresReference.ref).then(docVdo=>{
                  if (!docVdo.exists){
                    tvdo.set(doctoresReference.ref, {puntaje:puntosGanados})
                  }else{
                    const newValue = docVdo.data().puntaje + puntosGanados;
                    tvdo.update(doctoresReference.ref, {puntaje: newValue});
                  }
                })
              }).then(async res=>{
                await batch.commit();
                return codigoHistorial;
              })
            }else{
              await batch.commit();
              return codigoHistorial;
            }
          })
        })
      })
    })
  }

  async registrarAdministradorImagen(nombres:string, apellidos:string, email:string, dni:string, telefono:string, codigo:string){
    var batch=this.db.firestore.batch();
    let administradorref=this.db.collection('Administradores').doc(codigo).ref;
    batch.set(administradorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono});
    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.update(usuarioref,{"isadmin":true});

    return await batch.commit();
  }

  async registrarAdministradorCompleto(nombres:string, apellidos:string, email:string, dni:string, telefono:string){
    var batch=this.db.firestore.batch();

    let codigoAdministrador=this.db.createId();
    let administradorref=this.db.collection('Administradores').doc(codigoAdministrador).ref;
    batch.set(administradorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono});

    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.set(usuarioref,{"usuario":codigoAdministrador, "isadmin":true, "isadminprincipal":false, "iscliente":false, "isdoctor":false, "isgerente":false});

    return await batch.commit();
  }

  eliminarAdministrador(codigo:string, telefono:string){
    console.log(telefono);
    var batch=this.db.firestore.batch();

    let administradorref=this.db.collection('Administradores').doc(codigo).ref;
    batch.delete(administradorref);

    //verficamos si tiene otros roles para ver si eliminamos o actualizamos
    return this.existeTelefonoRegistrado(telefono).then(data=>{
      let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
      if (!data.iscliente && !data.isdoctor){
        batch.delete(usuarioref);
      }else{
        batch.update(usuarioref,{"isadmin":false,"isadminprincipal":false});
      }
      return batch.commit();
    })
  }

  actualizarDatosAdministrador(nombres:string, apellidos:string, email:string, dni:string, codigo:string, telefono:string){
    var batch=this.db.firestore.batch();
    let administradorref=this.db.collection('Administradores').doc(codigo).ref;
    batch.update(administradorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});

    return this.existeTelefonoRegistrado(telefono).then(datos=>{
      if (datos.iscliente){
        let clienteref=this.db.collection('Clientes').doc(codigo).ref;
        batch.update(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
        console.log('cliete')
      }
      if (datos.isdoctor){
        let doctorref=this.db.collection('Doctores').doc(codigo).ref;
        batch.update(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
        console.log('doctor')
      }
      return batch.commit();
    })
  }

  actualizarDatosCliente(nombres:string, apellidos:string, email:string, dni:string, codigo:string, telefono:string){

    var batch=this.db.firestore.batch();
    let clienteref=this.db.collection('Clientes').doc(codigo).ref;
    batch.update(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});

    //creamos en clientes_letras
    var letra=nombres.charAt(0).toLowerCase();
    let clienteletraref=this.db.collection('Clientes_Letra').doc(letra).collection('Clientes').doc(codigo).ref;
    batch.set(clienteletraref,{"usuario":codigo})

    if (telefono!="")
    {
      return this.existeTelefonoRegistrado(telefono).then(datos=>{
        if (datos.isadmin){
          let administradorref=this.db.collection('Administradores').doc(codigo).ref;
          batch.update(administradorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
          console.log('admin')
        }
        if (datos.isdoctor){
          let doctorref=this.db.collection('Doctores').doc(codigo).ref;
          batch.update(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
          console.log('doctor')
        }
        return batch.commit();
      })
    }else return batch.commit();
  }

  actualizarDatosDoctor(nombres:string, apellidos:string, email:string, dni:string, nroColegiatura:string, especialidades:string, codigo:string, telefono:string){
    console.log(telefono)
    var batch=this.db.firestore.batch();
    let doctorref=this.db.collection('Doctores').doc(codigo).ref;
    batch.update(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni, "especialidades":especialidades, "nro_colegiatura":nroColegiatura})

    return this.existeTelefonoRegistrado(telefono).then(datos=>{
      if (datos.isadmin){
        let administradorref=this.db.collection('Administradores').doc(codigo).ref;
        batch.update(administradorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
        console.log('admin')
      }
      if (datos.iscliente){
        let clienteref=this.db.collection('Clientes').doc(codigo).ref;
        batch.update(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni});
        console.log('cliente')
      }
      return batch.commit();
    })
  }

  modificarTelefonoGeneral(isadmin:boolean, isadminprincipal:boolean, iscliente:boolean, isdoctor:boolean, isgerente:boolean, usuario:string, phoneactual:string, phonenuevo:string){
    var batch=this.db.firestore.batch();
    console.log(phoneactual);
    console.log(phonenuevo);
    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(phonenuevo).ref;
    batch.set(usuarioref, {"usuario":usuario, "isadmin":isadmin, "isadminprincipal":isadminprincipal, "iscliente":iscliente, "isdoctor":isdoctor, "isgerente":isgerente});

    let usuariorefanterior=this.db.collection('Telefonos_Usuarios').doc(phoneactual).ref;
    batch.delete(usuariorefanterior);

    if (isadmin || isgerente){
      let administradorref=this.db.collection('Administradores').doc(usuario).ref;
      batch.update(administradorref,{"telefono":phonenuevo})
    }

    if (isdoctor){
      let doctorref=this.db.collection('Doctores').doc(usuario).ref;
      batch.update(doctorref,{"telefono":phonenuevo})
    }

    if (iscliente){
      let clienteref=this.db.collection('Clientes').doc(usuario).ref;
      batch.update(clienteref,{"telefono":phonenuevo})
    }

    return batch.commit();
  }

  async registrarDoctorImagen(nombres:string, apellidos:string, email:string, dni:string, telefono:string, nroColegiatura:string, especialidades:string,  codigo:string){
    var batch=this.db.firestore.batch ();
    let doctorref=this.db.collection ('Doctores').doc(codigo).ref;
    batch.set(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "especialidades":especialidades, "nro_colegiatura":nroColegiatura, "puntaje":0})
    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.update(usuarioref,{"isdoctor":true});

    return await batch.commit();
  }

  async asignarTutorAMenor(codigoMenor:string, codigoTutor:string){
    //const collection = this.db.collection('Tutores_Menor').doc(menor).collection('Tutores');
    var batch=this.db.firestore.batch();
    let tutormenorref=this.db.collection('Tutores_Menor').doc(codigoMenor).collection('Tutores').doc(codigoTutor).ref;
    batch.set(tutormenorref,{"usuario":codigoTutor});

    //tambien creamos la relacion de Menores_Tutor
    let menortutorref=this.db.collection('Menores_Tutor').doc(codigoTutor).collection('Menores').doc(codigoMenor).ref;
    batch.set(menortutorref,{"usuario":codigoMenor});
    return await batch.commit();
  }

  async quitarTutorAMenor(codigoMenor:string, codigoTutor:string){
    //const collection = this.db.collection('Tutores_Menor').doc(menor).collection('Tutores');
    var batch=this.db.firestore.batch();
    let tutormenorref=this.db.collection('Tutores_Menor').doc(codigoMenor).collection('Tutores').doc(codigoTutor).ref;
    batch.delete(tutormenorref);

    //tambien creamos la relacion de Menores_Tutor
    let menortutorref=this.db.collection('Menores_Tutor').doc(codigoTutor).collection('Menores').doc(codigoMenor).ref;
    batch.delete(menortutorref);
    return await batch.commit();
  }

  async registrarDoctorCompleto(nombres:string, apellidos:string, email:string, dni:string, telefono:string, nroColegiatura:string, especialidades:string){
    var batch=this.db.firestore.batch();

    let codigoDoctor=this.db.createId();
    let doctorref=this.db.collection('Doctores').doc(codigoDoctor).ref;
    batch.set(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "especialidades":especialidades, "nro_colegiatura":nroColegiatura, "puntaje":0});

    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.set(usuarioref,{"usuario":codigoDoctor, "isadmin":false, "isadminprincipal":false, "iscliente":false, "isdoctor":true, "isgerente":false});

    return await batch.commit();
  }

  async registrarDoctorCompletoConID (codigoDoctor: string, nombres:string, apellidos:string, email:string, dni:string, telefono:string, nroColegiatura:string, especialidades:string){
    var batch=this.db.firestore.batch();

    let doctorref=this.db.collection('Doctores').doc(codigoDoctor).ref;
    batch.set(doctorref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "especialidades":especialidades, "nro_colegiatura":nroColegiatura, "puntaje":0});

    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.set(usuarioref,{"usuario":codigoDoctor, "isadmin":false, "isadminprincipal":false, "iscliente":false, "isdoctor":true, "isgerente":false});

    return await batch.commit();
  }

  async registrarClienteImagen(nombres:string, apellidos:string, email:string, dni:string, telefono:string, codigo:string, fecha_nacimiento:string){
    var batch=this.db.firestore.batch();
    let clienteref=this.db.collection('Clientes').doc(codigo).ref;
    batch.set(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono, "tipo":"adulto", "fecha_nacimiento":fecha_nacimiento})
    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.update(usuarioref,{"iscliente":true});

    //creamos en clientes_letras
    var letra=nombres.charAt(0).toLowerCase();
    let clienteletraref=this.db.collection('Clientes_Letra').doc(letra).collection('Clientes').doc(codigo).ref;
    batch.set(clienteletraref,{"usuario":codigo})

    return await batch.commit();
  }

  async registrarClienteSinTelefono(nombres:string, apellidos:string, email:string, dni:string, telefono:string, tipo:string, fecha_nacimiento:string){
    var batch=this.db.firestore.batch();

    let codigoCliente=this.db.createId();
    let clienteref=this.db.collection('Clientes').doc(codigoCliente).ref;
    batch.set(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono,"tipo":tipo,"fecha_nacimiento":fecha_nacimiento})

    //creamos en clientes_letras
    var letra=nombres.charAt(0).toLowerCase();
    let clienteletraref=this.db.collection('Clientes_Letra').doc(letra).collection('Clientes').doc(codigoCliente).ref;
    batch.set(clienteletraref,{"usuario":codigoCliente})
    await batch.commit();
    return codigoCliente;
  }

  async registrarClienteCompleto(nombres:string, apellidos:string, email:string, dni:string, telefono:string,tipo:string, fecha_nacimiento:string){
    var batch=this.db.firestore.batch();

    let codigoCliente=this.db.createId();
    let clienteref=this.db.collection('Clientes').doc(codigoCliente).ref;
    batch.set(clienteref,{"nombres":nombres,"apellidos":apellidos,"email":email,"dni":dni,"telefono":telefono,"tipo":tipo,"fecha_nacimiento":fecha_nacimiento});

    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.set(usuarioref,{"usuario":codigoCliente, "isadmin":false, "isadminprincipal":false, "iscliente":true, "isdoctor":false, "isgerente":false});

    //creamos en clientes_letras
    var letra=nombres.charAt(0).toLowerCase();
    let clienteletraref=this.db.collection('Clientes_Letra').doc(letra).collection('Clientes').doc(codigoCliente).ref;
    batch.set(clienteletraref,{"usuario":codigoCliente})
    await batch.commit();

    return codigoCliente;
  }

  async crearCuentaCliente(telefono:string, codigo:string){
    var batch=this.db.firestore.batch();

    let clienteref=this.db.collection('Clientes').doc(codigo).ref;
    batch.update(clienteref,{"telefono":telefono});

    let usuarioref=this.db.collection('Telefonos_Usuarios').doc(telefono).ref;
    batch.set(usuarioref,{"usuario":codigo, "isadmin":false, "isadminprincipal":false, "iscliente":true, "isdoctor":false, "isgerente":false});
    return batch.commit();
  }

  registrarPlacaNuevo(cliente:string, nombreCliente:string, doctor:string, nombreDoctor:string, sucursal:string, monto:number, descuento:number, puntosUsados:number, motivoDescuento:string, puntosVenta:number, nombreSucursal:string, efectivo:number, tarjeta:number, tipoRecibo:string, nroRecibo:string, nombresServicios:string, tipoCliente:string, administrador:string):Promise<any>{
    let fecha_actual=moment().format('YYYY-MM-DD');
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    let fecha_completa=moment().format('YYYY-MM-DD, h:mm:ss a');
    const clientesPlacasReference = this.db.collection("Clientes_Placas").doc(cliente);
    const doctorPlacasReference = this.db.collection("Doctor_Placas").doc(doctor);
    const sucursalTotalReference = this.db.collection("Ventas_Mensuales").doc(sucursal);
    const sucursalAnualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual);
    const sucursalMensualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual);
    const doctoresReference = this.db.collection("Doctores").doc(doctor);

    var batch=this.db.firestore.batch();
    let codigoPlaca=this.db.createId();
    let placasref=this.db.collection('Placas').doc(codigoPlaca).ref;
    batch.set(placasref,{"fecha":fecha_completa, "monto":monto, "cliente":cliente, "doctor":doctor, "sucursal":sucursal, "nombre_doctor":nombreDoctor, "nombre_cliente":nombreCliente, "descuento":descuento, "puntos_usados":puntosUsados, "motivo_descuento":motivoDescuento, "puntos_ganados":puntosVenta, "nombre_sucursal":nombreSucursal, "duplicado":false, "monto_efectivo":efectivo, "monto_tarjeta":tarjeta, "tipo_recibo":tipoRecibo, "nro_recibo":nroRecibo, "nombres_servicios":nombresServicios, "primer_pago_efectivo":efectivo, "primer_pago_tarjeta":tarjeta, "tipo_cliente":tipoCliente, "imagenes":false, "administrador":administrador})

    //let codigoClientePlaca=this.db.createId();
    let clientePlacasref=this.db.collection('Clientes_Placas').doc(cliente).collection("Placas").doc(codigoPlaca).ref;
    batch.set(clientePlacasref,{"placa":codigoPlaca, "fecha":fecha_actual})

    //let codigoDoctorPlaca=this.db.createId();
    let doctorPlacasref=this.db.collection('Doctor_Placas').doc(doctor).collection("Placas").doc(codigoPlaca).ref;
    batch.set(doctorPlacasref,{"placa":codigoPlaca, "fecha":fecha_actual})

    //let codigoMensualPlaca=this.db.createId();
    let codigoMensualPlacaref=this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Placas").doc(codigoPlaca).ref;
    batch.set(codigoMensualPlacaref,{"placa":codigoPlaca});

    //let codigoDiarioPlaca=this.db.createId();
    let codigoDiarioPlacaref=this.db.collection("Ventas_Diarias").doc(sucursal).collection("Placas").doc(fecha_actual).collection("Placas").doc(codigoPlaca).ref;
    batch.set(codigoDiarioPlacaref,{"placa":codigoPlaca});

    //creamos el historial de pago
    let codigoHistorial=this.db.createId();
    let historialPlacaref=this.db.collection('Placas').doc(codigoPlaca).collection('Pagos').doc(codigoHistorial).ref;
    batch.set(historialPlacaref,{"efectivo":efectivo, "tarjeta":tarjeta, "fecha":fecha_completa, "codigo":codigoHistorial})

    return firebase.firestore().runTransaction(t => {
      return t.get(clientesPlacasReference.ref).then(doc => {
        if (!doc.exists){
          t.set(clientesPlacasReference.ref, {nro_placas:1})
        }
        else{
          const newValue = doc.data().nro_placas + 1;
          t.update(clientesPlacasReference.ref, {nro_placas: newValue});
        }
      });
    }).then(res => {
      console.log('Transaction client completed!')
      return firebase.firestore().runTransaction(td=>{
        return td.get(doctorPlacasReference.ref).then(docDoctor=>{
          if (!docDoctor.exists){
            td.set(doctorPlacasReference.ref, {nro_placas:1})
          }else{
            const newValue = docDoctor.data().nro_placas + 1;
            td.update(doctorPlacasReference.ref, {nro_placas: newValue});
          }
        })
      }).then(res=>{
        console.log('Transaction doctor completed!')
        return firebase.firestore().runTransaction(tvmt=>{
          return tvmt.get(sucursalTotalReference.ref).then(docVmt=>{
            if (!docVmt.exists){
              tvmt.set(sucursalTotalReference.ref, {ventas_totales:1,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:descuento})
            }else{
              const newValue = docVmt.data().ventas_totales + 1;
              const newValue2 = docVmt.data().monto_total_efectivo + efectivo;
              const newValue3 = docVmt.data().monto_total_tarjeta + tarjeta;
              const newValue4 = docVmt.data().descuento_total + descuento;
              tvmt.update(sucursalTotalReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4});
            }
          })
        }).then(res=>{
          console.log('Transaction ventas totales completed!')
          return firebase.firestore().runTransaction(tvma=>{
            return tvma.get(sucursalAnualReference.ref).then(docVma=>{
              if (!docVma.exists){
                tvma.set(sucursalAnualReference.ref, {ventas_totales:1,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:descuento, canje_total:puntosUsados})
              }else{
                const newValue = docVma.data().ventas_totales + 1;
                const newValue2 = docVma.data().monto_total_efectivo + efectivo;
                const newValue3 = docVma.data().monto_total_tarjeta + tarjeta;
                const newValue4 = docVma.data().descuento_total + descuento;
                const newValue5 = docVma.data().canje_total + puntosUsados;
                tvma.update(sucursalAnualReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4, canje_total:newValue5});
              }
            })
          }).then(res=>{
            console.log('Transaction ventas anuales completed!')
            return firebase.firestore().runTransaction(tvmm=>{
              return tvmm.get(sucursalMensualReference.ref).then(docVmm=>{
                if (!docVmm.exists){
                  tvmm.set(sucursalMensualReference.ref, {ventas_totales:1,monto_total_efectivo:efectivo, monto_total_tarjeta:tarjeta, descuento_total:descuento, canje_total:puntosUsados})
                }else{
                  const newValue = docVmm.data().ventas_totales + 1;
                  const newValue2 = docVmm.data().monto_total_efectivo + efectivo;
                  const newValue3 = docVmm.data().monto_total_tarjeta + tarjeta;
                  const newValue4 = docVmm.data().descuento_total + descuento;
                  const newValue5 = docVmm.data().canje_total + puntosUsados;
                  tvmm.update(sucursalMensualReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4, canje_total:newValue5});
                }
              })
            }).then(async res=>{
              console.log('Transaction ventas mensuales completed!')
              if (puntosUsados>0){
                return firebase.firestore().runTransaction(tdr=>{
                  return tdr.get(doctoresReference.ref).then(docDr=>{
                    if (!docDr.exists){
                      tdr.set(doctoresReference.ref, {puntaje:0})
                    }else{
                      const newValue = docDr.data().puntaje - puntosUsados;
                      tdr.update(doctoresReference.ref, {puntaje: newValue});
                    }
                  })
                }).then(async res=>{
                  console.log('Transaction puntaje doctor completed!')
                  await batch.commit();
                  return codigoPlaca;
                })
              }else{
                if (monto<=tarjeta+efectivo){
                  return firebase.firestore().runTransaction(tdr=>{
                    return tdr.get(doctoresReference.ref).then(docDr=>{
                      if (!docDr.exists){
                        tdr.set(doctoresReference.ref, {puntaje:puntosVenta})
                      }else{
                        const newValue = docDr.data().puntaje + puntosVenta;
                        tdr.update(doctoresReference.ref, {puntaje: newValue});
                      }
                    })
                  }).then(async res=>{
                    console.log('Transaction puntaje doctor completed!')
                    await batch.commit();
                    return codigoPlaca;
                  })
                }else{
                  await batch.commit();
                  return codigoPlaca;
                }
              }
            })
          })
        })
      })
    }, err => console.error(err));
  }

  registrarServicioPlacaNuevo(placa:string, servicio:string, imagenes:string, monto: number, sucursal:string, descuentoParcial:number, cantidad:number){
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    const sucursalAnualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Servicios").doc(servicio);
    const sucursalMensualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Servicios").doc(servicio);

    var batch=this.db.firestore.batch();
    //let codigoServicioPlaca=this.db.createId();
    let placaServicioref=this.db.collection('Placas').doc(placa).collection("Servicios").doc(servicio).ref;
    batch.set(placaServicioref,{"servicio":servicio, "imagenes":imagenes, "cantidad":cantidad, "descuento":descuentoParcial*cantidad, "monto":monto*cantidad})

    return firebase.firestore().runTransaction(t=>{
      return t.get(sucursalAnualServiciosReference.ref).then(doc=>{
        if (!doc.exists){
          t.set(sucursalAnualServiciosReference.ref, {ventas_totales:cantidad, monto_total:monto*cantidad, descuento_total:descuentoParcial*cantidad,duplicados_totales:0, monto_duplicados:0})
        }else{
          const newValue = doc.data().ventas_totales + cantidad;
          const newValue2 = doc.data().monto_total + (monto*cantidad);
          const newValue3 = doc.data().descuento_total + (descuentoParcial*cantidad);
          t.update(sucursalAnualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total: newValue3});
        }
      })
    }).then(res=>{
      console.log('Transaction servicios anual completado!')
      return firebase.firestore().runTransaction(t=>{
        return t.get(sucursalMensualServiciosReference.ref).then(doc=>{
          if (!doc.exists){
            t.set(sucursalMensualServiciosReference.ref, {ventas_totales:cantidad, monto_total:monto*cantidad , descuento_total:descuentoParcial*cantidad, duplicados_totales:0, monto_duplicados:0})
          }else{
            const newValue = doc.data().ventas_totales + cantidad;
            const newValue2 = doc.data().monto_total + (monto*cantidad);
            const newValue3 = doc.data().descuento_total + (descuentoParcial*cantidad);
            t.update(sucursalMensualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total: newValue3});
          }
        })
      }).then(async res=>{
        console.log('Transaction servicios mensual completado!')
        //traemos los insumos del servicio correspondiente
        let insumos= await this.getInsumosServicio(servicio);
        if (insumos && insumos.length>0){
          insumos.forEach(element=>{
            //generamos ruta
            const sucursalInsumosReference = this.db.collection("Sucursales").doc(sucursal).collection("Insumos").doc(element.insumo);
            firebase.firestore().runTransaction(t=>{
              return t.get(sucursalInsumosReference.ref).then(doc=>{
                if (!doc.exists){
                  t.set(sucursalInsumosReference.ref, {stock:0})
                }else{
                  const newValue = doc.data().stock - (cantidad*element.cantidad);
                  t.update(sucursalInsumosReference.ref, {stock: newValue});
                }
              })
            })
          })
        }
        await batch.commit();
        return sucursal;
      })
    })
  }

  registrarDuplicadoPlaca(cliente:string, nombreCliente:string, doctor:string, nombreDoctor:string, sucursal:string, monto:number, descuento:number, puntosUsados:number, motivoDescuento:string, puntosVenta:number, nombreSucursal:string, servicio:string, imagenes:string):Promise<any>{
    let fecha_actual=moment().format('YYYY-MM-DD');
    let anio_actual=moment().format('YYYY');
    let mes_actual=moment().format('MM');
    let fecha_completa=moment().format('YYYY-MM-DD, h:mm:ss a');
    const clientesPlacasReference = this.db.collection("Clientes_Placas").doc(cliente);
    const sucursalTotalReference = this.db.collection("Ventas_Mensuales").doc(sucursal);
    const sucursalAnualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual);
    const sucursalMensualReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual);

    const sucursalAnualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Servicios").doc(servicio);
    const sucursalMensualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Servicios").doc(servicio);

    var batch=this.db.firestore.batch();
    let codigoPlaca=this.db.createId();
    let placasref=this.db.collection('Placas').doc(codigoPlaca).ref;
    batch.set(placasref,{"fecha":fecha_completa, "monto":monto, "cliente":cliente, "doctor":doctor, "sucursal":sucursal, "nombre_doctor":nombreDoctor, "nombre_cliente":nombreCliente, "descuento":descuento, "puntos_usados":puntosUsados, "motivo_descuento":motivoDescuento, "puntos_ganados":puntosVenta, "nombre_sucursal":nombreSucursal, "duplicado":true})

    let codigoClientePlaca=this.db.createId();
    let clientePlacasref=this.db.collection('Clientes_Placas').doc(cliente).collection("Placas").doc(codigoClientePlaca).ref;
    batch.set(clientePlacasref,{"placa":codigoPlaca, "fecha":fecha_actual})

    let codigoMensualPlaca=this.db.createId();
    let codigoMensualPlacaref=this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Placas").doc(codigoMensualPlaca).ref;
    batch.set(codigoMensualPlacaref,{"placa":codigoPlaca});

    let codigoServicioPlaca=this.db.createId();
    let placaServicioref=this.db.collection('Placas').doc(codigoPlaca).collection("Servicios").doc(codigoServicioPlaca).ref;
    batch.set(placaServicioref,{"servicio":servicio, "imagenes":imagenes})

    let codigoDiarioPlaca=this.db.createId();
    let codigoDiarioPlacaref=this.db.collection("Ventas_Diarias").doc(sucursal).collection("Placas").doc(fecha_actual).collection("Placas").doc(codigoDiarioPlaca).ref;
    batch.set(codigoDiarioPlacaref,{"placa":codigoPlaca});

    return firebase.firestore().runTransaction(t => {
      return t.get(clientesPlacasReference.ref).then(doc => {
        if (!doc.exists){
          t.set(clientesPlacasReference.ref, {nro_placas:1})
        }
        else{
          const newValue = doc.data().nro_placas + 1;
          t.update(clientesPlacasReference.ref, {nro_placas: newValue});
        }
      });
    }).then(res=>{
      console.log('Transaction cliente completed!')
      return firebase.firestore().runTransaction(tvmt=>{
        return tvmt.get(sucursalTotalReference.ref).then(docVmt=>{
          if (!docVmt.exists){
            tvmt.set(sucursalTotalReference.ref, {ventas_totales:1,monto_total:monto,descuento_total:descuento})
          }else{
            const newValue = docVmt.data().ventas_totales + 1;
            const newValue2 = docVmt.data().monto_total + monto;
            tvmt.update(sucursalTotalReference.ref, {ventas_totales: newValue, monto_total: newValue2});
          }
        })
      }).then(res=>{
        console.log('Transaction ventas totales completed!')
        return firebase.firestore().runTransaction(tvma=>{
          return tvma.get(sucursalAnualReference.ref).then(docVma=>{
            if (!docVma.exists){
              tvma.set(sucursalAnualReference.ref, {ventas_totales:1, monto_total:monto, descuento_total:descuento, canje_total:puntosUsados})
            }else{
              const newValue = docVma.data().ventas_totales + 1;
              const newValue2 = docVma.data().monto_total + monto;
              tvma.update(sucursalAnualReference.ref, {ventas_totales: newValue, monto_total: newValue2});
            }
          })
        }).then(res=>{
          console.log('Transaction ventas anuales completed!')
          return firebase.firestore().runTransaction(tvmm=>{
            return tvmm.get(sucursalMensualReference.ref).then(docVmm=>{
              if (!docVmm.exists){
                tvmm.set(sucursalMensualReference.ref, {ventas_totales:1, monto_total:monto, descuento_total:descuento, canje_total:puntosUsados})
              }else{
                const newValue = docVmm.data().ventas_totales + 1;
                const newValue2 = docVmm.data().monto_total + monto;
                tvmm.update(sucursalMensualReference.ref, {ventas_totales: newValue, monto_total: newValue2});
              }
            })
          }).then(res=>{
            console.log('Transaction ventas mensuales completed!')
            return firebase.firestore().runTransaction(t=>{
              return t.get(sucursalAnualServiciosReference.ref).then(doc=>{
                if (!doc.exists){
                  t.set(sucursalAnualServiciosReference.ref, {ventas_totales:0, monto_total:0, duplicados_totales:1, monto_duplicados:monto, descuento_total:0})
                }else{
                  const newValue = doc.data().duplicados_totales + 1;
                  const newValue2 = doc.data().monto_duplicados + monto;
                  t.update(sucursalAnualServiciosReference.ref, {duplicados_totales: newValue, monto_duplicados: newValue2});
                }
              })
            }).then(res=>{
              console.log('Transaction servicio total complete!')
              return firebase.firestore().runTransaction(t=>{
                return t.get(sucursalMensualServiciosReference.ref).then(doc=>{
                  if (!doc.exists){
                    t.set(sucursalMensualServiciosReference.ref, {ventas_totales:0, monto_total:0, duplicados_totales:1, monto_duplicados:monto, descuento_total:0})
                  }else{
                    const newValue = doc.data().duplicados_totales + 1;
                    const newValue2 = doc.data().monto_duplicados + monto;
                    t.update(sucursalMensualServiciosReference.ref, {duplicados_totales: newValue, monto_duplicados: newValue2});
                  }
                })
              }).then(async res=>{
                await batch.commit();
                return codigoPlaca;
              })
            })
          })
        })
      })
    }, err => console.error(err));
  }

  registrarImagenPlaca(placa:string, servicio:string, ruta:string){
    const servicioPlacaReference = this.db.collection("Placas").doc(placa).collection('Servicios').doc(servicio);
    var batch=this.db.firestore.batch();
    let placasref=this.db.collection('Placas').doc(placa).ref;
    batch.update(placasref,{"imagenes":true})
    return firebase.firestore().runTransaction(t => {
      return t.get(servicioPlacaReference.ref).then(doc => {

          const newValue = doc.data().imagenes + ruta +'|';
          t.update(servicioPlacaReference.ref, {imagenes: newValue});

      });
    }).then(async res=>{
      await batch.commit();
      return ruta;
    });
  }

  deletePlaca(placa):Promise<any>{
    //tremos los datos de la placa
    return this.getPlacaEstatic(placa).then(data=>{
      let fecha_actual=moment(data.fecha).format('YYYY-MM-DD');
      let anio_actual=moment(data.fecha).format('YYYY');
      let mes_actual=moment(data.fecha).format('MM');

      const clientesPlacasReference = this.db.collection("Clientes_Placas").doc(data.cliente);
      const doctorPlacasReference = this.db.collection("Doctor_Placas").doc(data.doctor);
      const sucursalTotalReference = this.db.collection("Ventas_Mensuales").doc(data.sucursal);
      const sucursalAnualReference = this.db.collection("Ventas_Mensuales").doc(data.sucursal).collection("Anios").doc(anio_actual);
      const sucursalMensualReference = this.db.collection("Ventas_Mensuales").doc(data.sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual);
      const doctoresReference = this.db.collection("Doctores").doc(data.doctor);

      var batch=this.db.firestore.batch();

      //eliminamos los servicios de la placa
      this.getServiciosPagosPlacaEstatic(placa).then(servicios=>{
        servicios.forEach(element => {
          this.deleteServicioPlacaNuevo(element.servicio, element.cantidad, element.descuento, element.monto, data.fecha, data.sucursal, placa);
        });
      })

      //eliminamos el registro placa
      let placasref=this.db.collection('Placas').doc(placa).ref;
      batch.delete(placasref);

      //eliminamos la placa del cliente
      let clientePlacasref=this.db.collection('Clientes_Placas').doc(data.cliente).collection("Placas").doc(placa).ref;
      batch.delete(clientePlacasref);

      //eliminamos la placa del doctor
      let doctorPlacasref=this.db.collection('Doctor_Placas').doc(data.doctor).collection("Placas").doc(placa).ref;
      batch.delete(doctorPlacasref);

      //eliminamos la venta de las ventas mensuales
      let codigoMensualPlacaref=this.db.collection("Ventas_Mensuales").doc(data.sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Placas").doc(placa).ref;
      batch.delete(codigoMensualPlacaref);

      //eliminamos la venta de las ventas diarias
      let codigoDiarioPlacaref=this.db.collection("Ventas_Diarias").doc(data.sucursal).collection("Placas").doc(fecha_actual).collection("Placas").doc(placa).ref;
      batch.delete(codigoDiarioPlacaref);

      //eliminamos el historial de pago
      let quitar_efectivo=0;
      let quitar_tarjeta=0;
      this.getHistorialPagosPlacaEstatic(placa).then(historial=>{
        historial.forEach(element => {
          quitar_efectivo+=element.efectivo;
          quitar_tarjeta+=element.tarjeta;
          let codigoHistorial=this.db.collection("Placas").doc(placa).collection("Pagos").doc(element.codigo).ref;
          batch.delete(codigoHistorial);
        });
      })

      //ejecutamos las transacciones
      return firebase.firestore().runTransaction(t => {
        return t.get(clientesPlacasReference.ref).then(doc => {
          if (!doc.exists){
            t.set(clientesPlacasReference.ref, {nro_placas:0})
          }
          else{
            const newValue = doc.data().nro_placas - 1;
            t.update(clientesPlacasReference.ref, {nro_placas: newValue});
          }
        });
      }).then(res => {
        console.log('Transaction client completed!')
        return firebase.firestore().runTransaction(td=>{
          return td.get(doctorPlacasReference.ref).then(docDoctor=>{
            if (!docDoctor.exists){
              td.set(doctorPlacasReference.ref, {nro_placas:0})
            }else{
              const newValue = docDoctor.data().nro_placas - 1;
              td.update(doctorPlacasReference.ref, {nro_placas: newValue});
            }
          })
        }).then(res=>{
          console.log('Transaction doctor completed!')
          return firebase.firestore().runTransaction(tvmt=>{
            return tvmt.get(sucursalTotalReference.ref).then(docVmt=>{
              if (!docVmt.exists){
                tvmt.set(sucursalTotalReference.ref, {ventas_totales:0,monto_total_efectivo:0, monto_total_tarjeta:0, descuento_total:0})
              }else{
                const newValue = docVmt.data().ventas_totales - 1;
                const newValue2 = docVmt.data().monto_total_efectivo - quitar_efectivo;
                const newValue3 = docVmt.data().monto_total_tarjeta - quitar_tarjeta;
                const newValue4 = docVmt.data().descuento_total - data.descuento;
                tvmt.update(sucursalTotalReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4});
              }
            })
          }).then(res=>{
            console.log('Transaction ventas totales completed!')
            return firebase.firestore().runTransaction(tvma=>{
              return tvma.get(sucursalAnualReference.ref).then(docVma=>{
                if (!docVma.exists){
                  tvma.set(sucursalAnualReference.ref, {ventas_totales:0,monto_total_efectivo:0, monto_total_tarjeta:0, descuento_total:0, canje_total:0})
                }else{
                  const newValue = docVma.data().ventas_totales - 1;
                  const newValue2 = docVma.data().monto_total_efectivo - quitar_efectivo;
                  const newValue3 = docVma.data().monto_total_tarjeta - quitar_tarjeta;
                  const newValue4 = docVma.data().descuento_total - data.descuento;
                  const newValue5 = docVma.data().canje_total - data.puntos_usados;
                  tvma.update(sucursalAnualReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4, canje_total:newValue5});
                }
              })
            }).then(res=>{
              console.log('Transaction ventas anuales completed!')
              return firebase.firestore().runTransaction(tvmm=>{
                return tvmm.get(sucursalMensualReference.ref).then(docVmm=>{
                  if (!docVmm.exists){
                    tvmm.set(sucursalMensualReference.ref, {ventas_totales:0,monto_total_efectivo:0, monto_total_tarjeta:0, descuento_total:0, canje_total:0})
                  }else{
                    const newValue = docVmm.data().ventas_totales - 1;
                    const newValue2 = docVmm.data().monto_total_efectivo - quitar_efectivo;
                    const newValue3 = docVmm.data().monto_total_tarjeta - quitar_tarjeta;
                    const newValue4 = docVmm.data().descuento_total - data.descuento;
                    const newValue5 = docVmm.data().canje_total - data.puntos_usados;
                    tvmm.update(sucursalMensualReference.ref, {ventas_totales: newValue, monto_total_efectivo: newValue2, monto_total_tarjeta:newValue3, descuento_total:newValue4, canje_total:newValue5});
                  }
                })
              }).then(async res=>{
                console.log('Transaction ventas mensuales completed!')
                if (data.puntos_usados>0){
                  return firebase.firestore().runTransaction(tdr=>{
                    return tdr.get(doctoresReference.ref).then(docDr=>{
                      if (!docDr.exists){
                        tdr.set(doctoresReference.ref, {puntaje:0})
                      }else{
                        const newValue = docDr.data().puntaje + data.puntos_usados;
                        tdr.update(doctoresReference.ref, {puntaje: newValue});
                      }
                    })
                  }).then(async res=>{
                    console.log('Transaction puntaje doctor completed!')
                    await batch.commit();
                    return placa;
                  })
                }else{
                  if (data.monto<=quitar_tarjeta+quitar_tarjeta){
                    return firebase.firestore().runTransaction(tdr=>{
                      return tdr.get(doctoresReference.ref).then(docDr=>{
                        if (!docDr.exists){
                          tdr.set(doctoresReference.ref, {puntaje:0})
                        }else{
                          const newValue = docDr.data().puntaje - data.puntos_ganados;
                          tdr.update(doctoresReference.ref, {puntaje: newValue});
                        }
                      })
                    }).then(async res=>{
                      console.log('Transaction puntaje doctor completed!')
                      await batch.commit();
                      return placa;
                    })
                  }else{
                    await batch.commit();
                    return placa;
                  }
                }
              })
            })
          })
        })
      }, err => console.error(err));
    })
  }

  deleteServicioPlacaNuevo(servicio, cantidad, descuento, monto, fecha, sucursal, placa):Promise<any>{

    let anio_actual=moment(fecha).format('YYYY');
    let mes_actual=moment(fecha).format('MM');

    const sucursalAnualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Servicios").doc(servicio);
    const sucursalMensualServiciosReference = this.db.collection("Ventas_Mensuales").doc(sucursal).collection("Anios").doc(anio_actual).collection("Meses").doc(mes_actual).collection("Servicios").doc(servicio);

    //eliminamos el servicio de la placa
    var batch=this.db.firestore.batch();
    let placaServicioref=this.db.collection('Placas').doc(placa).collection("Servicios").doc(servicio).ref;
    batch.delete(placaServicioref);

    //ejecutamos todas las transacciones
    return firebase.firestore().runTransaction(t=>{
      return t.get(sucursalAnualServiciosReference.ref).then(doc=>{
        if (!doc.exists){
          t.set(sucursalAnualServiciosReference.ref, {ventas_totales:0, monto_total:0, descuento_total:0,duplicados_totales:0, monto_duplicados:0})
        }else{
          const newValue = doc.data().ventas_totales - cantidad;
          const newValue2 = doc.data().monto_total - monto
          const newValue3 = doc.data().descuento_total - descuento;
          t.update(sucursalAnualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total: newValue3});
        }
      })
    }).then(res=>{
      console.log('Transaction servicios anual completado!')
      return firebase.firestore().runTransaction(t=>{
        return t.get(sucursalMensualServiciosReference.ref).then(doc=>{
          if (!doc.exists){
            t.set(sucursalMensualServiciosReference.ref, {ventas_totales:0, monto_total:0 , descuento_total:0, duplicados_totales:0, monto_duplicados:0});
          }else{
            const newValue = doc.data().ventas_totales - cantidad;
            const newValue2 = doc.data().monto_total - monto;
            const newValue3 = doc.data().descuento_total - descuento;
            t.update(sucursalMensualServiciosReference.ref, {ventas_totales: newValue, monto_total: newValue2, descuento_total: newValue3});
          }
        })
      }).then(async res=>{
        console.log('Transaction servicios mensual completado!')
        await batch.commit();
        return sucursal;
      })
    })

  }

  async enviarNotificaciones(placa:string){
    let datos_placa=await this.getPlacaEstatic(placa);
    //console.log(datos_placa);
    let datos_doctor=await this.getDoctor(datos_placa.doctor);
    let datos_cliente=await this.getCliente(datos_placa.cliente);
    let url = "https://api.ceradentperu.com/api/send-notification-ceradent";
    //let telefono_doctor:any="";
    //let telefono_cliente:any="";
    if (datos_doctor.telefono!=undefined && datos_doctor.telefono!=""){
      //telefono_doctor=await this.existeTelefonoRegistrado(datos_doctor.telefono);
      let data_doctor = {
        titulo: 'Nueva placa registrada',
        detalle: 'Nueva placa - Paciente: '+datos_cliente.nombres+' '+datos_cliente.apellidos+' - '+datos_placa.nombres_servicios,
        destino: 'doctores',
        mode: 'tags',
        clave: 'placa',
        tokens: datos_placa.doctor
      };
      return this.http.post (url, data_doctor).subscribe(async rpta=>{
        console.log(rpta);
        if (datos_cliente.telefono!=undefined && datos_cliente.telefono!=""){
          //telefono_cliente=await this.existeTelefonoRegistrado(datos_cliente.telefono);
          let data_cliente = {
            titulo: 'Nueva placa registrada',
            detalle: 'Nueva placa - Doctor: '+datos_doctor.nombres+' '+datos_doctor.apellidos+' - '+datos_placa.nombres_servicios,
            destino: 'clientes',
            mode: 'tags',
            clave: 'placa',
            tokens: datos_placa.cliente
          };
          return this.http.post (url, data_cliente).subscribe(rpta2=>{
            console.log('Notificaciones enviadas a ambos');
            return 1;
          });
        }else {
          console.log('Notificaciones enviadas solo al doctor');
          return 1;
        }
      })
    }else{
      if (datos_cliente.telefono!=undefined && datos_cliente.telefono!=""){
        //telefono_cliente=await this.existeTelefonoRegistrado(datos_cliente.telefono);
        let data_cliente = {
          titulo: 'Nueva placa registrada',
          detalle: 'Nueva placa - Doctor: '+datos_doctor.nombres+' '+datos_doctor.apellidos+' - '+datos_placa.nombres_servicios,
          destino: 'clientes',
          mode: 'tags',
          clave: 'placa',
          tokens: datos_placa.cliente
        };
        return this.http.post (url, data_cliente).subscribe(rpta2=>{
          console.log('Notificaciones enviadas solo usuario');
          return 1;
        });
      }else {
        console.log('No se envio notitificaciones a ninguno');
        return 0;
      }
    }

  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }

  async eliminar_doctor (doctor_id: string, telefono: string) {
    let batch = this.db.firestore.batch ();

    batch.delete (this.db.collection ('Doctores').doc (doctor_id).ref);
    batch.delete (this.db.collection ('Doctor_Placas').doc (doctor_id).ref);
    batch.delete (this.db.collection ('Telefonos_Usuarios').doc (telefono).ref);

    return await batch.commit ();
  }

  add_servicio_categoria (data: any) {
    return this.db.collection ('Servicios_Categorias').doc (data.id).set (data);
  }

  delete_servicio_categoria (id: string) {
    return this.db.collection ('Servicios_Categorias').doc (id).delete ();
  }

  update_servicio_categoria (data: any) {
    return this.db.collection ('Servicios_Categorias').doc (data.id).update (data);
  }

  get_servicios_categorias () {
    return this.db.collection ('Servicios_Categorias').valueChanges ();
  }

  get_reservas () {
    const collection = this.db.collection("Doctor_Reservas");
    return collection.snapshotChanges().pipe(map(refReferencias=>{
      if (refReferencias.length>0){
        return refReferencias.map(refReferencia=>{
            const data:any = refReferencia.payload.doc.data();
            return this.getDoctorObservable(data.doctor_id).pipe(map(doctor=> Object.assign({},{...data, doctor})));
        })
      }
    })).mergeMap(observables =>{
      if (observables) return combineLatest(observables); else return of([]);
    })
  }

  delete_reserva (id: string) {
    return this.db.collection ('Doctor_Reservas').doc (id).delete ();
  }

  update_reserva (id: string, data: any) {
    return this.db.collection ('Doctor_Reservas').doc (id).update (data);
  }

  get_cliente_dni (dni: string) {
    return this.db.collection ('Clientes', ref => ref.where ('dni', '==', dni)).snapshotChanges().map (sucursales => {
      return sucursales.map(sucursal => {
        const data = sucursal.payload.doc.data() as any;
        const usuario = sucursal.payload.doc.id;
        return { usuario, ...data };
      });
    }).pipe(first ()).toPromise ();
  }

  get_ordenes_badge () {
    return this.db.collection ('Doctor_Reservas', ref => ref.where ('visto', '==', false)).valueChanges ();
  }
}
