import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { iEncuesta, iListadoPreguntas, iListaEncuesta, iPreguntas } from "../../interfaces/iEncuesta";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { iLoginSalida } from "../../../../../auth/login/ilogin";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

@Component({
    selector : 'agrega-encuesta',
    templateUrl : 'encuesta.listar.html',
    styleUrl : 'encuesta.listar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class ListaEncuesta implements OnInit {

    _preguntas : iPreguntas [] = [];
    _encuesta : iEncuesta [] = [];

    _listadoEncuesta : iListadoPreguntas [] = [];
    _listadoPreguntas : iListadoPreguntas [] = [];

    private listadoPreguntas : iListadoPreguntas [] = [];
    private listadoEncuesta : iListadoPreguntas [] = [];
    
    _nuevaEncuesta : iEncuesta [] = [];

    constructor(private srv : EncuestaServicio, private ref : ChangeDetectorRef, private router : Router) {}

    ngOnInit(): void {
        this.encotrarListWrapper();
        this.traeTodasLasPreguntas();
        this.traeListaEncuesta();
        this.creaMezclaParaMostrar();
    }

    encotrarListWrapper() {
        let elemento = document.getElementsByClassName('p-picklist-list-wrapper')[0];
        elemento.classList.remove();
    }

    traeTodasLasPreguntas() {
        this.srv.traeTodasPreguntas().subscribe({
            next : (preguntas) => {
                preguntas.forEach(pregunta => {
                    this.listadoPreguntas.push({
                        idPregunta : pregunta.idPregunta,
                        pregunta : pregunta.pregunta
                    })
                })
            },
            error : (err) => console.error(err)
        })
    }

    traeListaEncuesta() {
        this.srv.obtieneListaEncuesta().subscribe({
            next : (encuesta) => {
                encuesta.forEach(item => {
                    this.listadoEncuesta.push({
                        idPregunta : item.idPregunta,
                        pregunta : item.pregunta
                    })
                })

                this.ref.detectChanges();
            },
            error : (err) => console.error(err)
        })
    }

    creaMezclaParaMostrar() {
        let contador : number = 3;
        
        const intervalo = setInterval(()=>{
            
            contador--;

            if(this.listadoEncuesta.length > 0) {
                clearInterval(intervalo);

                this._listadoEncuesta = this.listadoEncuesta;

                this.listadoEncuesta.forEach(item => {
                    const idPregunta : number = item.idPregunta;
                    this.listadoPreguntas.forEach((pregunta,indice) => {
                        if(idPregunta == pregunta.idPregunta) {
                            this.listadoPreguntas.splice(indice, 1);
                        }
                    })

                })
                
                this._listadoPreguntas = this.listadoPreguntas;
                this.ref.detectChanges();

            } else {
                if(contador == 0) {
                    clearInterval(intervalo);
                    this._listadoPreguntas = this.listadoPreguntas;
                    this.ref.detectChanges();
                }
            }

        },300)
    }

    guardarEncuesta() {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario = valorSesion.idUsuario;
        
        this._listadoEncuesta.forEach(item => {
            const nuevaEncuesta : iEncuesta = {
                idEncuesta : 0,
                idFuncionario : idFuncionario,
                idPregunta : item.idPregunta
            }

            this._encuesta.push(nuevaEncuesta);
        })

        this.srv.registraUnaEncuesta(this._encuesta).subscribe({
            next : (resultado) => {
                if(resultado.valor == '1') {
                    Swal.fire('SICORE','El registro se guardó exitosamente','success').then(()=>{
                        location.reload();
                    });
                } else {
                    if(resultado.valor == '-1') Swal.fire('SICORE', resultado.descripcion,'warning');
                }
            },
            error : (err) => console.error(err)
        })
        
    }

    irToPreguntas() {
        this.router.navigate(['encuesta/preguntas/listar']);
    }

    irToEncuesta() {
        this.router.navigate(['encuesta/ver']);
    }

}