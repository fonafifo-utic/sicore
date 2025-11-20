import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ICorreo, IResultadoMetodo, IUsuarioLogin } from "../interfaces/iSistema";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private readonly baseUrl: string = environment.baseUrl;
    private http = inject(HttpClient);

    public _usuarioconectado!: IUsuarioLogin;
    public _nombreUsuarioConectado!: string;

    public _xInterval:any;

    
    correoEnviar(objCorreo: ICorreo, token: string): Observable<IResultadoMetodo> {
        const url = `${this.baseUrl}C_Correo/EnviarCorreo`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            })
        };

        return this.http.post<IResultadoMetodo>(url, objCorreo, httpOptions);
    }

    dobleFactorObtenerCodigoSeguridad(idPersona: string, opcionEnvio: string, nombreSistema: string, correoUsuario: string, telefonoUsuario: string, token: string): Observable<IResultadoMetodo> {
        const url = `${this.baseUrl}C_DobleFactor/ObtenerCodigoSeguridad?idPersona=` + idPersona + '&opcionEnvio=' + opcionEnvio + '&nombreSistema=' + nombreSistema + '&correoUsuario=' + correoUsuario + '&telefonoUsuario=' + telefonoUsuario;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            })
        };
        return this.http.get<IResultadoMetodo>(url, httpOptions);
    }

}