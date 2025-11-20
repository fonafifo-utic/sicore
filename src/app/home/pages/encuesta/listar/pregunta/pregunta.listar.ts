import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { iPreguntas, iRespuestas } from "../../interfaces/iEncuesta";

@Component({
    selector : 'pregunta-listar',
    templateUrl : 'pregunta.listar.html',
    styleUrl : 'pregunta.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
})

export class ListarPreguntas implements OnInit {
    private srv = inject(EncuestaServicio);
    _preguntas$! : Observable<iPreguntas[]>;
    _respuestas$! : Observable<iRespuestas[]>;
    columnas : any[] = [];
    columnasRespuestas : any[] = [];
    _preguntaElegida! : string;
    _tipoPregunta : boolean = false;

    idLineaTocadaAnterior : number = 0;
    
    constructor(private router : Router, private ref : ChangeDetectorRef){}

    ngOnInit(): void {
        this.traeTodosProyectos();
    }

    traeTodosProyectos(){
        this.columnas = [
            { campo : 'idPregunta', encabezado : 'ID' },
            { campo : 'pregunta', encabezado : 'Proyecto' },
            { campo : 'tipo', encabezado : 'Tipo' },
            { campo : 'estado', encabezado : 'Estado' }
        ];
         
        this._preguntas$ = this.srv.traeTodasPreguntas();
    }

    traeRespuestas(idPregunta : number) {
        this.columnasRespuestas = [
            { campo : 'idRespuesta', encabezado : 'ID' },
            { campo : 'idPregunta', encabezado : 'IdPregunta' },
            { campo : 'pregunta', encabezado : 'Pregunta' },
            { campo : 'tipoPregunta', encabezado : 'Tipo' },
            { campo : 'respuesta', encabezado : 'Respuesta' },
            { campo : 'valorRespuesta', encabezado : 'Valor' }  
        ];

        this._respuestas$ = this.srv.traeRespuestasPorId(idPregunta);

        this._respuestas$.subscribe({
            next : (respuestas) => {
                this._preguntaElegida = respuestas[0].pregunta;
                if(respuestas[0].tipoPregunta == 'E') this._tipoPregunta = true;
                else this._tipoPregunta = false;

                this.ref.detectChanges();

            },
            error : (err) => console.error(err)
        })

        if(this.idLineaTocadaAnterior != 0) {
            const lineaRegistroTocadaAnterior : HTMLElement = document.getElementById(this.idLineaTocadaAnterior.toString())!;
            lineaRegistroTocadaAnterior.classList.remove('flote');
        }
        
        const lineaRegistroTocado :  HTMLElement = document.getElementById(idPregunta.toString())!;
        lineaRegistroTocado?.classList.add('flote');
        this.idLineaTocadaAnterior = idPregunta;
    }

    agregarPregunta() {
        this.router.navigate(['encuesta/preguntas/agregar']);
    }

    editarPregunta(idPregunta : number) {
        this.router.navigate(['encuesta/preguntas/editar', idPregunta]);
    }

    verPregunta(idPregunta : number) {

    }

    irToEncuesta() {
        this.router.navigate(['encuesta/listar']);
    }
}