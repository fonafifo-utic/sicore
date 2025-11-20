import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { iDesgloseEsfuerzoColaborador, iListadoCotizacionesMensual, iListadoEncuesta, iListadoMensualCertificado, iRangoFechaBusqueda, iReporteEsfuerzoAnualColaborador, iReporteListadoCotizacionesExcel, iReporteListadoFormalizacionMensual, iReporteListadoVentas, iRutaDeDescargaDelPDF, iSectoresComerciales } from "../interfaces/iReportes";
import { Observable } from "rxjs";
import { iListadoRespuestasPorAnno } from "../../certificacion/interfaces/iCertificacion";

@Injectable({
    providedIn: 'root'
})

export class ReportesServicio {
    constructor(private http: HttpClient) { }

    traeListadoMensualCertificados(rangoFechas : iRangoFechaBusqueda): Observable<iListadoMensualCertificado[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeListadoMensualCertificados`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iListadoMensualCertificado[]>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeListadoMensualCotizaciones(rangoFechas : iRangoFechaBusqueda): Observable<iListadoCotizacionesMensual[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeListadoMensualCotizaciones`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iListadoCotizacionesMensual[]>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeListadoMensualFormalizaciones(rangoFechas : iRangoFechaBusqueda): Observable<iReporteListadoFormalizacionMensual[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeListadoMensualFormalizaciones`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iReporteListadoFormalizacionMensual[]>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions);
    }

    traeListadoMensualVentas(rangoFechas : iRangoFechaBusqueda): Observable<iReporteListadoVentas[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeListadoVentas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iReporteListadoVentas[]>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeListadoAnualEsfuerzoColaborador(): Observable<iReporteEsfuerzoAnualColaborador[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeListadoAnualEsfuerzoColaborador`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iReporteEsfuerzoAnualColaborador[]>(urlControladorReporte, httpOptions)
    }

    traeDesgloseEsfuerzoColaborador(idFuncionario : number): Observable<iDesgloseEsfuerzoColaborador[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeDesgloseEsfuerzoColaborador/${idFuncionario}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iDesgloseEsfuerzoColaborador[]>(urlControladorReporte, httpOptions)
    }

    traeRutaDescargaDelPDFCertificados(rangoFechas : iRangoFechaBusqueda): Observable<iRutaDeDescargaDelPDF> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteCertificados`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iRutaDeDescargaDelPDF>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeRutaDescargaDelPDFCotizaciones(rangoFechas : iRangoFechaBusqueda): Observable<iRutaDeDescargaDelPDF> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteCotizaciones`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iRutaDeDescargaDelPDF>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeRutaDescargaDelPDFFormalizaciones(rangoFechas : iRangoFechaBusqueda): Observable<iRutaDeDescargaDelPDF> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteFormalizaciones`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iRutaDeDescargaDelPDF>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeRutaDescargaDelPDFVentas(rangoFechas : iRangoFechaBusqueda): Observable<iRutaDeDescargaDelPDF> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteVentas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iRutaDeDescargaDelPDF>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeTodosLosSectoresActivos(): Observable<iSectoresComerciales[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeTodosLosSectoresActivos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iSectoresComerciales[]>(urlControladorReporte, httpOptions)
    }

    exportacionReporteCotizacionesExcel() : Observable<iReporteListadoCotizacionesExcel[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteCotizacionesExcel`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iReporteListadoCotizacionesExcel[]>(urlControladorReporte, httpOptions)
    }

    exportacionReporteFormalizacionesExcel() : Observable<[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteFormalizacionesExcel`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<[]>(urlControladorReporte, httpOptions)
    }

    exportacionReporteCertificadosExcel() : Observable<[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteCertificadosExcel`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<[]>(urlControladorReporte, httpOptions)
    }

    exportacionReporteVentasExcel() : Observable<[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteVentasExcel`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<[]>(urlControladorReporte, httpOptions)
    }

    exportacionReporteDeEsfuerzoAnualExcel() : Observable<[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteDeEsfuerzoAnualExcel`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<[]>(urlControladorReporte, httpOptions)
    }

    traeRutaDescargaDelPDFEsfuerzo(idAgente : number, funcionario : string): Observable<iRutaDeDescargaDelPDF> {
        const urlControladorReporte: string = `${environment.baseUrl}C_ExportacionReportes/ExportacionReporteEsfuerzoPDF/${idAgente}/${funcionario}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRutaDeDescargaDelPDF>(urlControladorReporte, httpOptions)
    }
    
    traeListadoEncuesta(rangoFechas : iRangoFechaBusqueda): Observable<iListadoEncuesta[]> {
        const urlControladorReporte: string = `${environment.baseUrl}C_Reportes/TraeReporteEncuentas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<iListadoEncuesta[]>(urlControladorReporte, JSON.stringify(rangoFechas), httpOptions)
    }

    traeRespuestasPorAnno(): Observable<iListadoRespuestasPorAnno[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Reportes/TraeRespuestasPorAnno`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iListadoRespuestasPorAnno[]>(urlControladorEncuesta, httpOptions)
    }

}