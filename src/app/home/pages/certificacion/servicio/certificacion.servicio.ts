import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { iCertificado, iOpcionesParaEnviarCertificado, iPoneObservacionesAlCertificado, iRutaCertificado, iSubirArchivoAlExpediente, iSubirCertificadoFirmado, iVistaCertificado } from "../interfaces/iCertificacion";

@Injectable({
    providedIn: 'root',
})

export class CertificacionServicio {

    idCertificado! : string;
    sesionAbiertaCertificado! : boolean;
    certificadoEnIngles! : boolean;
    muestraObservaciones! : boolean;
    _observaciones! : string;
    _tamannoBarraTitulo! : string;

    constructor(private http: HttpClient) { }

    listarCertificado(): Observable<iCertificado[]> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/ListarCertificado`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCertificado[]>(urlControladorCertificado, httpOptions)
    }

    listarCertificadosAprobados(): Observable<iCertificado[]> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/ListarCertificadosAprobados`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCertificado[]>(urlControladorCertificado, httpOptions)
    }

    obtieneCertificadoPorId(idCertificado : string): Observable<iVistaCertificado[]> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/ListaCertificadoPorId/${idCertificado}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iVistaCertificado[]>(urlControladorCertificado, httpOptions)
    }

    subeCertificadoFirmado(expediente : iSubirCertificadoFirmado) : Observable<IResultadoMetodo> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_PlantillaUploadCertificado/CargarCertificadoFirmado`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('idCertificado', String(expediente.idCertificado));
        formData.append('idFuncionario', String (expediente.idFuncionario));
        formData.append('cotizacion', expediente.cotizacion);
        formData.append('extension', expediente.extension);
        formData.append('archivo', expediente.archivo);
        
        return this.http.post<IResultadoMetodo>(urlControladorCertificado, formData, httpOptions);
    }

    traeRutaDescargaCertificado(idCertificado : number): Observable<iRutaCertificado[]> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/TraeRutaCertificadoPorId/${idCertificado}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRutaCertificado[]>(urlControladorCertificado, httpOptions)
    }

    enviaUnCertificadoFirmado(opcionesEnvio : iOpcionesParaEnviarCertificado): Observable<IResultadoMetodo> {
        const urlControladorCotizacion : string = `${environment.baseUrl}C_Certificado/EnviaUnCertificado`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCotizacion, JSON.stringify(opcionesEnvio), httpOptions);
    }

    subeArchivosAlExpediente(expediente : iSubirArchivoAlExpediente) : Observable<IResultadoMetodo> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_PlantillaUploadCertificado/SubeArchivosAlExpediente`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('extension', expediente.extension);
        formData.append('idFuncionario', String(expediente.idFuncionario));
        formData.append('nombreArchivo', expediente.nombreArchivo);
        
        if(expediente.archivo.length > 0){
            for(let i = 0; i < expediente.archivo.length; i++){
                formData.append('archivo', expediente.archivo[i]);
            }
        }

        return this.http.post<IResultadoMetodo>(urlControladorCertificado, formData, httpOptions);
    }

    obtieneRutaElementosExpediente(): Observable<iRutaCertificado[]> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/ObtieneRutaElementosExpediente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRutaCertificado[]>(urlControladorCertificado, httpOptions)
    }

    poneObservacionesAlCertificado(certificado : iPoneObservacionesAlCertificado) : Observable<IResultadoMetodo> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/PoneObservacionesAlCertificado`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorCertificado, JSON.stringify(certificado), httpOptions);
    }

    setIdCertificado(idCertificado : string) {
        this.idCertificado = idCertificado;
    }

    getIdCertificado() : string {
        return this.idCertificado;
    }

    setTerminaEdicionCertificado(sesionAbierta : boolean) {
        this.sesionAbiertaCertificado = sesionAbierta;
    }

    getTerminaEdicionCertificado() : boolean {
        return this.sesionAbiertaCertificado;
    }

    setCertificadoEnIngles(certificadoEnIngles : boolean) {
        this.certificadoEnIngles = certificadoEnIngles;
    }

    getCertificadoEnIngles() : boolean {
        return this.certificadoEnIngles;
    }

    setMuestraObservaciones(muestraObservaciones : boolean) {
        this.muestraObservaciones = muestraObservaciones;
    }

    getMuestraObservaciones() : boolean {
        return this.muestraObservaciones;
    }

    setLasObservaciones(observaciones : string) {
        this._observaciones = observaciones;
    }

    getLasObservaciones() : string {
        return this._observaciones;
    }

    setTamannoBarraTitulo(tamanno : string) {
        this._tamannoBarraTitulo = tamanno;
    }

    getTamannoBarraTitulo() : string {
        return this._tamannoBarraTitulo;
    }

    apruebaCertificado(certificado : iPoneObservacionesAlCertificado) : Observable<IResultadoMetodo> {
        const urlControladorCertificado : string = `${environment.baseUrl}C_Certificado/ApruebaCertificado`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorCertificado, JSON.stringify(certificado), httpOptions);
    }

}