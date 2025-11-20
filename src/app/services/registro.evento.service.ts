import { Injectable } from "@angular/core";
import { IEvento, IResultadoMetodo } from "../interfaces/iSistema";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IUsuarioLogin } from "../auth/login/ilogin";

@Injectable({
    providedIn : 'root'
})

export class RegistroEventosServicio {
    private objtoken! : IUsuarioLogin;
    private usuario! : string;
    
    constructor(private http: HttpClient) {
        this.objtoken = JSON.parse(sessionStorage.getItem('token')!);
        this.usuario = this.objtoken?.correoUsuario.toString();
    }
    
    private regitraEvento(evento : IEvento): Observable<IResultadoMetodo> {
        const url = `${environment.baseUrl}C_RegistroEventosController/IngresaEvento`;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.objtoken?.token
            })
        };

        return this.http.post<IResultadoMetodo>(url, JSON.stringify(evento), httpOptions);
    }

    public setEvento(modulo : string, operacion : string) {

        const evento : IEvento = {
            fechaTraza : '',
            idTraza : '',
            idUsuario : this.usuario,
            modulo : modulo,
            operacion : operacion
        }

        this.regitraEvento(evento).subscribe({
            next : (respuesta) => console.log(respuesta),
            error : (err) => console.error(err)
        })
    }
}