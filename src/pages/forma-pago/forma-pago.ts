import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-forma-pago',
  templateUrl: 'forma-pago.html',
})
export class FormaPagoPage implements OnInit {
formapagoForm: FormGroup; 
montoTotal:number;
montoPagado:number=0;
montoEfectivo:number=0;
montoTarjeta:number=0;
errorTarjeta:boolean=false;
errorEfectivo:boolean=false;
tipoBoleta:string="";
nroBoleta:string="";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController) {
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  ngOnInit(){
    if (this.navParams.get('monto')!=undefined){
      this.montoTotal=this.navParams.get('monto');
      if (this.navParams.get('tipo_boleta')!=undefined) this.tipoBoleta=this.navParams.get('tipo_boleta');
      if (this.navParams.get('nro_boleta')!=undefined) this.nroBoleta=this.navParams.get('nro_boleta');
      this.formapagoForm = new FormGroup({      
        'efectivo': new FormControl(0,[Validators.required,Validators.max(this.montoTotal)]),
        'tarjeta': new FormControl(0,[Validators.required,Validators.max(this.montoTotal)]),
        'tipo_recibo': new FormControl(this.tipoBoleta,[]),       
        'nro_recibo': new FormControl(this.nroBoleta,[]),
      })
    }
    else this.dismiss();
  }

  validarEfectivo(event){
    if (event.target.value!=""){
      this.montoEfectivo=Number(event.target.value);
      this.montoPagado=this.montoEfectivo+this.montoTarjeta;
      if (this.montoPagado>this.montoTotal)
      {      
      this.errorEfectivo=true;
      }else this.errorEfectivo=false;
    }
    else{
      this.montoEfectivo=0;
      this.montoPagado=this.montoEfectivo+this.montoTarjeta;
    }
  }

  validarTarjeta(event){
    if (event.target.value!=""){
      this.montoTarjeta=Number(event.target.value);
      this.montoPagado=this.montoEfectivo+this.montoTarjeta;
      if (this.montoPagado>this.montoTotal)
      {      
      this.errorTarjeta=true;
      }else this.errorTarjeta=false;
    }
    else{
      this.montoTarjeta=0;
      this.montoPagado=this.montoEfectivo+this.montoTarjeta;
    }
  }

  onSubmit(){
    const value=this.formapagoForm.value; 
    let datapago:any={
      "efectivo":value.efectivo,
      "tarjeta":value.tarjeta,
      "tipo_recibo":value.tipo_recibo,
      "nro_recibo":value.nro_recibo      
    }
    console.log(datapago);
    this.viewCtrl.dismiss(datapago);
  }

}
