import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { iPregunta, iRespuestasTemporal, iTipo } from "../../interfaces/iEncuesta";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { iLoginSalida } from "../../../../../auth/login/ilogin";

@Component({
    selector : 'agrega-pregunta',
    templateUrl : 'pregunta.agregar.html',
    styleUrl : 'pregunta.agregar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class AgregaPregunta implements OnInit {
    private fb = inject(FormBuilder);
    formPreguntas : FormGroup = this.fb.group({
        pregunta : ['', Validators.required],
        tipo : ['', Validators.required]
    });

    _tipos$! : iTipo [];
    _respuestas : iRespuestasTemporal [] = [];

    _muestraValor : boolean = false;
    _muestraTabla : boolean = false;
    _muestraRespuestas : boolean = false;

    pesoDelValor : number = 0;
    tipo! : string;
    
    constructor(private router : Router, private ref : ChangeDetectorRef, private srv : EncuestaServicio){}

    ngOnInit(): void {
        this._tipos$ = [
            {
                clave : 'S',
                tipo : 'Selección'
            },
            {
                clave : 'E',
                tipo : 'Escala'
            },
            {
                clave : 'A',
                tipo : 'Abierta'
            }
        ]
    }

    OnSubmit() {
        if (this.formPreguntas.invalid) {
            this.formPreguntas.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(!this.validaRespuestas()) {
            Swal.fire('SICORE', 'ATENCIÓN: Debe existir al menos una respuesta.', 'warning');
            return;
        }

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario = valorSesion.idUsuario;

        const pregunta : iPregunta = {
            pregunta : (<HTMLInputElement>document.getElementById('pregunta')).value,
            respuestas : this._respuestas,
            tipo : this.tipo,
            idFuncionario : idFuncionario,
            idPregunta : 0
        }

        this.srv.registraUnaPregunta(pregunta).subscribe({
            next : (resultado) => {
                if(resultado.valor == '1') {
                    Swal.fire('SICORE','El registro se guardó exitosamente','success').then(()=>{
                        this.router.navigate(['encuesta/preguntas/listar']);
                    });
                } else {
                    if(resultado.valor == '-1') Swal.fire('SICORE', resultado.descripcion,'warning');
                }
            },
            error : (err) => console.error(err)
        });
    }

    seleccionaTipo(evento : any) {
        switch(evento.target.value){
            case 'Selección':
                this.tipo = 'S';
                this._muestraRespuestas = true;
                this._muestraTabla = true;
                this._muestraValor = false;
                this._respuestas = [];
                break;

            case 'Escala':
                this.tipo = 'E';
                this._muestraRespuestas = true;
                this._muestraTabla = true;    
                this._muestraValor = true;
                this._respuestas = [];
                break;

            case 'Abierta':
                this.tipo = 'A';
                this._muestraRespuestas = false;
                this._muestraValor = false;
                this._muestraTabla = false;
                this._respuestas = [];
                break;
        }
    }

    campoEsValido(campo: string) {
        return this.formPreguntas.controls[campo].errors && this.formPreguntas.controls[campo].touched;
    }

    campoValidoRespuesta() : boolean {
        return false;
    }

    validaEspaciosBlancoAlInicio(expresion : any) : boolean {
        const caracterDigitado : string = expresion.key;
        const palabraEscrita : string = (<HTMLInputElement>document.getElementById(expresion.target.id)).value;
        const caracterInicial : string = palabraEscrita.substring(0,1);
        
        if(caracterInicial == caracterDigitado) {
            if(caracterDigitado == ' ') return false;
            else return true;
        }
        else return true;
    }

    validaRespuestas() : boolean {
        if(this.tipo == 'E' || this.tipo == 'S'){
            if(this._respuestas.length <= 0) return false;
        }

        return true;
    }

    agregaRespuestaTabla() {
        const valor : string = (<HTMLInputElement>document.getElementById('respuesta')).value;
        this.pesoDelValor += 1;
        let respuesta : iRespuestasTemporal = {
            respuesta : valor,
            valorPeso : this._muestraValor ? String(this.pesoDelValor) : ''
        }

        this._respuestas.push(respuesta);
        (<HTMLInputElement>document.getElementById('respuesta')).value = '';
    }

    borraRespuestaTabla(indice : number) {
        const respuestas : iRespuestasTemporal [] = this._respuestas;
        let nuevaTablaRespuestas : iRespuestasTemporal [] = [];
        respuestas.forEach((item, index) => {
            if(index != indice) {
                nuevaTablaRespuestas.push(item);
            }
        })

        this._respuestas = [];
        this._respuestas = nuevaTablaRespuestas;
    }

    editaRespuestaTabla(indice : number) {
        Swal.fire({
            title: "Digite la nueva respuesta",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Cambiar"
          }).then((resultado) => {
            if (resultado.isConfirmed) {
                const respuestas : iRespuestasTemporal [] = this._respuestas;
                let nuevaTablaRespuestas : iRespuestasTemporal [] = [];

                respuestas.forEach((item, index) => {
                    if(index != indice) {
                        nuevaTablaRespuestas.push(item);
                    } else {
                        const respuesta : iRespuestasTemporal = {
                            respuesta : resultado.value,
                            valorPeso : ''
                        }
                        nuevaTablaRespuestas.push(respuesta)
                    }
                })

                this._respuestas = [];
                this._respuestas = nuevaTablaRespuestas;

                this.ref.detectChanges();
            }
        });
    }

    salir() {
        this.router.navigate(['encuesta/preguntas/listar']);
    }
}