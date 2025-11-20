import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { ReportesServicio } from "../../../servicio/reportes.servicio";
import { Observable } from "rxjs";
import { iListadoEncuesta, iRangoFechaBusqueda } from "../../../interfaces/iReportes";
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../../../auth/login/ilogin";
import * as XLSX from 'xlsx';
import { environment } from "../../../../../../../environments/environment";
import Swal from "sweetalert2";

@Component({
    selector : 'encuesta-listado',
    templateUrl : 'encuesta.listado.html',
    styleUrl : 'encuesta.listado.css',
    imports: [PrimeNgModule, CommonModule],
    standalone: true
})

export class ListadoEncuestas implements OnInit {
    private srv = inject(ReportesServicio);
    _reporte$!: Observable<iListadoEncuesta[]>;

    _columnas: any[] = [];

    private mesElegido!: number;
    private annoElegido!: number;

    private nombreHojaExcel: string = 'Reporte_Encuesta.xlsx';

    _desHabilitarAplicar: boolean = true;
    _desHabilitarExportar: boolean = false;
    _desHabilitarExportarPDF: boolean = false;

    _totalMontoMensual: number = 0;

    _fechaInicioString!: string;
    _fechaFinalString!: string;

    _fechaInicioRequerida: boolean = false;
    _fechaFinRequerida: boolean = false;
    _fechaInicioMayorToFinal: boolean = false;

    private idSectorComercial : number [] = [];

    _totalEncuestados! : string;

    constructor(private ref: ChangeDetectorRef, private router : Router) { }

    ngOnInit(): void {
        this.poneCondicionesIniciales();

        this._columnas = [
            { campo: 'pregunta', encabezado: 'Pregunta' },
            { campo: 'respuesta', encabezado: 'Respuesta' },
            { campo: 'personasQueContestaron', encabezado: 'Contestaron' },
            { campo: 'totalEncuestados', encabezado: 'Total Encuestado' },
            { campo: 'porcentaje', encabezado: 'Porcentaje' }
        ];

        this.aplicar();   
    }

    poneCondicionesIniciales() {
        const fechaDeHoy: Date = new Date();
        const fechaPrimeroMes: Date = new Date(fechaDeHoy.getFullYear(), fechaDeHoy.getMonth(), 1);

        const [diaPrimeroMes, mesPrimeroMes, annoPrimeroMes] = fechaPrimeroMes.toLocaleDateString().split('/');
        const [dia, mes, anno] = fechaDeHoy.toLocaleDateString().split('/');

        const diaInicialMes: string = diaPrimeroMes.length == 1 ? `0${diaPrimeroMes}` : diaPrimeroMes;
        const diaInicial: string = dia.length == 1 ? `0${dia}` : dia;

        const mesInicialMes: string = mesPrimeroMes.length == 1 ? `0${mesPrimeroMes}` : mesPrimeroMes;
        const mesInicial: string = mes.length == 1 ? `0${mes}` : mes;

        this._fechaInicioString = `${anno}-${mesInicialMes}-${diaInicialMes}`;
        this._fechaFinalString = `${anno}-${mesInicial}-${diaInicial}`;

        this._desHabilitarAplicar = false;
    }

    elijeMes(e: any) {
        this.mesElegido = e.target.value;

        if (this.annoElegido != undefined) this._desHabilitarAplicar = false;
    }

    elijeAnno(e: any) {
        this.annoElegido = e.target.value;

        if (this.mesElegido != undefined) this._desHabilitarAplicar = false;
    }

    creaNumeroCertificado(numeroCertificado: number): string {
        const annoActual: string = new Date().getFullYear().toString();
        return `${annoActual}-${this.colocaCerosAlNumeroEntero(numeroCertificado)}`
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

    aplicar() {
        if (this.validaFechas()) return;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario : number = valorSesion.idUsuario;

        const rangoDeFechas : iRangoFechaBusqueda = {
            fechaFin: this._fechaFinalString,
            fechaInicio: this._fechaInicioString,
            funcionario : funcionario,
            sector : this.idSectorComercial
        }

        this._reporte$ = this.srv.traeListadoEncuesta(rangoDeFechas);
        this._reporte$.subscribe({
            next: listado => {
                if (listado.length > 0) {
                    this._desHabilitarExportar = false;
                    this._totalEncuestados = listado[0].totalEncuestados;
                    this.ref.detectChanges();
                }
            }
        })
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

    exportar() {
        this.srv.exportacionReporteCertificadosExcel().subscribe({
            next : listadoDeCertificados => {
                const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listadoDeCertificados);
                const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        
                XLSX.utils.book_append_sheet(workBook, workSheet, 'Reporte');
                XLSX.writeFile(workBook, this.nombreHojaExcel);
            },
            error : err => console.error(err)
        })
    }

    exportarPDF(){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario : number = valorSesion.idUsuario;

        const rangoDeFechas : iRangoFechaBusqueda = {
            fechaFin: this._fechaFinalString,
            fechaInicio: this._fechaInicioString,
            funcionario : funcionario,
            sector : this.idSectorComercial
        }

        // this.srv.traeRutaDescargaDelPDFCertificados(rangoDeFechas).subscribe({
        //     next : ruta => {
        //         console.log(ruta);
        //         const rutaDelReporte : iRutaDeDescargaDelPDF = ruta;
                
        //         if(rutaDelReporte.resultado == '1') {
        //             window.open(environment.docspathPreview + rutaDelReporte.nombreArchivo);
        //         } else {
        //             Swal.fire({
        //                 icon: "error",
        //                 title: "Oops...",
        //                 text: "No se pudo generar el reporte correctamente."
        //             });
        //         }
        //     },
        //     error : err => console.error(err)
        // })
    }

    entraFechaInicio() {
        this._fechaInicioRequerida = false;
    }

    entraFechaFin() {
        this._fechaFinRequerida = false;
    }

    eligeFechaInicial(e : any) {
        this._fechaInicioString = e.target.value;
        this.aplicar();
    }

    eligeFechaFinal(e : any) {
        this._fechaFinalString = e.target.value;
        this.aplicar();
    }

    seleccionaSectorComercial(e : any) {
        if(e != null) {
            if((Number(e.value) == 0)){
                return;
            } else {
                this.idSectorComercial = e.value;
            }
        }
        
        this.aplicar();
    }

    verCertificado(idCertificado : number) {
        const cadenaParametroInterno : string = String(idCertificado) + '1';
        const parametroInterno : number = Number(cadenaParametroInterno);
        
        this.router.navigate(['certificados/ver', parametroInterno])

    }

    esRating(respuesta : string) : boolean {
        if(/^[-+]?\d+(\.\d+)?$/.test(respuesta)) return true;
        else return false;
    }
}