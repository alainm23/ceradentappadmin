import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-culminar-venta',
  templateUrl: 'culminar-venta.html',
})
export class CulminarVentaPage implements OnInit {
descuentoForm: FormGroup; 
puntajeDoctor:number;
puntajeVenta:number;
totalVenta:number;
descuento:number=0;
puntosCanjeados:number=0;
nuevoTotal:number;
errorDescuento=0;
errorCanje=0;
puntajeNuevo:number;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController) {
  }

  ngOnInit(){
    this.puntajeDoctor=this.navParams.get('puntajedoctor');
    this.puntajeVenta=this.navParams.get('puntosventa');
    this.totalVenta=this.navParams.get('total');
    this.nuevoTotal=this.totalVenta;
    this.puntajeNuevo=this.puntajeVenta;
    this.descuentoForm = new FormGroup({      
      'descuento': new FormControl(0,[Validators.required,Validators.max(this.totalVenta)]),
      'motivo_descuento': new FormControl(""),
      'puntos_usados': new FormControl(0,[Validators.required, Validators.max(this.puntajeDoctor)])       
    })    
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  validarDescuento(event){
    if (event.target.value!=""){
      this.descuento=Number(event.target.value);
      this.nuevoTotal=this.totalVenta-this.descuento-this.puntosCanjeados;
      if (this.totalVenta-this.descuento-this.puntosCanjeados>=0)
      {      
      this.errorDescuento=0;
      this.puntajeNuevo=Math.round((this.nuevoTotal*this.puntajeVenta)/this.totalVenta);
      }else this.errorDescuento=1;
      //validamos el nuevo puntaje
      
    }
    else{
      this.descuento=0;
      this.nuevoTotal=this.totalVenta-this.descuento-this.puntosCanjeados;
    }    
  }

  onSubmit(){
    const value=this.descuentoForm.value; 
    let data:any={
      "descuento":value.descuento,
      "puntos_usados":value.puntos_usados,
      "motivo_descuento":value.motivo_descuento,
      "nuevo_total":this.nuevoTotal,
      "nuevo_puntaje":this.puntajeNuevo      
    }
    this.viewCtrl.dismiss(data);
  }

  validarCanje(event){
    if (event.target.value!=""){
      this.puntosCanjeados=Number(event.target.value);
      this.nuevoTotal=this.totalVenta-this.descuento-this.puntosCanjeados;
      if (this.totalVenta-this.descuento-this.puntosCanjeados>=0)
      {      
      this.errorCanje=0;
      }else this.errorCanje=1;
    }else{
      this.puntosCanjeados=0;
      this.nuevoTotal=this.totalVenta-this.descuento-this.puntosCanjeados;
    }
  }

}
