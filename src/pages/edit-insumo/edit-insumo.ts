import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, NavParams } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { FormControl, FormGroup, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-edit-insumo',
  templateUrl: 'edit-insumo.html',
})
export class EditInsumoPage implements OnInit {

  insumoForm: FormGroup;  
  public loading:Loading;
  codigoInsumo:string;
  operacion:string;
  path:string="Insumos";
  state: string;
  titulo:string;

  constructor(
    public navCtrl: NavController,
    public database: DatabaseProvider,
    public loadingCtrl: LoadingController,
    public navParams: NavParams
  ) {
  }

  ngOnInit(){
    if (this.navParams.get("operacion")!=undefined && this.navParams.get("operacion")!=null){
      this.operacion=this.navParams.get("operacion");
      this.inicializarFormulario();  
      if (this.navParams.get("insumo")!=undefined && this.navParams.get("insumo")!=null) {
        this.codigoInsumo=this.navParams.get("insumo");
        this.path=this.path+'/'+this.codigoInsumo;
        this.titulo="Editar Insumo";
      }else this.titulo="Registrar Insumo";
    }    
    else{
      this.navCtrl.setRoot("InsumosPage");
    }
    console.log(this.path)
  }

  inicializarFormulario(){
    this.insumoForm = new FormGroup({      
      'nombre': new FormControl("",[Validators.required])
      /*'stock': new FormControl(0,[Validators.required]),      
      'celular': new FormControl("",[Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
      'telefono': new FormControl("")*/
    })
  }

  changeHandler(e) {    
    this.state = e;
  }

}
