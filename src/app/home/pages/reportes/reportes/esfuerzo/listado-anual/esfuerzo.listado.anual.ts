import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { ReportesServicio } from "../../../servicio/reportes.servicio";
import { ClienteServicio } from "../../../../clientes/servicio/cliente.servicio";
import { iFuncionario } from "../../../../clientes/interfaces/iCliente";
import { Observable, Subscription } from "rxjs";
import { iDesgloseEsfuerzoColaborador, iReporteEsfuerzoAnualColaborador, iRutaDeDescargaDelPDF } from "../../../interfaces/iReportes";
import { TableRowCollapseEvent, TableRowExpandEvent } from "primeng/table";
import * as XLSX from 'xlsx';
import Swal from "sweetalert2";
import { environment } from "../../../../../../../environments/environment";
import { iLoginSalida } from "../../../../../../auth/login/ilogin";

@Component({
    selector : 'esfuerzo-listado-anual',
    templateUrl : 'esfuerzo.listado.anual.html',
    styleUrl : 'esfuerzo.listado.anual.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule, PdfViewerModule]
})

export class ListadoAnualEsfuerzoColaborador implements OnInit {

    private srv = inject(ReportesServicio);
    private servicioCliente = inject(ClienteServicio);

    _funcionarios$! : Observable<iFuncionario[]>;
    _numeroMaximoDeEleccion : number = 1;
    _reporte! : iReporteEsfuerzoAnualColaborador[];
    _listadoCompleto$! : Observable<iReporteEsfuerzoAnualColaborador[]>;

    _desHabilitarAplicar : boolean = true;
    _desHabilitarExportarPDF : boolean = true;
    _desHabilitarExportar : boolean = true;

    _totalMonto : number = 0;
    _totalCantidad : number = 0;

    _columnas : any;

    _listadoDesglose! : iDesgloseEsfuerzoColaborador[];

    private subscripcion!: Subscription;
    filasExpandidas: { [key: number]: boolean } = {};

    private nombreHojaExcel: string = 'Reporte_Esfuerzo.xlsx';

    constructor(private ref : ChangeDetectorRef){}

    ngOnInit(): void {
        this.traeTodosLosFuncionarios();
        this.traeListadoCompleto();
    }

    traeTodosLosFuncionarios() {
        this._funcionarios$ = this.servicioCliente.traeFuncionarios();
        this._desHabilitarExportar = false;
    }

    traeListadoCompleto() {
        let totalMontoAnual : number = 0;
        let totalToneladasCO2 : number = 0;

        this._listadoCompleto$ = this.srv.traeListadoAnualEsfuerzoColaborador();
        this._listadoCompleto$.subscribe({
            next : listado => {
                if(listado.length > 0) {
                    this._desHabilitarAplicar = false;
                    this._reporte = listado;

                    listado.forEach(item => {
                        totalMontoAnual += Number(item.monto);
                        totalToneladasCO2 += Number(item.cantidad);
                    });

                    this._totalMonto = totalMontoAnual;
                    this._totalCantidad = totalToneladasCO2;

                    this.ref.detectChanges();
                }
            },
            error : err => console.error(err)
        })
    }

    seleccionaFuncionario(evento : any) {
        if(evento.value[0] == 0) location.reload();

        let totalMontoAnual : number = 0;
        let totalToneladasCO2 : number = 0;

        this._listadoCompleto$.subscribe({
            next : listado => {
                this._reporte = listado.filter(agente => agente.idFuncionario == evento.value);

                this._reporte.forEach(item => {
                    totalMontoAnual += Number(item.monto);
                    totalToneladasCO2 += Number(item.cantidad);
                });

                this._totalMonto = totalMontoAnual;
                this._totalCantidad = totalToneladasCO2;

                this._desHabilitarExportarPDF = false;
                this._desHabilitarExportar = true;

                this.ref.detectChanges();
            },
            error : err => console.error(err)
        })
    }

    aplicar() {
        let totalMontoAnual : number = 0;
        let totalToneladasCO2 : number = 0;

        this._listadoCompleto$.subscribe({
            next : listado => {
                listado.forEach(item => {
                    totalMontoAnual += Number(item.monto);
                    totalToneladasCO2 += Number(item.cantidad);
                });
                
                this._totalMonto = totalMontoAnual;
                this._totalCantidad = totalToneladasCO2;
                
                this.ref.detectChanges();
            },
            error : err => console.error(err)
        })
    }

    exportarPDF(idAgente : number){
        if(this._desHabilitarExportarPDF) return;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const funcionario : string = this.daFormatoNombre(valorSesion.nombreCompleto);;
        
        this.srv.traeRutaDescargaDelPDFEsfuerzo(idAgente, funcionario).subscribe({
            next : ruta => {
                const rutaDelReporte : iRutaDeDescargaDelPDF = ruta;
                
                if(rutaDelReporte.resultado == '1') {
                    window.open(environment.docspathPreview + rutaDelReporte.nombreArchivo);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo generar el reporte correctamente."
                    });
                }
            },
            error : err => console.error(err)
        })
    }

    exportar() {
        if(this._desHabilitarExportar) return;
        
        this.srv.exportacionReporteDeEsfuerzoAnualExcel().subscribe({
            next : listadoDeCertificados => {
                const workSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(listadoDeCertificados);
                const workBook: XLSX.WorkBook = XLSX.utils.book_new();
        
                XLSX.utils.book_append_sheet(workBook, workSheet, 'Reporte');
                XLSX.writeFile(workBook, this.nombreHojaExcel);
            },
            error : err => console.error(err)
        })
    }

    cuandoSeExpandeElRegistro(evento: TableRowExpandEvent) {
        if (this.subscripcion) {
            this.subscripcion.unsubscribe();
        }

        this.filasExpandidas = {};
        this.filasExpandidas[evento.data.idFuncionario] = true;

        this.srv.traeDesgloseEsfuerzoColaborador(evento.data.idFuncionario).subscribe({
            next : desglose => {
                this._listadoDesglose = desglose;
                this.ref.detectChanges();
            },
            error : err => console.error(err)
        })
    }

    cuandoColapsaElRegistro(evento : TableRowCollapseEvent) {}

    daFormatoNombre(cadena: string) {
        let cadenaConFormato: string = '';

        cadena = cadena.toLowerCase();
        let arreglo: string[] = cadena.split(' ');

        if (arreglo.length > 1) {
            arreglo.forEach(item => {
                cadenaConFormato = cadenaConFormato + ' ' + item.charAt(0).toUpperCase() + item.slice(1)
            });

            return cadenaConFormato;
        } else {
            return cadena.charAt(0).toUpperCase() + cadena.slice(1);
        }
    }
}