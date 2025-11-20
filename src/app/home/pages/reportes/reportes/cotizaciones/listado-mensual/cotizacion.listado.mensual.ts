import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../../shared/prime-ng.module";
import { iAnnos, iListadoCotizacionesMensual, iMeses, iRangoFechaBusqueda, iRutaDeDescargaDelPDF, iSectoresComerciales } from "../../../interfaces/iReportes";
import { ReportesServicio } from "../../../servicio/reportes.servicio";
import { Observable } from "rxjs";
import * as XLSX from 'xlsx';
import { iLoginSalida } from "../../../../../../auth/login/ilogin";
import { environment } from "../../../../../../../environments/environment";
import Swal from "sweetalert2";
import { error } from "console";
import { Router } from "@angular/router";

@Component({
    selector: 'cotizacion-listado-mensual',
    templateUrl: 'cotizacion.listado.mensual.html',
    styleUrl: 'cotizacion.listado.mensual.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
})

export class ListadoMensualCotizacion implements OnInit {

    private srv = inject(ReportesServicio);
    _meses!: iMeses[];
    _annos!: iAnnos[];
    _reporte$!: Observable<iListadoCotizacionesMensual[]>;
    _sectores$! : Observable<iSectoresComerciales[]>

    _columnas: any[] = [];

    _anno: number = new Date().getFullYear();

    private mesElegido!: number;
    private annoElegido!: number;

    private nombreHojaExcel: string = 'Reporte_Cotizaciones.xlsx';

    _desHabilitarAplicar: boolean = true;
    _desHabilitarExportar: boolean = false;
    _desHabilitarExportarPDF: boolean = false;

    _montoTotalDolares: number = 0;
    _cantidadToneladas : number = 0;

    _fechaInicioString! : string;
    _fechaFinalString! : string;
    _fechaFinalDeMes! : string;

    _fechaInicioRequerida : boolean = false;
    _fechaFinRequerida : boolean = false;
    _fechaInicioMayorToFinal : boolean = false;


    private idSectorComercial : number [] = [];

    constructor(private ref: ChangeDetectorRef, private router : Router) { }

    ngOnInit(): void {
        this.poneCondicionesIniciales();
        
        this._columnas = [
            { campo: 'sectorComercial', encabezado: 'Sector' },
            { campo: 'nombreCliente', encabezado: 'Cliente' },
            { campo: 'proyecto', encabezado: 'Proyecto' },
            { campo: 'usuario', encabezado: 'Funcionario' },
            { campo: 'fechaHora', encabezado: 'Fecha' },
            { campo: 'cantidad', encabezado: 'Cantidad' },
            { campo: 'precioUnitario', encabezado: 'Precio' },
            { campo: 'montoTotalDolares', encabezado: 'Monto' },
            { campo: 'consecutivo', encabezado: 'Consecutivo' },
            { campo: 'indicadorEstado', encabezado: 'Estado' }
        ];

        this.aplicar();
    }

    poneCondicionesIniciales() {
        const fechaDeHoy : Date = new Date();
        const fechaPrimeroMes : Date = new Date(fechaDeHoy.getFullYear(), fechaDeHoy.getMonth(), 1);
        
        const [diaPrimeroMes, mesPrimeroMes, annoPrimeroMes] = fechaPrimeroMes.toLocaleDateString().split('/');
        const [dia, mes, anno] = fechaDeHoy.toLocaleDateString().split('/');

        const diaInicialMes : string = diaPrimeroMes.length == 1 ? `0${diaPrimeroMes}` : diaPrimeroMes;
        const diaInicial : string = dia.length == 1 ? `0${dia}` : dia;
        
        const mesInicialMes : string = mesPrimeroMes.length == 1 ? `0${mesPrimeroMes}` : mesPrimeroMes;
        const mesInicial : string = mes.length == 1 ? `0${mes}` : mes;
        
        this._fechaInicioString = `${anno}-${mesInicialMes}-${diaInicialMes}`;
        this._fechaFinalString = `${anno}-${mesInicial}-${diaInicial}`;
        this._fechaFinalDeMes = this._fechaFinalString;

        this._desHabilitarAplicar = false;

        this.traeTodosLosSectoresComerciales();
    }

    eligeFechaInicial(e : any) {
        this._fechaInicioString = e.target.value;
        this.aplicar();
    }

    eligeFechaFinal(e : any) {
        this._fechaFinalString = e.target.value;
        this.aplicar();
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
        if(this.validaFechas()) return;

        const rangoDeFechas : iRangoFechaBusqueda = {
            fechaFin : this._fechaFinalString,
            fechaInicio : this._fechaInicioString,
            funcionario : 0,
            sector : this.idSectorComercial
        }

        this._reporte$ = this.srv.traeListadoMensualCotizaciones(rangoDeFechas);
        this._reporte$.subscribe({
            next : listado => this.totalizaMontoTotalDolares(listado),
            error : err => console.error(err)
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

    totalizaMontoTotalDolares(listado : iListadoCotizacionesMensual[]) {
        let montoTotalDolares : number = 0;
        let cantidadToneladas : number = 0;

        listado.forEach(item => {
            montoTotalDolares += item.montoTotalDolares;
            cantidadToneladas += item.cantidad;
        });

        this._montoTotalDolares = montoTotalDolares;
        this._cantidadToneladas = cantidadToneladas;

        this.ref.detectChanges();
    }

    exportar() {
        this.srv.exportacionReporteCotizacionesExcel().subscribe({
            next : listadoDeCotizaciones => {
                const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listadoDeCotizaciones);
                const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        
                XLSX.utils.book_append_sheet(workBook, workSheet, 'Reporte');
                XLSX.writeFile(workBook, this.nombreHojaExcel);
            },
            error : err => console.error(err)
        })
    }

    entraFechaInicio() {
        this._fechaInicioRequerida = false;
    }

    entraFechaFin() {
        this._fechaFinRequerida = false;
    }

    saleFechaInicio(e : any) {

    }

    exportarPDF() {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario: number = valorSesion.idUsuario;

        const rangoDeFechas: iRangoFechaBusqueda = {
            fechaFin: this._fechaFinalString,
            fechaInicio: this._fechaInicioString,
            funcionario: funcionario,
            sector : this.idSectorComercial
        }

        this.srv.traeRutaDescargaDelPDFCotizaciones(rangoDeFechas).subscribe({
            next: ruta => {
                const rutaDelReporte: iRutaDeDescargaDelPDF = ruta;

                if (rutaDelReporte.resultado == '1') {
                    window.open(environment.docspathPreview + rutaDelReporte.nombreArchivo);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo generar el reporte correctamente o no hay datos para mostrar."
                    });
                }
            },
            error: err => console.error(err)
        })
    }

    traeTodosLosSectoresComerciales() {
        this._sectores$ = this.srv.traeTodosLosSectoresActivos();
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

    verCotizacion(idCotizacion : number) {
        const cadenaParametroInterno : string = String(idCotizacion) + '2';
        const parametroInterno : number = Number(cadenaParametroInterno);
        
        this.router.navigate(['cotizacion/ver/' + parametroInterno]);
    }
}