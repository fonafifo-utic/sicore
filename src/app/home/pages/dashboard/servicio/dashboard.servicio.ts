import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { iProyectosDashboard, iResumenCotizaciones, iResumenInventario, iResumenVentas, iResumenVentasDashboard, iResumenVentasPorMes } from "../interfaces/iDashboard";

@Injectable({
    providedIn : 'root'
})

export class DashboardServicio {

    constructor(private http : HttpClient) {}

    traeProyectosActivos(): Observable<iProyectosDashboard[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ListarProyectos`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iProyectosDashboard[]>(urlControladorDashboard, httpOptions)
    }

    traeResumenVentas(): Observable<iResumenVentasDashboard[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ObtenerResumenVentas`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iResumenVentasDashboard[]>(urlControladorDashboard, httpOptions)
    }

    traeResumenCotizaciones(): Observable<iResumenCotizaciones[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ObtenerResumenCotizaciones`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iResumenCotizaciones[]>(urlControladorDashboard, httpOptions)
    }

    traeResumenVentasPorProyecto(): Observable<iResumenVentas[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ObtenerResumenVentasPorProyecto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iResumenVentas[]>(urlControladorDashboard, httpOptions)
    }

    traeResumenInventarioPorProyecto(): Observable<iResumenInventario[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ObtenerResumenInventarioPorProyecto`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iResumenInventario[]>(urlControladorDashboard, httpOptions)
    }

    obtenerVentasPorMesParaGrafico(): Observable<iResumenVentasPorMes[]> {
        const urlControladorDashboard : string = `${environment.baseUrl}C_Dashboard/ObtenerVentasPorMesParaGrafico`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iResumenVentasPorMes[]>(urlControladorDashboard, httpOptions)
    }

}