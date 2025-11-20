import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { iPregunta, iPreguntas, iRespuestasTemporal, iTipo } from "../../interfaces/iEncuesta";
import Swal from "sweetalert2";
import { iLoginSalida } from "../../../../../auth/login/ilogin";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector : 'edita-pregunta',
    templateUrl : 'pregunta.editar.html',
    styleUrl : 'pregunta.editar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class EditarPregunta implements OnInit {
    
    private fb = inject(FormBuilder);
    formPreguntas : FormGroup = this.fb.group({
        pregunta : ['', Validators.required],
        tipo : ['', Validators.required]
    });

    _tipos$! : iTipo [];
    _respuestas : iRespuestasTemporal [] = [];
    _pregunta! : iPreguntas [];

    _muestraValor : boolean = false;
    _muestraTabla : boolean = false;
    _muestraRespuestas : boolean = false;

    pesoDelValor : number = 0;
    tipo! : string;

    _idPregunta : number = 0;

    constructor(private router : Router, private ref : ChangeDetectorRef, private srv : EncuestaServicio, private route : ActivatedRoute){}

    ngOnInit(): void {
        this._idPregunta = Number(this.route.snapshot.paramMap.get('id')!);
        this.traePregunta();

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

    traePregunta() {
        this.srv.traePreguntaPorId(this._idPregunta).subscribe({
            next : (pregunta) => {
                this._pregunta = pregunta;
                if(document.getElementById('pregunta')){
                    this.formPreguntas.controls['pregunta'].setValue(this._pregunta[0].pregunta);
                    this.formPreguntas.controls['tipo'].setValue(this._pregunta[0].tipo);
                    this.tipo = this._pregunta[0].tipo;

                    this.traeRespuestas();
                } 

            },
            error : (err) => console.error(err)
        })
    }

    traeRespuestas() {
        this.srv.traeRespuestasPorId(this._idPregunta).subscribe({
            next : (respuestas) => {
                if(this.tipo != 'Abierta') {
                    this._muestraRespuestas = true;
                    this._muestraTabla = true;
                    if(this.tipo == 'Escala') this._muestraValor = true;

                    respuestas.forEach(item => {
                        const respuesta : iRespuestasTemporal = {
                            respuesta : item.respuesta,
                            valorPeso : item.valorRespuesta
                        }

                        this._respuestas.push(respuesta);
                    });
                }

                this.ref.detectChanges();
            },
            error : (err) => console.log(err)
        })
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
            idPregunta : this._idPregunta
        }

        this.srv.actualizaUnaPregunta(pregunta).subscribe({
            next : (resultado) => {
                console.log(resultado)
                if(resultado.valor == '1') {
                    Swal.fire('SICORE','El registro se actualizó exitosamente','success').then(()=>{
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
        if(this.tipo == 'Escala') this.siEsEscala(indice);
        else this.siEsSeleccion(indice);
    }

    siEsEscala(indice : number) {
        Swal.fire({
            title: "Digite la nueva respuesta",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Cambiar"
          }).then((resultadoRespuesta) => {

            if (resultadoRespuesta.isConfirmed) {
                
                const nuevaRespuesta = resultadoRespuesta.value;

                Swal.fire({
                    title: "Digite el nuevo valor de la respuesta",
                    input: "text",
                    showCancelButton: true,
                    confirmButtonText: "Cambiar"
                  }).then((resultadoValor) => {
        
                    if (resultadoValor.isConfirmed) {                
                        this.aplicaCambioRespuestaEscala(indice, nuevaRespuesta, resultadoValor.value);
                    }
                });        
                
            }
        });
    }

    aplicaCambioRespuestaEscala(indice : number, nuevaRespuesta : string, nuevoValor : string) {
        const respuestas : iRespuestasTemporal [] = this._respuestas;
                let nuevaTablaRespuestas : iRespuestasTemporal [] = [];

                respuestas.forEach((item, index) => {
                    if(index != indice) {
                        nuevaTablaRespuestas.push(item);
                    } else {
                        const respuesta : iRespuestasTemporal = {
                            respuesta : nuevaRespuesta,
                            valorPeso : nuevoValor
                        }

                        nuevaTablaRespuestas.push(respuesta)
                    }
                })

                this._respuestas = [];
                this._respuestas = nuevaTablaRespuestas;

                this.ref.detectChanges();
    }

    siEsSeleccion(indice : number){
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