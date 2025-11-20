import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { iParamAdminUsuario, IPerfil, iUsuarioElegidoParaRegistrar, iUsuarioParaRegistro, iUsuarioSugerido, iUsuarioVista } from "../interfaces/iusuario";
import { Observable } from "rxjs/internal/Observable";
import { IResultadoMetodo } from "../../../../interfaces/iSistema";

@Injectable({
    providedIn: 'root',
})

export class UsuarioServicio {
    constructor(private http: HttpClient) { }

    traeTodosUsuarios(): Observable<iUsuarioVista[]> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/ListarUsuarios`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iUsuarioVista[]>(urlControladorUsuario, httpOptions)
    }

    traeUsuariosParaRegistrar(): Observable<iUsuarioParaRegistro[]> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/ListarUsuariosRegistro`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iUsuarioParaRegistro[]>(urlControladorUsuario, httpOptions)
    }

    traeTodosPerfiles(): Observable<IPerfil[]> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/ListarPerfiles`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<IPerfil[]>(urlControladorUsuario, httpOptions)
    }

    traeNombrePorNumeroCedula(numeroCedula: string): Observable<iUsuarioSugerido[]> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/TraePersona/${numeroCedula}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iUsuarioSugerido[]>(urlControladorUsuario, httpOptions)
    }

    registraUsuario(usuario : iUsuarioElegidoParaRegistrar): Observable<IResultadoMetodo> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/RegistraUsuario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorUsuario, JSON.stringify(usuario), httpOptions);
    }

    traeUsuarioPorId(idUsuario : number): Observable<iUsuarioSugerido[]> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/ListaUsuarioPorId/${idUsuario}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        }

        return this.http.get<iUsuarioSugerido[]>(urlControladorUsuario, httpOptions)
    }

    actualizaUsuario(usuario: iParamAdminUsuario): Observable<IResultadoMetodo> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/ActualizaUsuario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorUsuario, JSON.stringify(usuario), httpOptions);
    }

    cambiaEstadoUsuario(usuario: iUsuarioElegidoParaRegistrar): Observable<IResultadoMetodo> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/CambiaEstadoUsuario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorUsuario, JSON.stringify(usuario), httpOptions);
    }

    cambiaPerfilUsuario(usuario: iUsuarioElegidoParaRegistrar): Observable<IResultadoMetodo> {
        const urlControladorUsuario: string = `${environment.baseUrl}C_Usuario/CambiaPerfilUsuario`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }

        return this.http.post<IResultadoMetodo>(urlControladorUsuario, JSON.stringify(usuario), httpOptions);
    }
}