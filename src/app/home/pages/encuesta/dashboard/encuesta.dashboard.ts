import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { iDataGrafico, iEncuestaTraeRespuestasOpinion, iEncuestaTraeRespuestasParaExcel } from "../interfaces/iEncuesta";
import { EncuestaServicio } from "../servicio/encuesta.servicio";
import * as XLSX from 'xlsx';
import { Observable } from "rxjs";

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

    private nombreHojaExcel: string = 'Respuestas_De_La_Encuesta.xlsx';

    _respuestasOpinion$! : Observable<iEncuestaTraeRespuestasOpinion[]>;
    _columnas: any[] = [];

    _fechaInicioString! : string;
    _fechaFinalString! : string;
    _fechaInicioRequerida : boolean = false;
    _fechaFinRequerida : boolean = false;
    _fechaInicioMayorToFinal : boolean = false;
    _desHabilitarAplicar : boolean = false;

    _muestraInformacion : boolean = false;

    constructor (private router : Router, private ref : ChangeDetectorRef) {}

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if(valorSesion.idPerfil == 4) this._perfilPermitido = false;

        this.poneCondicionesIniciales();

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

    exportarToExcel() {
        this.srv.obtenerRespuestasDeLaEncuestaExportarExcel().subscribe({
            next : respuestas => {

                const nombreDeLasHojas = this.agruparPorPregunta(respuestas);
                const workBook : XLSX.WorkBook = XLSX.utils.book_new();

                Object.keys(nombreDeLasHojas).forEach((respuesta) => {
                    const datosSinPregunta = this.filtrarColumnas(nombreDeLasHojas[respuesta]);
                    const workSheet : XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosSinPregunta);
                    const sheetName : string = this.limitarNombreHoja(respuesta);

                    XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);
                });
                
                XLSX.writeFile(workBook, this.nombreHojaExcel);
            },
            error : err => console.error(err)
        })
    }

    filtrarColumnas(respuestas : iEncuestaTraeRespuestasParaExcel[]): any[] {
        return respuestas.map(item => ({
            'Respuesta': item.respuesta,
            'Contestaron': item.contestaron
        }));
    }

    agruparPorPregunta(respuestas : any[]) : { [key : string] : iEncuestaTraeRespuestasParaExcel[] } {
        const nombresDeLasHojas : { [key : string] : iEncuestaTraeRespuestasParaExcel[] } = {};
        
        return respuestas.reduce((nombre, item) => {
            const respuesta = item.pregunta || 'Sin pregunta';
            
            if (!nombre[respuesta]) {
                nombre[respuesta] = [];
            }
            
            nombre[respuesta].push(item);
            
            return nombre;

        }, nombresDeLasHojas);
    }

    limitarNombreHoja(nombre: string): string {
        let nombreLimpio = nombre.replace(/[\\/*\[\]:?]/g, '_');
    
        if (nombreLimpio.length > 31) {
            nombreLimpio = nombreLimpio.substring(0, 28) + '...';
        }
    
        return nombreLimpio;
    }

    entraFechaInicio() {
        this._fechaInicioRequerida = false;
    }

    eligeFechaInicial(e : any) {
        this._fechaInicioString = e.target.value;
        this.aplicar();
    }

    eligeFechaFinal(e : any) {
        this._fechaFinalString = e.target.value;
        this.aplicar();
    }

    entraFechaFin() {
        this._fechaFinRequerida = false;
    }

    aplicar() {
        if (this.validaFechas()) return;
        this._respuestasOpinion$ = this.srv.obtenerRespuestasOpinion(this._fechaInicioString, this._fechaFinalString);
    }

    validaFechas() : boolean {
        if(this._fechaInicioString == '') {
            this._fechaInicioRequerida = true;
            this._desHabilitarAplicar = true;
            return true
        };

        if(this._fechaFinalString == '') {
            this._fechaFinRequerida = true;
            this._desHabilitarAplicar = true;
            return true;
        }

        const fechaInicio = Date.parse(this._fechaInicioString);
        const fechaFin = Date.parse(this._fechaFinalString);

        if(fechaInicio > fechaFin) {
            this._fechaInicioMayorToFinal = true;
            this._desHabilitarAplicar = true;
            return true;
        }

        return false;
    }

    poneCondicionesIniciales() {
        const fechaDeHoy: Date = new Date();
        const fechaPrimeroAnno : Date = new Date(new Date().getFullYear(), 0, 1);

        const [diaPrimeroAnno, mesPrimeroAnno, annoPrimeroAnno] = fechaPrimeroAnno.toLocaleDateString().split('/');
        const [dia, mes, anno] = fechaDeHoy.toLocaleDateString().split('/');

        const diaInicialMes: string = diaPrimeroAnno.length == 1 ? `0${diaPrimeroAnno}` : diaPrimeroAnno;
        const diaInicial: string = dia.length == 1 ? `0${dia}` : dia;

        const mesInicialMes: string = mesPrimeroAnno.length == 1 ? `0${mesPrimeroAnno}` : mesPrimeroAnno;
        const mesInicial: string = mes.length == 1 ? `0${mes}` : mes;

        this._fechaInicioString = `${anno}-${mesInicialMes}-${diaInicialMes}`;
        this._fechaFinalString = `${anno}-${mesInicial}-${diaInicial}`;

        this._respuestasOpinion$ = this.srv.obtenerRespuestasOpinion(this._fechaInicioString, this._fechaFinalString);
    }

    muestraInformacion() {
        this._muestraInformacion = true;
    }
}