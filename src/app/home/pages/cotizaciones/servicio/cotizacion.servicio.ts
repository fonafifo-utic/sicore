import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { iActualizaIncadorEstadoAgrupacion, iAnulaCotizacion, iCotizacion, iCotizacionAgrupada, iCotizacionParaSalvar, iExportacionArchivoCotizacion, iListaCotizacionesAgrupadas, iValidaCotizacion } from "../interfaces/iCotizacion";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";

@Injectable({
    providedIn: 'root',
})

export class CotizacionServicio {
    constructor(private http: HttpClient) { }

    traeTodasCotizaciones(): Observable<iCotizacion[]> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ListarCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCotizacion[]>(urlControladorCotizacion, httpOptions)
    }

    traeCotizacionPorId(idCotizacion : number): Observable<iCotizacion[]> {
        const urlControladorProyecto: string = `${environment.baseUrl}C_Cotizacion/ListaCotizacionPorId/${idCotizacion}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCotizacion[]>(urlControladorProyecto, httpOptions)
    }

    traerConsecutivo() : Observable<number> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/TraeConsecutivo`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<number>(urlControladorCotizacion, httpOptions)
    }

    registraUnaCotizacion(cotizacion : iCotizacionParaSalvar): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/IngresaCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    actualizaUnaCotizacion(cotizacion : iCotizacionParaSalvar) : Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ActualizaCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    anulaUnaCotizacion(cotizacion : iAnulaCotizacion): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/AnulaCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    enviaPorCorreoCotizacion(archivoToEnviar : iExportacionArchivoCotizacion) : Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_PlantillaUploadCotizacion/CargarAutoCotizacion`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('archivo', archivoToEnviar.archivo);
        formData.append('consecutivo', archivoToEnviar.consecutivo);
        formData.append('destinatario', archivoToEnviar.destinatario);
        formData.append('idCliente', archivoToEnviar.idCliente.toString());
        formData.append('idCotizacion', archivoToEnviar.idCotizacion.toString());
        formData.append('idFuncionario', archivoToEnviar.idFuncionario.toString());
        
        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, formData, httpOptions);
    }

    validaUnaCotizacion(cotizacion : iValidaCotizacion): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ValidaUnaCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    rechazaUnaCotizacion(cotizacion : iValidaCotizacion): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/RechazaUnaCotizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    traeTodasCotizacionesActivas(): Observable<iCotizacion[]> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ListarCotizacionesActivas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCotizacion[]>(urlControladorCotizacion, httpOptions)
    }

    ingresaCotizacionAgrupada(cotizacion : iCotizacionAgrupada[]): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/IngresaCotizacionAgrupada`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    obtenerListadoCotizacionesAgrupadas(): Observable<iListaCotizacionesAgrupadas[]> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ObtenerListadoCotizacionesAgrupadas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iListaCotizacionesAgrupadas[]>(urlControladorCotizacion, httpOptions)
    }
    
    traeCotizacionesPorConsecutivo(consecutivos : string): Observable<iCotizacion[]> {
        const urlControladorProyecto: string = `${environment.baseUrl}C_Cotizacion/ListaCotizacionPorConsecutivo/${consecutivos}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCotizacion[]>(urlControladorProyecto, httpOptions)
    }

    actualizaEstadoAgrupacion(cotizacion : iActualizaIncadorEstadoAgrupacion): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/ActualizaEstadoAgrupacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }

    anulaUnaAgrupacion(cotizacion : iAnulaCotizacion): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Cotizacion/AnulaUnaAgrupacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(cotizacion), httpOptions);
    }   

}