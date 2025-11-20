import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { RatingRateEvent } from "primeng/rating";
import { EncuestaServicio } from "../servicio/encuesta.servicio";
import { Router } from "@angular/router";
import { iRespuestasEncuesta, iRespuestasTipoAbierta, iRespuestasTipoRating, iRespuestasTipoSeleccion, iVistaEncuesta } from "../interfaces/iEncuesta";
import Swal from "sweetalert2";

@Component({
    selector : 'ver-encuesta',
    templateUrl : 'encuesta.ver.html',
    styleUrl : 'encuesta.ver.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class VerEncuesta implements OnInit {

    _preguntas : string [] = [];
    _encuesta : iVistaEncuesta [] = [];

    private respuestasRating : iRespuestasTipoRating [] = [];
    private respuestasSeleccion : iRespuestasTipoSeleccion [] = [];
    private respuestasAbierta : iRespuestasTipoAbierta [] = [];

    private idCliente : number = 0;

    valCheck : boolean = false;
    value! : string;
    radioBox : string = '';

    constructor (private srv : EncuestaServicio, private router : Router, private ref : ChangeDetectorRef) {}

    ngOnInit(): void {
        this.traeEncuesta();
    }

    traeEncuesta() {
        this.srv.obtieneEncuesta().subscribe({
            next : (encuesta) => {
                this._encuesta = encuesta;
                this._preguntas = [...new Set(encuesta.map(item => item.pregunta))];

                this.ref.detectChanges();
            },
            error : (err) => console.error(err)
        })
    }

    evaluaTipoRating(pregunta : string) : boolean {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        if(elemento.tipoPregunta == 'E') return true;
        else return false;
    }

    evaluaPreguntaRating(pregunta : string) {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        
        if(elemento.pregunta == pregunta && elemento.tipoPregunta == 'E') return pregunta;
        else return
    }

    evaluaCantidadEstrellas(pregunta : string) {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta);
        const valorPeso : number [] = [];
        elemento.forEach(item => {
            valorPeso.push(Number(item.valorRespuesta))
        })

        return Math.max.apply(null, valorPeso);
    }

    evaluaTipoSeleccion(pregunta : string) : boolean {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        if(elemento.tipoPregunta == 'S') return true;
        else return false;
    }

    evaluaPreguntaSeleccion(pregunta : string) {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        
        if(elemento.pregunta == pregunta && elemento.tipoPregunta == 'S') return pregunta;
        else return
    }

    evaluaRespuestas(pregunta : string) : string [] {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta);
        let respuestas : string [] = [];
        
        elemento.forEach(item => {
            respuestas.push(item.respuestaOpcion)
        })

        return respuestas;
    }

    evaluaTipoAbierta(pregunta : string) : boolean {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        if(elemento.tipoPregunta == 'A') return true;
        else return false;
    }

    evaluaPreguntaAbierta(pregunta : string) {
        const elemento = this._encuesta.filter(filtro => filtro.pregunta == pregunta)[0];
        
        if(elemento.pregunta == pregunta && elemento.tipoPregunta == 'A') return pregunta;
        else return
    }

    calificacion(evento : RatingRateEvent, pregunta : string) {
        if(this.respuestasRating.length > 0) {
            const respuesta = this.respuestasRating.filter(filtro => filtro.pregunta == pregunta);
            if(respuesta.length > 0) {
                respuesta[0].valorRespuesta = evento.value;
            } else {
                this.respuestasRating.push({
                    pregunta : pregunta,
                    valorRespuesta : evento.value
                })
            }
        } else {
            this.respuestasRating.push({
                pregunta : pregunta,
                valorRespuesta : evento.value
            })

        }
    }

    seleccion(evento : any, pregunta : string) {
        if(this.respuestasSeleccion.length > 0) {
            const respuesta = this.respuestasSeleccion.filter(filtro => filtro.pregunta == pregunta);
            if(respuesta.length > 0) {
                respuesta[0].opcionRespuesta = evento.value;
            } else {
                this.respuestasSeleccion.push({
                    pregunta : pregunta,
                    opcionRespuesta : evento.value
                })
            }
        } else {
            this.respuestasSeleccion.push({
                pregunta : pregunta,
                opcionRespuesta : evento.value
            })

        }
    }

    guardarEncuesta() {
        let respuestas : iRespuestasEncuesta [] = [];

        const elemento = this._encuesta.filter(filtro => filtro.tipoPregunta == 'A');
        elemento.forEach(item => {
            const texto = <HTMLTextAreaElement>document.getElementById(item.pregunta);
            this.respuestasAbierta.push({
                pregunta : texto.id,
                respuesta : texto.value
            })
        })

        this.respuestasRating.forEach(respuesta => {
            const elemento = this._encuesta.filter(filtro => filtro.pregunta == respuesta.pregunta)[0];
            respuestas.push({
                fechaHoraRespuesta : '',
                idCliente : this.idCliente,
                pregunta : elemento.pregunta,
                valor : respuesta.valorRespuesta,
                respuesta : elemento.respuestaOpcion
            })
        });

        this.respuestasSeleccion.forEach(respuesta => {
            const elemento = this._encuesta.filter(filtro => filtro.pregunta == respuesta.pregunta)[0];
            respuestas.push({
                fechaHoraRespuesta : '',
                idCliente : this.idCliente,
                pregunta : elemento.pregunta,
                valor : 0,
                respuesta : respuesta.opcionRespuesta
            })
        })

        this.respuestasAbierta.forEach(respuesta => {
            const elemento = this._encuesta.filter(filtro => filtro.pregunta == respuesta.pregunta)[0];
            respuestas.push({
                fechaHoraRespuesta : '',
                idCliente : 0,
                pregunta : elemento.pregunta,
                valor : 0,
                respuesta : respuesta.respuesta
            })
        })

        this.srv.registraEncuestaHechaPorCliente(respuestas).subscribe({
            next : (resultado) => {
                if(resultado.valor == '1') {
                    Swal.fire('SICORE','El registro se guardó exitosamente','success').then(()=>{
                        this.router.navigate(['cliente/listar']);
                    });
                } else {
                    if(resultado.valor == '-1') Swal.fire('SICORE', resultado.descripcion,'warning');
                }
            },
            error : (err) => console.error(err)
        })
    }

    salir() {
        this.router.navigate(['encuesta/listar'])
    }
}