import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FileSaverService } from 'ngx-filesaver';
import { environment } from '../../environments/environment';
import { iActivaDFM, iConfigurarDFM, iDesactivarDMF, iEstaUsuarioConfiguradoDFM, ILogin, iLoginIngreso, iLoginSalida, iRespuestaActivacionDFM, iRespuestaConfigurarDFM, iUsuarioConfiguradoDFM, IUsuarioLogin, iVerificaCodigoOTP } from '../auth/login/ilogin';
import { IResultadoMetodo, ModeloCorreo } from '../interfaces/iSistema';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    public baseUrl: String = environment.baseFonafifoUrl;
    public hrefimgs: string = environment.hrefimgs;
    public docspath: string = environment.docspath;
    public docspathPreview: string = environment.docspathPreview;
    public appUrl: string = environment.appUrl;

    public _usuarioconectado: IUsuarioLogin | undefined;
    private objtoken: IUsuarioLogin | undefined;


    get _isusuariologgued(): boolean {
        if (this._usuarioconectado == undefined) {
            return false
        }
        return true
    }

    // _dsgenero: IGenero[] = [
    //     {
    //         idGenero: 'S',
    //         nombre: 'Seleccionar...'
    //     },
    //     {
    //         idGenero: 'F',
    //         nombre: 'Femenino'
    //     },
    //     {
    //         idGenero: 'M',
    //         nombre: 'Masculino'
    //     },
    //     {
    //         idGenero: 'I',
    //         nombre: 'Intersexo'
    //     }
    // ];

    // public _dsmodalidad: IModalidad[] = [];
    // public _dssubmodalidad: ISubModalidad[] = [];
    // public _dsOficinas: IOficinaRegional[] = [];

    public _ayudaOR: boolean = false;

    _iscomplete1: boolean = false;
    _iscomplete2: boolean = false;
    _iscomplete3: boolean = false;
    _iscomplete4: boolean = false;
    _iscomplete5: boolean = false;
    _iscomplete6: boolean = false;
    _iscomplete7: boolean = false;
    _isEstadoCitaValido: string = '';

    public _xInterval: any;
    constructor(private http: HttpClient) {
        this.objtoken = JSON.parse(sessionStorage.getItem('token')!);
    }

    /****** FUNCIONES PARA LOGIN Y MENU *****/

    desactivarElDFM(idUsuario : number) : Observable<iRespuestaActivacionDFM> {
        const url : string = `${environment.enlaceParaDesactivarElDFM}`;
        const credenciales : iDesactivarDMF = {
            idUsuario : String(idUsuario),
            nombreSistema : 'sicore'
        }

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http.post<iRespuestaActivacionDFM>(url, JSON.stringify(credenciales) ,opciones);
    }

    //enlaceParaDesactivarElDFM

    obtenerConfiguracionDeDFM(idUsuario : number) : Observable<iUsuarioConfiguradoDFM> {
        const url : string = `${environment.enlaceParaVerificarConfiguracion}${idUsuario}`;
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<iUsuarioConfiguradoDFM>(url);
    }

    obtenerConfirmacionDeActivacionDelDFM(idUsuario : number) : Observable<iEstaUsuarioConfiguradoDFM[]> {
        const url : string = `${environment.baseUrl}C_Usuario/ObtenerConfiguracionDeDFM/${idUsuario}`;
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<iEstaUsuarioConfiguradoDFM[]>(url, opciones);
    }

    configurarDobleFactorMicrosoft(credenciales : iConfigurarDFM) : Observable<iRespuestaConfigurarDFM> {
        const url : string = `${environment.enlaceParaConfigurarDFM}`;
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.post<iRespuestaConfigurarDFM>(url, JSON.stringify(credenciales), opciones);
    }

    activaElDFM(credenciales : iActivaDFM) : Observable<iRespuestaActivacionDFM> {
        const url : string = `${environment.enlaceParaActivarDFM}`;
        const opciones = {
            headers : new HttpHeaders ({
                'Content-Type' : 'application/json'
            })
        }

        return this.http.post<iRespuestaActivacionDFM>(url, JSON.stringify(credenciales), opciones);
    }

    verificaCodigoOTP(credenciales : iVerificaCodigoOTP) : Observable<iRespuestaActivacionDFM> {
        const url : string = `${environment.enlaceQueVerificaOTP}`;
        const opciones = {
            headers : new HttpHeaders ({
                'Content-Type' : 'application/json'
            })
        }

        return this.http.post<iRespuestaActivacionDFM>(url, JSON.stringify(credenciales), opciones);
    }

    DoLogin(objValor: iLoginIngreso): Observable<iLoginSalida> {
        const url = `${environment.baseUrl}C_Usuario/DoLogin`;
        return this.http.post<iLoginSalida>(url, objValor);
    }

    DoLogout() {
        this._usuarioconectado = undefined;
        sessionStorage.clear();
    }

    VerificaAutenticacion(): Observable<boolean> {
        this.objtoken = JSON.parse(sessionStorage.getItem('token')!);

        if (!sessionStorage.getItem('token')) {
            return of(false);
        }

        this._usuarioconectado = this.objtoken;

        return of(true);
    }

    usuarioActualizarClave(objUsuario : iLoginIngreso): Observable<IResultadoMetodo> {
        const url = `${environment.baseUrl}C_Usuario/ActualizarClave`;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.objtoken?.token
            })
        };

        return this.http.put<IResultadoMetodo>(url, objUsuario, httpOptions);
    }

    usuarioResetearClave(cedulaCorreo: string): Observable<ILogin[]> {
        const url = `${this.baseUrl}C_Login/ResetearClaveUsuario?cedulaCorreo=` + cedulaCorreo;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.objtoken?.token
            })
        };
        return this.http.get<ILogin[]>(url);

    }

    usuarioEncryptarDesencryptar(op: string, valor: string, forSend: string): Observable<IResultadoMetodo> {
        const url = `${this.baseUrl}C_Login/EncryptarDesencryptar?op=` + op + '&valor=' + valor + '&forSend=' + forSend;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.objtoken?.token
            })
        };
        return this.http.get<IResultadoMetodo>(url);
    }

    /***** DOBLE FACTOR  *******/
//string idPersona, string opcionEnvio, string nombreSistema, 
    dobleFactorObtenerCodigoSeguridad(idPersona: number, opcionEnvio: string, nombreSistema: string, dobleFactorOff: string, correoUsuario : string, telefonoUsuario : string): Observable<IResultadoMetodo> {
        //environment.baseUrl
        //this.baseUrl
        const url = `${environment.baseUrl}C_DobleFactor/ObtenerCodigoSeguridad?idPersona=` + idPersona + '&opcionEnvio=' + opcionEnvio + '&nombreSistema=' + nombreSistema + '&dobleFactorOff=' + dobleFactorOff + '&correoUsuario=' + correoUsuario + '&telefonoUsuario=' + telefonoUsuario;
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.objtoken?.token
            })
        };
        return this.http.get<IResultadoMetodo>(url);
    }

    correoEnviar(objCorreo: ModeloCorreo): Observable<IResultadoMetodo> {
        const urlControladorCorreo : string = `${environment.baseUrl}C_Correo/EnviarCorreo`;
        
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http.post<IResultadoMetodo>(urlControladorCorreo,objCorreo);
    }
}
