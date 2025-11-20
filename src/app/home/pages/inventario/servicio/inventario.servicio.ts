import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs/internal/Observable";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";
import { iIngresaMovimiento, iInventario, iMovimiento } from "../interfaces/iInventario";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";

@Injectable({
    providedIn: 'root',
})

export class InventarioServicio {
    constructor(private http: HttpClient) { }

    traeCompletoInventario(): Observable<iInventario[]> {
        const urlControladorInventario : string = `${environment.baseUrl}C_Inventario/ListarInventario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iInventario[]>(urlControladorInventario, httpOptions)
    }

    traeMovimientosInventario(idProyecto : number): Observable<iMovimiento[]> {
        const urlControladorInventario : string = `${environment.baseUrl}C_Inventario/ListarMovimientos/${idProyecto}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iMovimiento[]>(urlControladorInventario, httpOptions)
    }

    traeInventarioPorId(idInventario : number): Observable<iInventario[]> {
        const urlControladorInventario: string = `${environment.baseUrl}C_Inventario/ListaInventarioPorId/${idInventario}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iInventario[]>(urlControladorInventario, httpOptions)
    }

    registraInventario(inventario : iIngresaMovimiento): Observable<IResultadoMetodo> {
        const urlControladorInventario: string = `${environment.baseUrl}C_Inventario/IngresaInventario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorInventario, JSON.stringify(inventario), httpOptions);
    }

    actualizaInventario(inventario : iIngresaMovimiento): Observable<IResultadoMetodo> {
        const urlControladorInventario: string = `${environment.baseUrl}C_Inventario/ActualizaInventario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorInventario, JSON.stringify(inventario), httpOptions);
    }

    actualizaInventarioAumento(inventario : iIngresaMovimiento): Observable<IResultadoMetodo> {
        const urlControladorInventario: string = `${environment.baseUrl}C_Inventario/ActualizaInventarioAumento`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorInventario, JSON.stringify(inventario), httpOptions);
    }

    cambiaEstadoInventario(inventario : iInventario) : Observable<IResultadoMetodo> {
        const urlControladorInventario: string = `${environment.baseUrl}C_Inventario/CambiaEstadoInventario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.put<IResultadoMetodo>(urlControladorInventario, JSON.stringify(inventario), httpOptions);
    }

    listadoUbicacionProyectos() : Observable<iProyecto[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ListarProyectos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

    listadoUbicacionProyectosActivos() : Observable<iProyecto[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ListarProyectosActivos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

    listadoUbicacionProyectosSinInventario() : Observable<iProyecto[]> {
        const urlControladorProyecto : string = `${environment.baseUrl}C_Proyecto/ObtenerListadoProyectosSinInventario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyecto[]>(urlControladorProyecto, httpOptions)
    }

}