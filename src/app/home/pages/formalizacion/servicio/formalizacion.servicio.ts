import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { iActualizaFormalizacion, iArchivoFacturaFormalizacion, iFacturasYComprobantes, iFormalizacion, iFormalizacionParaSalvar, iPeticionActivarFormalizacion, iRutaFacturaFormalizacion, iVerUnaFormalizacion } from "../interfaces/iFormalizacion";

@Injectable({
    providedIn: 'root',
})

export class FormalizacionServicio {
    constructor(private http: HttpClient) { }

    obtenerFormalizacionPorId(idFormalizacion : number): Observable<iFormalizacion[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerFormalizacionPorId/${idFormalizacion}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFormalizacion[]>(urlControladorRevision, httpOptions)
    }

    obtenerFormalizacionParaVistaPorId(idFormalizacion : string): Observable<iVerUnaFormalizacion[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerFormalizacionParaVistaPorId/${idFormalizacion}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iVerUnaFormalizacion[]>(urlControladorRevision, httpOptions)
    }

    registrarUnaFormalizacionVenta (formalizacion : iFormalizacionParaSalvar): Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/RegistrarUnaFormalizacionVenta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    obtenerListadoFormalizacion(): Observable<iFormalizacion[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerListadoFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFormalizacion[]>(urlControladorRevision, httpOptions)
    }

    actualizaUnaFormalizacion(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ActualizaUnaFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    actualizaUnaFormalizacionSinArchivos(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ActualizaUnaFormalizacionSinArchivos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    actualizaUnaFormalizacionCredito(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ActualizaUnaFormalizacionCredito`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    subeArchivosFacturacionFormalizacion(expediente : iArchivoFacturaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_PlantillaUploadFormalizacion/CargarArchivosFormalizacion`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('idFormalizacion', String(expediente.idFormalizacion));
        formData.append('idFuncionario', String(expediente.idFuncionario));
        formData.append('cotizacion', expediente.cotizacion);
        
        if(expediente.archivo.length > 0){
            for(let i = 0; i < expediente.archivo.length; i++){
                formData.append('archivo', expediente.archivo[i]);
            }
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, formData, httpOptions);
    }

    actualizaFacturacionFormalizacion(expediente : iArchivoFacturaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_PlantillaUploadFormalizacion/ActualizaArchivosFormalizacion`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('idFormalizacion', String(expediente.idFormalizacion));
        formData.append('idFuncionario', String(expediente.idFuncionario));
        formData.append('cotizacion', expediente.cotizacion);
        
        if(expediente.archivo.length > 0){
            for(let i = 0; i < expediente.archivo.length; i++){
                formData.append('archivo', expediente.archivo[i]);
            }
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, formData, httpOptions);
    }

    obtenerRutaFacturaPorId(idFormalizacion : string): Observable<iRutaFacturaFormalizacion[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerRutaFacturaPorId/${idFormalizacion}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRutaFacturaFormalizacion[]>(urlControladorRevision, httpOptions)
    }

    obtenerComprobantes(): Observable<iFacturasYComprobantes[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerComprobantes`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFacturasYComprobantes[]>(urlControladorRevision, httpOptions)
    }

    obtenerFacturas(): Observable<iFacturasYComprobantes[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerFacturas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFacturasYComprobantes[]>(urlControladorRevision, httpOptions)
    }

    obtenerNumeroComprobantes(): Observable<iFacturasYComprobantes[]> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ObtenerNumeroComprobantes`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFacturasYComprobantes[]>(urlControladorRevision, httpOptions)
    }

    cierraUnaFormalizacion(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/CierraUnaFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    peticionActivarRevisionDeFormalizacion(formalizacion : iPeticionActivarFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/PeticionActivarRevisionDeFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    activaRevisionDeFormalizacion(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/ActivaRevisionDeFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    rechazaRevisionDeFormalizacion(formalizacion : iActualizaFormalizacion) : Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/RechazaRevisionDeFormalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

    registraUnaFormalizacionAgrupada (formalizacion : iFormalizacionParaSalvar): Observable<IResultadoMetodo> {
        const urlControladorRevision : string = `${environment.baseUrl}C_RevisionFinanciera/RegistraUnaFormalizacionAgrupada`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorRevision, JSON.stringify(formalizacion), httpOptions);
    }

}