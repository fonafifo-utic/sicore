import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { iDataGrafico } from "../interfaces/iEncuesta";
import { EncuestaServicio } from "../servicio/encuesta.servicio";

@Component({
    selector : 'dashboard-encuesta',
    templateUrl : 'encuesta.dashboard.html',
    styleUrl : 'encuesta.dashboard.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class DashboardEncuesta implements OnInit {

    _respuestasTipoEscala : iDataGrafico [] = [];
    _respuestasTipoSeleccion : iDataGrafico [] = [];
    _preguntasTipoSeleccion : string [] = [];
    _preguntasTipoEscala : string [] = [];

    _preguntas : string [] = [];

    private srv = inject(EncuestaServicio);

    _pieData : any;
    _pieOpciones : any;

    barData : any;
    barOptions : any;
    
    _perfilPermitido : boolean = true;

    constructor (private router : Router, private ref : ChangeDetectorRef) {}

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if(valorSesion.idPerfil == 4) this._perfilPermitido = false;        

        this.respuestasTipoEscala();
        this.respuestasTipoSeleccion();
        
    }

    respuestasTipoEscala(){

        this.srv.obtieneRespuestasRating().subscribe({
            next : (respuestas) => {
                this._respuestasTipoEscala = respuestas;
                this._preguntasTipoEscala = [...new Set(this._respuestasTipoEscala.map(item => item.pregunta))];
                
                this.setOpcionesPie();
                this.ref.detectChanges();
            }
        })

    }

    respuestasTipoSeleccion(){

        this.srv.obtieneRespuestasSeleccion().subscribe({
            next : (respuestas) => {
                this._respuestasTipoSeleccion = respuestas;
                this._preguntasTipoSeleccion = [...new Set(this._respuestasTipoSeleccion.map(item => item.pregunta))];
                this.setOpcionesBarras();
                this.ref.detectChanges();
            }
        })

    }

    setOpcionesPie(){
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this._pieOpciones = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    setDataPie(pregunta : string) : any {
        const documentStyle = getComputedStyle(document.documentElement);
        const etiquetas : string [] = [];
        const conteo : number [] = [];

        this._respuestasTipoEscala.filter(filtro => filtro.pregunta == pregunta).forEach(item => {
            etiquetas.push(item.respuesta);
            conteo.push(item.conteo)
        });

        return {
            labels : etiquetas,
            datasets : [
                {
                    data: conteo,

                    backgroundColor: [
                        documentStyle.getPropertyValue('--indigo-500'),
                        documentStyle.getPropertyValue('--purple-500'),
                        documentStyle.getPropertyValue('--teal-500')
                    ],

                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--indigo-400'),
                        documentStyle.getPropertyValue('--purple-400'),
                        documentStyle.getPropertyValue('--teal-400')
                    ]
                }]
        };

    }

    setOpcionesBarras() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 200
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
            }
        };
    }

    setDataBarra(pregunta : string) : any {
        const documentStyle = getComputedStyle(document.documentElement);
        const etiquetas : string [] = [];
        const peso : number [] = [];

        this._respuestasTipoSeleccion.filter(filtro => filtro.pregunta == pregunta).forEach(item => {
            etiquetas.push(item.respuesta);
            peso.push(item.conteo);
        });

        return {
            labels: etiquetas,
            datasets: [
                {
                    label: 'Respuestas',
                    backgroundColor: documentStyle.getPropertyValue('--primary-200'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    data: peso
                }
            ]
        };
    }

    irToPreguntas() {
        this.router.navigate(['encuesta/preguntas/listar']);
    }

    irToEncuesta() {
        this.router.navigate(['encuesta/listar']);
    }

    irToListado() {
        this.router.navigate(['encuesta/encuesta-enviada']);
    }
}