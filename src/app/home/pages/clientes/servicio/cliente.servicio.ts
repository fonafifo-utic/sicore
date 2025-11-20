import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { clasificacion, iActividadComercial, iClasificacion, iCliente, iFuncionario, iSector, iTipoEmpresa } from "../interfaces/iCliente";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { of } from "rxjs";

@Injectable({
    providedIn: 'root',
})

export class ClienteServicio {
    private idCliente : number | null = null;
    private sesionAbiertaCotizacion : boolean = false;

    constructor(private http: HttpClient) { }

    traeTodosClientes(): Observable<iCliente[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarClientes`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCliente[]>(urlControladorCliente, httpOptions)
    }

    traeTodosClientesPorAgente(idAgente : number): Observable<iCliente[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarClientesPorAgente/${idAgente}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCliente[]>(urlControladorCliente, httpOptions)
    }

    traeClientePorId(idCliente : number): Observable<iCliente[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListaClientePorId/${idCliente}`;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCliente[]>(urlControladorCliente, httpOptions)
    }

    traeClientePorIdSector(idSector : number): Observable<iCliente[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListaClientePorIdSector/${idSector}`;
 
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCliente[]>(urlControladorCliente, httpOptions)
    }

    traeClientesSectorTurismo(): Observable<iCliente[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarClientesSectorTurismo`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iCliente[]>(urlControladorCliente, httpOptions)
    }

    traeTodosSectores(): Observable<iSector[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarSectores`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iSector[]>(urlControladorCliente, httpOptions)
    }

    traeTodosSectoresCompleto(): Observable<iSector[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarSectoresCompleto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iSector[]>(urlControladorCliente, httpOptions)
    }

    traeTodasActividades(): Observable<iActividadComercial[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarActividadComercial`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iActividadComercial[]>(urlControladorCliente, httpOptions)
    }

    traeTodosTiposEmpresa(): Observable<iTipoEmpresa[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarTipoEmpresa`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iTipoEmpresa[]>(urlControladorCliente, httpOptions)
    }

    traeTiposEmpresaPorId(idSector : number): Observable<iTipoEmpresa[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarTipoEmpresaPorId/${idSector}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iTipoEmpresa[]>(urlControladorCliente, httpOptions)
    }

    traeClasificacionCliente() : Observable<iClasificacion[]> {
        return of(clasificacion);
    }

    registraUnCliente(cliente : iCliente): Observable<IResultadoMetodo> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/IngresaCliente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorCliente, JSON.stringify(cliente), httpOptions);
    }

    actualizarUnCliente(cliente : iCliente): Observable<IResultadoMetodo> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ActualizaCliente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorCliente, JSON.stringify(cliente), httpOptions);
    }

    actualizaEstadoCliente(cliente : iCliente): Observable<IResultadoMetodo> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ActualizaEstadoCliente`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorCliente, JSON.stringify(cliente), httpOptions);
    }

    setIdCliente(idCliente : number | null) {
        this.idCliente = idCliente;

        // if(idCliente != null) localStorage.setItem('idCliente', String(idCliente));
        // else localStorage.removeItem('idCliente');
    }

    getIdCliente() : number | null {
        // if(this.idCliente == null) {
        //     const idCliente = Number(localStorage.getItem('idCliente'));
        //     this.idCliente = idCliente;
        // }

        return this.idCliente;
    }

    setTerminaEdicionCotizacion(sesionAbierta : boolean) {
        this.sesionAbiertaCotizacion = sesionAbierta;
    }

    getTerminaEdicionCotizacion() : boolean {
        return this.sesionAbiertaCotizacion;
    }

    traeFuncionarios(): Observable<iFuncionario[]> {
        const urlControladorCliente : string = `${environment.baseUrl}C_Cliente/ListarFuncionarios`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iFuncionario[]>(urlControladorCliente, httpOptions)
    }
}