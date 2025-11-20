import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../../shared/prime-ng.module";
import { iAnnos, iListadoCotizacionesMensual, iMeses, iRangoFechaBusqueda, iReporteListadoFormalizacionMensual, iRutaDeDescargaDelPDF, iSectoresComerciales } from "../../../interfaces/iReportes";
import { ReportesServicio } from "../../../servicio/reportes.servicio";
import { Observable } from "rxjs";
import * as XLSX from 'xlsx';
import { iLoginSalida } from "../../../../../../auth/login/ilogin";
import { environment } from "../../../../../../../environments/environment";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { FormalizacionServicio } from "../../../../formalizacion/servicio/formalizacion.servicio";
import { PdfViewerModule } from "ng2-pdf-viewer";

@Component({
    selector: 'formalizacion-listado-mensual',
    templateUrl: 'formalizacion.listado.mensual.html',
    styleUrl: 'formalizacion.listado.mensual.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, PdfViewerModule]
})

export class ListadoMensualFormalizacion implements OnInit {

    private srv = inject(ReportesServicio);
    _meses!: iMeses[];
    _annos!: iAnnos[];
    _reporte$!: Observable<iReporteListadoFormalizacionMensual[]>;
    _sectores$! : Observable<iSectoresComerciales[]>;
    private servicioFormalizaciones = inject(FormalizacionServicio);

    _columnas: any[] = [];

    _anno: number = new Date().getFullYear();

    private mesElegido!: number;
    private annoElegido!: number;

    private nombreHojaExcel : string = 'Reporte_Formalizaciones.xlsx'

    _desHabilitarAplicar : boolean = true;
    _desHabilitarExportar : boolean = false;
    _desHabilitarExportarPDF: boolean = false;

    _montoTotalDolares: number = 0;

    _fechaInicioString! : string;
    _fechaFinalString! : string;

    _fechaInicioRequerida : boolean = false;
    _fechaFinRequerida : boolean = false;
    _fechaInicioMayorToFinal : boolean = false;

    private idSectorComercial : number [] = [];

    _vistaPreviaFactura : boolean = false;
    _urlDelPDF! : string;

    constructor(private ref: ChangeDetectorRef, private router : Router) { }

    ngOnInit(): void {
        this.poneCondicionesIniciales();

        this._columnas = [
            { campo : 'sectorComercial', encabezado: 'Sector' },
            { campo : 'consecutivo', encabezado : 'Cotización' },
            { campo : 'fechaHora', encabezado : 'Fecha' },
            { campo : 'montoDolares', encabezado : 'Monto' },
            { campo : 'numeroTransferencia', encabezado : 'Comprobante' },
            { campo : 'numeroFacturaFonafifo', encabezado : 'Factura' },
            { campo : 'tipoCompra', encabezado : 'Tipo' },
            { campo : 'creditoDebito', encabezado : 'Crédito | Contado' },
            { campo : 'justificacionCompra', encabezado : 'Justificación' },
            { campo : 'usuario', encabezado : 'Usuario' }
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

        this._desHabilitarAplicar = false;

        this.traeTodosLosSectoresComerciales();

    }

    traeTodosLosSectoresComerciales() {
        this._sectores$ = this.srv.traeTodosLosSectoresActivos();
    }

    eligeFechaInicial(e : any) {
        this._fechaInicioString = e.target.value;
        this.aplicar();
    }

    eligeFechaFinal(e : any) {
        this._fechaFinalString = e.target.value;
    }

    elijeMes(e: any) {
        this.mesElegido = e.target.value;

        if(this.annoElegido != undefined) this._desHabilitarAplicar = false;
    }

    elijeAnno(e: any) {
        this.annoElegido = e.target.value;
        
        if(this.mesElegido != undefined) this._desHabilitarAplicar = false;
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

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario : number = valorSesion.idUsuario;

        const rangoDeFechas : iRangoFechaBusqueda = {
            fechaFin : this._fechaFinalString,
            fechaInicio : this._fechaInicioString,
            funcionario : funcionario,
            sector : this.idSectorComercial
        }

        this._reporte$ = this.srv.traeListadoMensualFormalizaciones(rangoDeFechas);
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

    totalizaMontoTotalDolares(listado : iReporteListadoFormalizacionMensual[]) {
        let montoTotalDolares : number = 0;

        listado.forEach(item => {
            montoTotalDolares += item.montoDolares;
        });

        this._montoTotalDolares = montoTotalDolares;
    }

    exportar() {
        this.srv.exportacionReporteFormalizacionesExcel().subscribe({
            next : listadoDeFormalizaciones => {
                const workSheet : XLSX.WorkSheet = XLSX.utils.json_to_sheet(listadoDeFormalizaciones);
                const workBook : XLSX.WorkBook = XLSX.utils.book_new();
        
                XLSX.utils.book_append_sheet(workBook, workSheet, 'Reporte');
        
                XLSX.writeFile(workBook, this.nombreHojaExcel);
            },
            error : err => console.log(err)
        })
    }

    entraFechaInicio() {
        this._fechaInicioRequerida = false;
    }

    entraFechaFin() {
        this._fechaFinRequerida = false;
        this.aplicar();
    }

    exportarPDF(){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario : number = valorSesion.idUsuario;

        const rangoDeFechas : iRangoFechaBusqueda = {
            fechaFin : this._fechaFinalString,
            fechaInicio : this._fechaInicioString,
            funcionario : funcionario,
            sector : this.idSectorComercial
        }

        this.srv.traeRutaDescargaDelPDFFormalizaciones(rangoDeFechas).subscribe({
            next : ruta => {
                const rutaDelReporte : iRutaDeDescargaDelPDF = ruta;
                
                if(rutaDelReporte.resultado == '1') {
                    window.open(environment.docspathPreview + rutaDelReporte.nombreArchivo);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo generar el reporte correctamente o no hay datos para mostrar."
                    });
                }
            },
            error : err => console.error(err)
        })
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

    verFactura(idFormalizacion : string) {
        this.servicioFormalizaciones.obtenerRutaFacturaPorId(idFormalizacion).subscribe({
            next : (ruta) => {
                if(ruta.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se tiene vista previa de esta factura."
                    });
                } else {
                    this._urlDelPDF = environment.docspathPreview + ruta[0].ruta;
                    this._vistaPreviaFactura = true;
    
                    this.ref.detectChanges();
                }

            },
            error : (err) => console.error(err)
        })
    }

    descargarFacturaPDF() {
        window.open(this._urlDelPDF);
    }

    cancelarVistaPrevia() {
        this._vistaPreviaFactura = false;
    }
}