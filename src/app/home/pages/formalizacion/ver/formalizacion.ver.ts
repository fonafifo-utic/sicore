import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { ActivatedRoute, Router } from "@angular/router";
import { FormalizacionServicio } from "../servicio/formalizacion.servicio";
import { iVerUnaFormalizacion } from "../interfaces/iFormalizacion";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { Observable } from "rxjs";

@Component({
    selector : 'ver-formalizacion',
    templateUrl : 'formalizacion.ver.html',
    styleUrl : 'formalizacion.ver.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerFormalizacion implements OnInit {

    _formalizacion$! : Observable<iVerUnaFormalizacion[]>;
    _formalizacion! : iVerUnaFormalizacion;

    _idFormalizacion! : string;
    _muestraObservaciones : boolean = false;
    _paraVerLasObservaciones : boolean = false;

    private hoy : Date = new Date();
    _anno : string = this.hoy.getFullYear().toString();

    _totalFactura : number = 0;

    constructor(private route : ActivatedRoute, private router : Router, private srv : FormalizacionServicio, private ref : ChangeDetectorRef){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
                
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 3) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7) && (perfil !== 8) && (perfil !== 10)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this._idFormalizacion = this.route.snapshot.paramMap.get('id')!;
        this.traeFormalizacionElegida();
    }

    traeFormalizacionElegida(){
        this._formalizacion$ = this.srv.obtenerFormalizacionParaVistaPorId(this._idFormalizacion);
        
        this._formalizacion$.subscribe({
            next : (formalizaciones) => {
                formalizaciones.forEach(item => {
                    this._totalFactura += item.subTotal;
                })

                this._formalizacion = formalizaciones[0];
                this.colocaFormalizacion();

                if(this._formalizacion.indicadorEstado == 'Rechazada') this._paraVerLasObservaciones = true;
                
                this.ref.detectChanges();
            },
            error : (err) => console.error(err)
        })
    }

    colocaFormalizacion(){
        const consecutivo : number = this._formalizacion.consecutivo;

        (<HTMLSpanElement>document.getElementById('nombreCliente')).innerText = this._formalizacion.nombreCliente;
        (<HTMLSpanElement>document.getElementById('cedula')).innerText = this._formalizacion.cedulaCliente;
        (<HTMLSpanElement>document.getElementById('contacto')).innerText = this._formalizacion.contactoCliente;
        (<HTMLSpanElement>document.getElementById('email')).innerText = this._formalizacion.emailCliente;
        (<HTMLSpanElement>document.getElementById('contactoFinanciero')).innerText = this._formalizacion.contactoContador;
        (<HTMLSpanElement>document.getElementById('emailFinanciero')).innerText = this._formalizacion.emailContador;

        (<HTMLSpanElement>document.getElementById('anotaciones')).innerText = `${this._formalizacion.anotaciones}`;
    }

    colocaCerosAlNumeroEntero(numero: number): string {
        let numeroConFormato: string = '';
        switch (numero.toString().length) {
            case 1:
                numeroConFormato = '00' + numero.toString();
                break;
            case 2:
                numeroConFormato = '0' + numero.toString();
                break;
            case 3:
                numeroConFormato = numero.toString();
                break;
        }

        return numeroConFormato;
    }

    fecha () : string {
        const opciones : any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const [mes, dia, anno] = this._formalizacion.fechaHora.split(' ')[0].split('/');
        const hora : string = this._formalizacion.fechaHora.split(' ')[1];
        let nuevaCadenaFecha = `${mes}-${dia}-${anno}`
        const fecha : Date = new Date(nuevaCadenaFecha);
        
        nuevaCadenaFecha = fecha.toLocaleDateString('es-CR', opciones);

        return `${nuevaCadenaFecha}`;
    }

    hora() : string {
        return this._formalizacion.fechaHora.split(' ')[1];
    }

    irToFormalizaciones(){
        this.router.navigate(['formalizacion/listar']);
    }

    verObservaciones() {
        console.log(this._formalizacion)
        this._muestraObservaciones = true;
        const intervalo = setInterval(()=>{
            if(document.getElementById('observaciones')) {
                clearInterval(intervalo);

                (<HTMLTextAreaElement>document.getElementById('observaciones')).value = this._formalizacion.justificacionActivacion;
            }
        },300)
    }
}