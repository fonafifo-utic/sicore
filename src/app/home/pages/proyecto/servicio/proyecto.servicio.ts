import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { iArchivoDeProyecto, iEstadoProyecto, iProyecto, iRutaExpediente } from "../interfaces/iProyecto";
import { Observable } from "rxjs";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn : 'root'
})

export class ProyectoServicio {
    constructor(private http : HttpClient) {}

    registraUnProyecto(proyecto : iProyecto): Observable<IResultadoMetodo> {
        const urlControladorProyectos : string = `${environment.baseUrl}C_Proyecto/IngresaUnProyecto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorProyectos, JSON.stringify(proyecto), httpOptions);
    }

    traeTodosProyectos(): Observable<iProyecto[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ListarProyectos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

    traeTodosProyectosConRemanente(): Observable<iProyecto[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ListarProyectosConRemanente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

    traeProyectoPorId(idProyecto : number): Observable<iProyecto[]> {
        const urlControladorProyecto: string = `${environment.baseUrl}C_Proyecto/ListaProyectoPorId/${idProyecto}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

    actualizaUnProyecto(proyecto : iProyecto): Observable<IResultadoMetodo> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ActualizaProyecto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorProyecto, JSON.stringify(proyecto), httpOptions);
    }

    subeExpedienteProyecto(expediente : iArchivoDeProyecto) : Observable<IResultadoMetodo> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_PlantillaUploadProyecto/CargarArchivoProyecto`;
        const formData : FormData = new FormData();
        const httpOptions = {
            headers: new HttpHeaders({
                'enctype': 'multipart/form-data',
            })
        }

        formData.append('idProyecto', String(expediente.idProyecto));
        formData.append('idFuncionario', String (expediente.idFuncionario));
        formData.append('proyecto', expediente.proyecto);
        formData.append('extension', expediente.extension);
        formData.append('archivo', expediente.archivo);
        
        return this.http.post<IResultadoMetodo>(urlControladorProyecto, formData, httpOptions);
    }

    traeRutaDescargaProyecto(idProyecto : number): Observable<iRutaExpediente[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/TraeRutaExpedientePorId/${idProyecto}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iRutaExpediente[]>(urlControladorProyecto, httpOptions)
    }

    actualizaEstadoProyecto(proyecto : iEstadoProyecto): Observable<IResultadoMetodo> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ActualizaEstadoProyecto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorProyecto, JSON.stringify(proyecto), httpOptions);
    }
}