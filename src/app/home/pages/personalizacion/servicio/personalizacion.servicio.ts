import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { iDirectorEjecutivo, iParametrosReporteEncuesta, iPersonalizacion } from "../interfaces/iPersonalizacion";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";

@Injectable({
    providedIn: 'root',
})

export class PersonalizacionServicio {
    constructor(private http: HttpClient) { }

    listarPersonalizacion(): Observable<iPersonalizacion[]> {
        const urlControladorPersonalizacion : string = `${environment.baseUrl}C_Personalizacion/ListarPersonalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iPersonalizacion[]>(urlControladorPersonalizacion, httpOptions)
    }

    actualizaPersonalizacion(formalizacion : iPersonalizacion) : Observable<IResultadoMetodo> {
        const urlControladorPersonalizacion : string = `${environment.baseUrl}C_Personalizacion/ActualizaPersonalizacion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorPersonalizacion, JSON.stringify(formalizacion), httpOptions);
    }

    obtenerListadoDeDirectores(): Observable<iDirectorEjecutivo[]> {
        const urlControladorPersonalizacion : string = `${environment.baseUrl}C_Personalizacion/ObtenerListadoDeDirectores`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iDirectorEjecutivo[]>(urlControladorPersonalizacion, httpOptions)
    }

    obtenerParametrosReporteEncuesta(): Observable<iParametrosReporteEncuesta[]> {
        const urlControladorPersonalizacion : string = `${environment.baseUrl}C_Personalizacion/ObtenerParametrosReporteEncuesta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iParametrosReporteEncuesta[]>(urlControladorPersonalizacion, httpOptions)
    }

    actualizaParametrosReporte(parametros : iParametrosReporteEncuesta) : Observable<IResultadoMetodo> {
        const urlControladorPersonalizacion : string = `${environment.baseUrl}C_Personalizacion/ActualizaParametrosReporte`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorPersonalizacion, JSON.stringify(parametros), httpOptions);
    }

    

    
}