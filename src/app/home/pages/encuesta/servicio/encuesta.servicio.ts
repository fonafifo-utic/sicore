import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { environment } from "../../../../../environments/environment";
import { iDataGrafico, iEncuesta, iEncuestaEnviada, iEncuestaPendiente, iListaEncuesta, iPregunta, iPreguntas, iRespuestaEncuestaEnviada, iRespuestas, iRespuestasEncuesta, iRespuestasListadoMes, iVistaEncuesta } from "../interfaces/iEncuesta";
import { iListadoRespuestasPorAnno, iOpcionesParaEnviarCertificado } from "../../certificacion/interfaces/iCertificacion";

@Injectable({
    providedIn : 'root'
})

export class EncuestaServicio {
    constructor(private http : HttpClient) {}

    registraUnaPregunta(pregunta : iPregunta): Observable<IResultadoMetodo> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/IngresaUnaPregunta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorEncuesta, JSON.stringify(pregunta), httpOptions);
    }

    traeTodasPreguntas(): Observable<iPreguntas[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ListarPreguntas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iPreguntas[]>(urlControladorEncuesta, httpOptions)
    }

    traeRespuestasPorId(idPregunta : number): Observable<iRespuestas[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ListaRespuestasPorId/${idPregunta}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRespuestas[]>(urlControladorEncuesta, httpOptions)
    }

    registraUnaEncuesta(encuesta : iEncuesta[]): Observable<IResultadoMetodo> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/IngresaUnaEncuesta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorEncuesta, JSON.stringify(encuesta), httpOptions);
    }

    actualizaUnaPregunta(pregunta : iPregunta): Observable<IResultadoMetodo> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ActualizaPregunta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorEncuesta, JSON.stringify(pregunta), httpOptions);
    }

    traePreguntaPorId(idPregunta : number): Observable<iPreguntas[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ListarPreguntasPorId/${idPregunta}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iPreguntas[]>(urlControladorEncuesta, httpOptions)
    }

    obtieneEncuesta(): Observable<iVistaEncuesta[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerEncuesta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iVistaEncuesta[]>(urlControladorEncuesta, httpOptions)
    }

    obtieneListaEncuesta(): Observable<iListaEncuesta[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListaEncuesta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iListaEncuesta[]>(urlControladorEncuesta, httpOptions)
    }

    registraEncuestaHechaPorCliente(encuesta : iRespuestasEncuesta[]): Observable<IResultadoMetodo> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/IngresEncuestaHechaPorCliente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorEncuesta, JSON.stringify(encuesta), httpOptions);
    }

    obtieneRespuestasRating(): Observable<iDataGrafico[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListadoRespuestasRating`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iDataGrafico[]>(urlControladorEncuesta, httpOptions)
    }

    obtieneRespuestasSeleccion(): Observable<iDataGrafico[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListadoRespuestasSeleccion`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iDataGrafico[]>(urlControladorEncuesta, httpOptions)
    }

    obtenerListadoRespuestasEnviadasMes(): Observable<iRespuestasListadoMes[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListadoRespuestasEnviadasMes`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRespuestasListadoMes[]>(urlControladorEncuesta, httpOptions)
    }

    obtenerListadoEnviadas(): Observable<iEncuestaEnviada[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListadoEnviadas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iEncuestaEnviada[]>(urlControladorEncuesta, httpOptions)
    }

    obtenerListadoPendientes(): Observable<iEncuestaPendiente[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtenerListadoPendientes`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iEncuestaPendiente[]>(urlControladorEncuesta, httpOptions)
    }

    obtieneRespuestaEncuestaPorIdCliente(idCliente : number): Observable<iRespuestaEncuestaEnviada[]> {
        const urlControladorEncuesta : string = `${environment.baseUrl}C_Encuesta/ObtieneRespuestaEncuestaPorIdCliente/${idCliente}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRespuestaEncuestaEnviada[]>(urlControladorEncuesta, httpOptions)
    }

    reEnviaEncuesta(opcionesEnvio : iOpcionesParaEnviarCertificado): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Encuesta/ReEnviaEncuesta`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(opcionesEnvio), httpOptions);
    }
}