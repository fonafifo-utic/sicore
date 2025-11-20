import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../prime-ng.module';

@Component({
  selector : 'encabezado',
  templateUrl : 'encabezado.html',
  styleUrl : 'encabezado.css',
  standalone : true,
  imports : [CommonModule, RouterModule, PrimeNgModule]
})
export class Encabezado implements OnInit {
  
  imghref:string="";
  private textologin:string="";
  ayudaOR:boolean=false;
  
  get _textologinlogout(){
    return this.textologin;
  }

  set _txtbtnloginlogout(val:string){
    this.textologin=val;
  }
  get userauth(){
    return this.servicio._isusuariologgued;
  }
  
  _displayhelp:boolean=false;
  constructor(private route:Router,private servicio:AuthService) { }

  ngOnInit(): void {
    // this.imghref=this.servicio.hrefimgs;
    // this.ayudaOR=this.servicio._ayudaOR
  }

  CambiarNombre(valor:boolean):string{
    
    if(valor== false){
      this.textologin="Ingresar";
    }
    else{
      this.textologin="Desconectar";
    }
    
     return this.textologin;
  }
  
    Logout(){
      var usazip:string|undefined|null=sessionStorage.getItem('zip');

      if(this.textologin==="Desconectar"){
        if(usazip==""||usazip==undefined || usazip==null){
          console.log(this.servicio._xInterval);
          clearInterval(this.servicio._xInterval);
          this.servicio.DoLogout();
          this.route.navigate(['../login'])
        }
        else{
          window.open(this.servicio.appUrl,"_self");
        }
        
      }
      
    }

    AbrirAyuda(){
      this._displayhelp=true;
    }

}