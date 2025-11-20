import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { PrimeNgModule } from '../../shared/prime-ng.module';
import { iActivaDFM, iConfigurarDFM, iLoginIngreso, iLoginSalida, iUsuarioConfiguradoDFM, iVerificaCodigoOTP } from './ilogin';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Encabezado } from "../../shared/header/encabezado";
import { Seguridad } from '../../guards/seguridad/seguridad';
import { RegistroEventosServicio } from '../../services/registro.evento.service';
import { ModeloCorreo } from '../../interfaces/iSistema';

@Component({
    selector: 'login',
    templateUrl: 'login.html',
    styleUrl: 'login.css',
    standalone: true,
    imports: [ CommonModule, RouterModule, PrimeNgModule, NgxSpinnerModule, Encabezado ]
})

export class Login implements OnInit {
    @ViewChild('primerPaso', { static: false }) primerPaso!: ElementRef;
    
    imghref: string = "";

    frmLogin: FormGroup = this.fb.group({
        correocedula: ['', [Validators.required]],
        password: ['', [Validators.required]],
    })

    objLogin! : iLoginIngreso;

    _displaycambioclave: boolean = false;
    _nuevaClave: string = "";
    _nuevaClave2: string = "";
    objUsuarioLogin! : iLoginSalida;
    _displayLogin: boolean = true;
    _placeholder: string = 'Correo electrónico o cédula';

    _ptipologin: string = '';
    _botondisabled: boolean = false;
    _displayhelp: boolean = false;
    _nomostrarmsg: boolean = false;
    _idPersonaFromEncrypt: string = "";

    //Doble Factor
    _displayDobleFactor: boolean = false;
    _msgdeEnvio: string = "";
    _mostrarOpCorreo: boolean = false;
    _mostrarOpcionTel: boolean = false;
    _opEnvioSel: string = "";
    _opcionCorreo: string = "";
    _opcionTelefono: string = "";
    _panelSeleccionOpcionesyEnvio: boolean = false;
    _panelValidacionCodigo: boolean = true;
    _codigoSeguridadDigitado: string = "";
    _objUsuarioLogin! : iLoginSalida;
    _tiempoRestante: number = 0;
    _xIntervalo: any;
    _respuestaGeneracionCodigo: string = "";
    _dobleFactorOff: string = 'N';
    _displayTipoIngresoPSA20: boolean = false;
    _opcionesIngreso: any[] = [];
    _optIngresoSel: string = 'OR'; //OR-Oficina Regional | CL-Cliente
    _displaySeleccionCliente: boolean = false;
    _numeroCitaBuscar: string = '';
    _tokenUsuario: string = '';
    _correoElectronico : string = '';
    _numeroTelefono : string = '';

    _enlaceVideoParaMostrar! : string;

    private seguridad = inject(Seguridad);
    private log = inject(RegistroEventosServicio);

    private servicio = inject(AuthService);

    private _intervalo : any;

    habilitaBotonEnviarCodigo : boolean = true;
    radioButtonCorreo : boolean = false;
    radioButtonTelefono : boolean = false;

    arregloDeCaracteresEspeciales : string [] = ['<','>','&','"','/','?',':',';','|','(',')','\\','$','^'];

    _mostrarConfiguracionDFM : boolean = false;
    _mostrarDFM : boolean = false;
    _mostrarCorreo : boolean = false;
    _mostrarConfirmacionDeDFM : boolean = false;
    _mensajeDesdeConfiguracion! : string;
    _imagenDelQR! : string;

    private idUsuario! : string;
    private claveSecreta! : string;
    private vieneDesdeOpcionesDeAutenticacion : boolean = false;
    opcionSeleccionada! : string;
    _muestraSpinner : boolean = false;

    constructor(private route: Router, private fb: FormBuilder) { }

    ngOnInit(): void {
        this.imghref = environment.hrefimgs;

        let tmpl: string | null | undefined;
        tmpl = this.getParameterByName("zip");
        sessionStorage.clear();

        if (tmpl != null && tmpl != undefined && tmpl != '') {
            this.EncryptarDesencryptar('2', tmpl);
        }

        this._displaycambioclave = false;

        this._ptipologin = '-1';

        if (localStorage.getItem('msglogin') == null) {
            this._displayhelp = true;
        }

        this.mostrarVideosRandom();
    }

    mostrarVideosRandom() {
        const extencion : string = '.mp4';
        const nombreArchivo : string = 'videoFona';
        let numeroDeVideo : number = Math.floor(Math.random() * 3) + 1;
        let ruta : string = './assets/videos/';

        this._enlaceVideoParaMostrar = ruta + nombreArchivo + numeroDeVideo.toString() + extencion;
    }

    eligeOpcionEnvio(evento : any) {
        this.habilitaBotonEnviarCodigo = false;
    }

    getParameterByName(name: string, url = window.location.href): any {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    campoEsValido(campo: string) {
        return this.frmLogin.controls[campo].errors
            && this.frmLogin.controls[campo].touched;
    }

    validaCaracteresEspeciales() : boolean {
        let respuesta : boolean = false;
        const clave: string = this.frmLogin.controls['password'].value;

        this.arregloDeCaracteresEspeciales.forEach(item => {
            if (clave.includes(item)) {
                respuesta = true;
                Swal.fire('SICORE', 'ERROR: Su clave tiene caracteres no válidos en este sistema.', 'error');
            }
        })

        return respuesta;
    }

    ValidarCredenciales() {
        clearInterval(this._xIntervalo);

        if (this.frmLogin.invalid) {
            this.frmLogin.markAllAsTouched();
            return;
        }

        if(this.validaCaracteresEspeciales()) {
            return;
        }

        this.objLogin = {
            clave : this.frmLogin.controls['password'].value,
            correoCedula : this.frmLogin.controls['correocedula'].value
        }

        this._muestraSpinner = true;

        this.servicio.DoLogin(this.objLogin).subscribe({
            next: (respuesta) => {
                if(respuesta.idPersona != 0) {
                    this._objUsuarioLogin = respuesta;

                    this.servicio.obtenerConfiguracionDeDFM(this._objUsuarioLogin.idUsuario).subscribe({
                        next : configuracion => {
                            if(!configuracion.mfa.configurado) {

                                const credenciales : iConfigurarDFM = {
                                    correoUsuario : String(respuesta.correoUsuario),
                                    idUsuario : String(respuesta.idUsuario)
                                }
                                
                                this.servicio.configurarDobleFactorMicrosoft(credenciales).subscribe({
                                    next : configuracion => {
                                        if(configuracion.success) {

                                            this._mostrarConfiguracionDFM = true;
                                            this._mensajeDesdeConfiguracion = configuracion.mensaje;
                                            this._imagenDelQR = `${environment.enlaceParaGenerarQR}${configuracion.qrUri}`;
                                            this.idUsuario = String(respuesta.idUsuario);
                                            this.claveSecreta = configuracion.claveSecreta;
            
                                            this.cuandoApareceElCuadroDeAutenticacion();
                                        }
                                    },
                                    error : err => {
                                        console.error(err);
                                    }
                                });

                            } else {
                                this.configuradaLaEntradaPorQR(configuracion);
                            }
                        },
                        error : err => {
                            console.error(err);
                        } 
                    })

                } else {
                    Swal.fire('SICORE', 'ATENCIÓN: Las credenciales ingresadas son inválidas. Favor verificar.', 'error').then(()=>{
                        this._muestraSpinner = false;
                    })
                }
            },
            error : (err) => {
                console.error(err);
            }
        })
    }

    cuandoApareceElCuadroDeAutenticacion() {
        const intervalo = setInterval(()=>{
            if(document.querySelectorAll('.code-input')) {
                clearInterval(intervalo);

                const entradas : NodeListOf<HTMLInputElement> = document.querySelectorAll('.code-input');
                                    
                entradas.forEach((entrada : HTMLInputElement, indice : number) => {
                    entrada.addEventListener('input', () => {
                        if (entrada.value.length === 1 && indice < entradas.length - 1) {
                            entradas[indice + 1].focus();
                        }
        
                        if (this.estanTodasLasEntradasLlenas()) {
                            if(document.getElementById('botonDeVerificacionParaConfigurar')) {
                                (<HTMLButtonElement>document.getElementById('botonDeVerificacionParaConfigurar')).focus();
                            }
                            if(document.getElementById('botonDeVerificacion')) {
                                (<HTMLButtonElement>document.getElementById('botonDeVerificacion')).focus();
                            }
                        }
                    });
                    
                    entrada.addEventListener('keydown', (e : KeyboardEvent) => {
                        if (e.key === 'Backspace' && entrada.value === '' && indice > 0) {
                            entradas[indice - 1].focus();
                        }
                    });
                });
                    
                if (entradas.length > 0) {
                    entradas[0].focus();
                }

                this.enfocarPrimerPaso();
                   
                this.cuandoSeDigitaElCodigo();
            }
        },100)
    }

    enfocarPrimerPaso() {
        if (this.primerPaso && this.primerPaso.nativeElement) {
            
            this.primerPaso.nativeElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            this.primerPaso.nativeElement.classList.add('paso-destacado');
            
            setTimeout(() => {
                this.primerPaso.nativeElement.classList.remove('paso-destacado');
            }, 500);
        }
    }

    cuandoSeDigitaElCodigo() {
        const intervalo = setInterval(()=>{
            clearInterval(intervalo);

            const entradas : NodeListOf<HTMLInputElement> = document.querySelectorAll('.code-input');
            const that = this;
    
            entradas.forEach((entrada : HTMLInputElement) => {
                entrada.addEventListener('input', function(this : HTMLInputElement) {
                    if(this.value.length === 1) {
                        this.classList.add('filled');
                        that.focoEnLaSiguienteEntrada(this);
                    } else if (this.value.length > 1) {
                        this.value = this.value.charAt(0);
                        that.focoEnLaSiguienteEntrada(this);
                    }
                })
            })
    
            entradas.forEach((entrada : HTMLInputElement) => {
                entrada.addEventListener('keydown', this.controlaCuandoSePresionaUnaTecla.bind(this))
            })
        },150)

    }

    controlaCuandoSeTecleaUnDigito(evento : any) {
        const target = evento.target as HTMLInputElement;

        if(target.value.length === 1) {
            target.classList.add('filled');
            this.focoEnLaSiguienteEntrada(target);
        } else if(target.value.length > 1) {
            target.value = target.value.charAt(0);
            this.focoEnLaSiguienteEntrada(target);
        }
    }

    controlaCuandoSePresionaUnaTecla(evento : KeyboardEvent) {
        const target = evento.target as HTMLInputElement;

        if (evento.key.length === 1 && !evento.key.match(/[0-9]/)) {
            evento.preventDefault();
            return;
        }

        if (evento.key === 'Backspace') {
            if (target.value === '') {
                this.focoEnLaEntradaPrevia(target);
            } else {
                target.value = '';
                target.classList.remove('filled');
            }
            evento.preventDefault();
        }

        if (evento.key === 'ArrowLeft') {
            this.focoEnLaEntradaPrevia(target);
            evento.preventDefault();
        }
        
        if (evento.key === 'ArrowRight') {
            this.focoEnLaSiguienteEntrada(target);
            evento.preventDefault();
        }
    }

    focoEnLaSiguienteEntrada(entrada : HTMLInputElement) {
        const proximaEntrada = entrada.nextElementSibling as HTMLInputElement;
        if (proximaEntrada && proximaEntrada.classList.contains('code-input')) {
            proximaEntrada.focus();
        }
    }

    focoEnLaEntradaPrevia(entrada : HTMLInputElement) {
        const prevEntrada = entrada.previousElementSibling as HTMLInputElement;
        if (prevEntrada && prevEntrada.classList.contains('code-input')) {
            prevEntrada.focus();
        }
    }

    verificaAndCompleta() {
        if(this.estanTodasLasEntradasLlenas()) {
            const codigoDigitado = this.tomaLosDatosDeLasEntradas();

            const credencialesParaActivarElDFM : iActivaDFM = {
                claveSecreta : this.claveSecreta,
                codigoOTP : codigoDigitado,
                idUsuario : String(this._objUsuarioLogin.idUsuario)
            }

            this.servicio.activaElDFM(credencialesParaActivarElDFM).subscribe({
                next : respuestaDeLaActivacion => {
                    if(respuestaDeLaActivacion.success) {
                        this._mostrarConfiguracionDFM = false;

                        sessionStorage.setItem('token', JSON.stringify(this._objUsuarioLogin!));
                        this.iniciaIngresoSegunUsuario();
                    }
                },
                error : err => console.error(err)
            })
        }
    }

    estanTodasLasEntradasLlenas() : boolean {
        const entradas : NodeListOf<HTMLInputElement> = document.querySelectorAll('.code-input');

        return Array.from(entradas).every(entrada => entrada.value.length == 1);
    }

    tomaLosDatosDeLasEntradas() : string {
        const entradas : NodeListOf<HTMLInputElement> = document.querySelectorAll('.code-input');
        const codigoDigitado : string = Array.from(entradas).map(entrada => entrada.value).join('');

        return codigoDigitado;
    }

    entraEnLasOpcionesDeLogueo(evento : any) {
        const innerHTML : string = evento.target.innerHTML.toString();
        if(innerHTML.includes('Correo electrónico')) {
            this.opcionSeleccionada = 'email';
        } else {
            this.opcionSeleccionada = 'authenticator';
        }
    }

    configuradaLaEntradaPorQR(configuracion : iUsuarioConfiguradoDFM) {
        if((configuracion.correo.habilitado) && (configuracion.correo.configurado)) this._mostrarCorreo = true;
        
        this._mostrarDFM = true;
        this.vieneDesdeOpcionesDeAutenticacion = false;
        const that = this;
        
        const intervalo = setInterval(()=>{
            if(document.querySelectorAll('.option')) {
                clearInterval(intervalo);

                const opciones = document.querySelectorAll<HTMLElement>('.option');
                that.opcionSeleccionada = 'authenticator';
        
                opciones.forEach(opcion => {
                    opcion.addEventListener('click', function(this: HTMLElement) {
                        opciones.forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');

                        that.opcionSeleccionada = this.getAttribute('data-value') || 'authenticator';
                    });
                });
            }
        },100)
    }

    EnviarCodigoSeguridad() {
        this._displayDobleFactor = true;
        this._panelSeleccionOpcionesyEnvio = true;
        this._panelValidacionCodigo = false;

        this._tokenUsuario = this._objUsuarioLogin.token;
        this._correoElectronico = this._objUsuarioLogin.correoUsuario;
        this._numeroTelefono = this._objUsuarioLogin.telefonoMovil;

        var respuesta: string[] = [];

        var contador: number = 0;
        
        this._panelSeleccionOpcionesyEnvio = false;
        this._panelValidacionCodigo = true;
        this._respuestaGeneracionCodigo = "";

        this.servicio.dobleFactorObtenerCodigoSeguridad(this._objUsuarioLogin.idPersona, 'E', 'SICORE', this._dobleFactorOff, this._correoElectronico, this._numeroTelefono).subscribe({
            next: (r) => {
                const codigo : string = r.valor.split('|')[1];

                console.log(codigo);
                //alert(codigo);

                this._respuestaGeneracionCodigo = r.valor;
                respuesta = r.valor.split('|');
                
                if (respuesta[0] == "1") {
                    this._respuestaGeneracionCodigo = r.valor;

                    contador = Number(respuesta[3]);

                    this._xIntervalo = setInterval(() => {
                        this._tiempoRestante = contador--;
                        if (this._displayDobleFactor == false) {
                            clearInterval(this._xIntervalo);
                        }
                        if (contador == 0) {
                            clearInterval(this._xIntervalo);
                            this._panelSeleccionOpcionesyEnvio = true;
                            this._panelValidacionCodigo = false;

                            Swal.fire('SICORE', 'ATENCIÓN: El tiempo para ingresar el código de seguridad expiró. Vuelva a generarlo.');
                        }
                    }, 1000);
                }
                else {
                    Swal.fire('SICORE', r.descripcion);
                }
            }
        })
    }

    continuaConElLogin() {
        this._mostrarDFM = false;
        this.vieneDesdeOpcionesDeAutenticacion = true;
        
        if(this.opcionSeleccionada === 'email') {
            this.EnviarCodigoSeguridad();
            this.cuandoApareceElCuadroDeAutenticacion();
        } else {
            this._mostrarConfirmacionDeDFM = true;
            
            this.cuandoApareceElCuadroDeAutenticacion();
            this.cuandoSeDigitaElCodigo();
        }
    }

    verificaParaIniciar() {
        const codigoOTP = this.tomaLosDatosDeLasEntradas();
        const credenciales : iVerificaCodigoOTP = {
            codigoOTP : codigoOTP,
            idUsuario : String(this._objUsuarioLogin.idUsuario)
        }

        this.servicio.verificaCodigoOTP(credenciales).subscribe({
            next : respuestaDeLaVerificacion => {
                if(respuestaDeLaVerificacion.success) {
                    sessionStorage.setItem('token', JSON.stringify(this._objUsuarioLogin!));
                    this.iniciaIngresoSegunUsuario();
                }
            },
            error : err => console.error(err)
        })
    }

    ValidarCodigoSeguridad() {
        let arrayRespuesta = this._respuestaGeneracionCodigo.split('|');
        let fechaExpira: Date = new Date();
        let strFechaExpira: string = fechaExpira.getFullYear().toString() + this.formatMesDia((fechaExpira.getMonth() + 1).toString()) + this.formatMesDia(fechaExpira.getDate().toString());
        const codigoSeguridadDigitado = this.tomaLosDatosDeLasEntradas();

        if (codigoSeguridadDigitado == arrayRespuesta[1]) {
            clearInterval(this._xIntervalo);
            sessionStorage.setItem('token', JSON.stringify(this._objUsuarioLogin!));
            let tmpstr: string[] = [];

            this.iniciaIngresoSegunUsuario();
            
            //this.log.setEvento('Login - ValidarCodigoSeguridad()', 'Ingresa al sistema.')
            // this.servicio.usuarioEncryptarDesencryptar("1", this._objUsuarioLogin!.idPersona + '|' + strFechaExpira, 'N').subscribe({
            //     next: (r2) => {
            //         if (r2.valor != '-1') {
            //             tmpstr = r2.valor.split(',');
            //             sessionStorage.setItem('zip', tmpstr[0]);
            //             this.log.setEvento('Login - ValidarCodigoSeguridad()', 'Ingresa al sistema.')
            //             this.route.navigate(['dashboard']);
            //         }
            //     }
            // })
            // if (this._objUsuarioLogin!.requiereActualizar == 'S') {
            //     this._nuevaClave = '';
            //     this._nuevaClave2 = '';
            //     this._displayLogin = false;
            //     this._displayDobleFactor = false;
            //     this.objUsuarioLogin = this._objUsuarioLogin;
            // }

        } else {
            Swal.fire('SICORE', 'ATENCIÓN: El código de seguridad ingresado no es correcto. Favor de verificarlo.', 'error');
        }
    }

    volverMostrarDFM() {
        this._mostrarConfirmacionDeDFM = false;
        this._displayDobleFactor = false;
        this._mostrarDFM = true;
        this.vieneDesdeOpcionesDeAutenticacion = false;
    }

    cierraLaVentanaDeConfiguracion() {
        location.reload();
    }

    cierraOpcionesDeAutenticacion() {
        if(!this.vieneDesdeOpcionesDeAutenticacion) {
            location.reload();
        }
    }

    iniciaIngresoSegunUsuario() {
        switch(this._objUsuarioLogin.idPerfil) {
            case 1:
                this.route.navigate(['dashboard']);
                break;
            case 2:
                this.route.navigate(['dashboard']);
                break;
            case 3:
                this.route.navigate(['formalizacion/listar']);
                break;
            case 4:
                this.route.navigate(['dashboard']);
                break;
            case 5:
                this.route.navigate(['certificados/listar']);
                break;
            case 6:
                this.route.navigate(['dashboard']);
                break;
            case 7:
                this.route.navigate(['dashboard']);
                break;
            case 8:
                this.route.navigate(['formalizacion/listar']);
                break;
            case 9:
                this.route.navigate(['dashboard']);
                break;
            case 10:
                this.route.navigate(['formalizacion/listar']);
                break;
        }
    }

    //#region Para otros sistemas ajeno de SICORE

    iniciaPorEmail(){
        this._displayDobleFactor = true;
        this._panelSeleccionOpcionesyEnvio = true;
        this._panelValidacionCodigo = false;

        this._tokenUsuario = this._objUsuarioLogin.token;
        this._correoElectronico = this._objUsuarioLogin.correoUsuario;
        this._numeroTelefono = this._objUsuarioLogin.telefonoMovil;

        if (this._objUsuarioLogin.telefonoMovil != null && this._objUsuarioLogin.telefonoMovil != 'null' && this._objUsuarioLogin.telefonoMovil != '') {
            this._msgdeEnvio = "SICORE requiere generar y enviar un código de seguridad para validar su ingreso. Favor seleccione el medio por el cual desea recibir el código: ";
            this._mostrarOpCorreo = true;
            this._mostrarOpcionTel = true;
            this._opcionCorreo = this.DoMascaraOpcionEnvio(this._objUsuarioLogin.correoUsuario);
            this._opcionTelefono = this.DoMascaraOpcionEnvio(this._objUsuarioLogin.telefonoMovil);
            this.radioButtonCorreo = false;
            this.radioButtonTelefono = false;
        } else {
            this._msgdeEnvio = "SICORE requiere generar y enviar un código de seguridad para validar su ingreso. El código será enviado al siguiente correo electrónico: ";
            this._mostrarOpCorreo = true;
            this._mostrarOpcionTel = false;
            this._opcionCorreo = this.DoMascaraOpcionEnvio(this._objUsuarioLogin.correoUsuario);
            this._opEnvioSel = this.DoMascaraOpcionEnvio(this._objUsuarioLogin.correoUsuario);
            this._opcionTelefono = "";
            this.radioButtonCorreo = false;
            this.radioButtonTelefono = false;
        }
    }

    DoMascaraOpcionEnvio(opcionEnvio : string) : string {
       let retornaMascara : string = '';

        if (opcionEnvio.length > 0) {
            if (opcionEnvio.indexOf('@') > 0) {
                const cuentaCorreo : string = opcionEnvio.split('@')[0];
                if(cuentaCorreo.includes('.')){
                    cuentaCorreo.split('.').forEach(item => {
                        let inicioPalabra : string = item.slice(0, 1);
                        retornaMascara = retornaMascara + inicioPalabra + 'xxx' + item.slice(4, item.length) + '.';
                    })
                    retornaMascara = retornaMascara.substring(0, retornaMascara.length-1) + '@' + opcionEnvio.split('@')[1];
                } else {
                    const inicioPalabra : string = opcionEnvio.slice(0, 1);
                    retornaMascara = inicioPalabra + 'xxx' + opcionEnvio.slice(4, opcionEnvio.length);
                }
            }
            else {
                retornaMascara = 'xxxxxx' + opcionEnvio.slice(7, opcionEnvio.length);
            }
        }
        return retornaMascara;
    }

    formatMesDia(v: string): string {
        var r: string = '';
        if (v.length == 1) {
            r = '0' + v;
        }
        else {
            r = v;
        }
        return r;
    }

    Validarquecontengaletrasynumeros(texto: string): boolean {
        var r: boolean = false;
        var letras = /^[a-zA-Z]+$/;
        var numeros = /^[0-9]+$/;
        //var tmp=texto.match(letras);
        if (/[a-zA-Z]/.test(texto)) {
            if (/[0-9]/.test(texto)) {
                r = true;
            }

        }

        return r;
    }

    Validarqueletrasynumerosnoserepiten(texto: string): boolean {
        var r: boolean = true;

        r = !/(.).*\1/.test(texto);

        return r;
    }

    Validarqnocontengapalabrafona(texto: string): boolean {
        var r: boolean = false;
        if (texto.indexOf('fona') == -1 && texto.indexOf('FONA') == -1 && texto.indexOf('fonafifo') == -1 && texto.indexOf('FONAFIFO') == -1) {
            r = true;
        }
        return r;
    }

    CambiarClaveUsuario() {

        if (this._nuevaClave == this._nuevaClave2) {//Se cumple la comparación de las contraseñas

            if (this._nuevaClave.length >= 8) {//Se cumple el largo mínimo de la contraseña

                if (this.Validarquecontengaletrasynumeros(this._nuevaClave) == true) {//Se cumple que contenga letras y numeros

                    if (this.Validarqueletrasynumerosnoserepiten(this._nuevaClave) == true) { //Se cumple que las letras y los números no se repitan

                        if (this.Validarqnocontengapalabrafona(this._nuevaClave) == true) {//Se cumple que no contenga la palabra fona o fonafifo
                            
                            const objU : iLoginIngreso = {
                                correoCedula : this.objUsuarioLogin.correoUsuario,
                                clave: this._nuevaClave
                            }

                            this.servicio.usuarioActualizarClave(objU).subscribe({
                                next: (r) => {
                                    if (r.valor == "1") { //La contraseña se actualizó exitosamente
                                        Swal.fire('SICORE', r.descripcion, 'success');
                                        this.frmLogin.patchValue({
                                            password: ''
                                        })
                                        this._displayLogin = true;

                                        var hoy: Date = new Date();
                                        var asuntomsg: string = 'Actualización de Contraseña';
                                        var mensaje: string = 'Estimado usuario:</strong>Usted acaba de actualizar su contraseña de acceso a:' + this._nuevaClave;
                                        var cuerpo: string = "<table width='80%' align='center' style='border:1px solid #acaaaa;background:#FFF;'><tr><td height='69'><img src = 'http://sipsa.fonafifo.com/PPSA/Imagenes/Banners/Logo-Banco-Color.jpg' height='100%' style='padding-left:40px' ></td><td style='font-family:Arial,Helvetica,sans-serif;font-size:16px;text-align:center;color:#592500;'>Solicitud de Ingreso<br><strong>SICORE</strong></td></tr><tr><td colspan='2'><hr></td></tr><tr><td colspan='2' align='center'><table width='100%' align='center' style='background:#FFF;'><tr><td style='width:100px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:right;color:#592500;border:1px dotted #888;'> Asunto: </td><td style='font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#592500;border:1px dotted #888;'>" + asuntomsg + "</td></tr><tr><td valign='top' style='width:100px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:right;color:#592500;border:1px dotted #888;'> Mensaje:</td><td style='font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#592500;border:1px dotted #888;'>Fecha:" + this.formatDate(hoy) + "<br/><br/>" + mensaje + "<br/><br/></td></tr></table></td></tr></table>";
                                        
                                        this.EnviarCorreo(this.objUsuarioLogin.correoUsuario, this.objUsuarioLogin.idPersona, asuntomsg, cuerpo, false)
                                    }
                                    else {
                                        if (r.valor == "-1") {//La contraseña digitada ya fue utilizada en las últimas 6
                                            Swal.fire('SICORE', r.descripcion, 'warning');
                                        }
                                        else {
                                            if (r.valor == "2") {//No se puede utilizar la contraseña temporal
                                                Swal.fire('SICORE', r.descripcion, 'warning');
                                            }
                                            else {
                                                Swal.fire('SICORE', r.descripcion, 'error');
                                            }

                                        }
                                    }
                                }
                            })

                        }
                        else {
                            Swal.fire('SICORE', 'ATENCIÓN: La contraseña no debe contener la palabra "fona" o "Fonafifo".', 'warning');
                        }
                    }
                    else {
                        Swal.fire('SICORE', 'ATENCIÓN: No puede repetir letras ni números.', 'warning');
                    }
                }
                else {
                    Swal.fire('SICORE', 'ATENCIÓN: La contraseña debe contener letras y números.', 'warning');
                }
            }
            else {
                Swal.fire('SICORE', 'ATENCIÓN: La contraseña debe ser mayor o igual a 8 caracteres.', 'warning');
            }
        }
        else {
            Swal.fire('SICORE', 'ATENCIÓN: Las contraseñas digitadas no son iguales.', 'warning');
        }
    }

    //Estas funciones se utilizan para dar formato a la fecha que será enviada en el mensaje de cambio y actualización de contraseña
    padTo2Digits(num: Number) {
        return num.toString().padStart(2, '0');
    }

    formatDate(date: Date) {
        return (
            [
                date.getFullYear(),
                this.padTo2Digits(date.getMonth() + 1),
                this.padTo2Digits(date.getDate()),
            ].join('-') +
            ' ' +
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes()),
                this.padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    ReenviarClave() {
        if (this.frmLogin.controls['correocedula'].value != '') {
            Swal.fire({
                title: 'SICORE',
                text: 'A continuación se le enviará al correo asociado una solicitud para re-envío de contraseña. ¿Desea continuar?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sí, continuar.'
            }).then((result) => {
                if (result.isConfirmed) {

                    var hoy: Date = new Date();
                    var asuntomsg: string = 'Solicitud de re-envío de contraseña';

                    var mensaje: string = 'Estimado usuario:</strong> Se ha generado una solicitud de re-envío de contraseña. Para confirmar esta operación, haga clic en el enlace que se muestra a continuación. En caso de no querer continuar, omita este correo.<br/><br/><a href="' + this.servicio.baseUrl + 'C_Login/ResetearClaveUsuario?cedulaCorreo=' + this.frmLogin.controls['correocedula'].value + '" target="_blank" style="color:green;">Haga clic aquí para restablecer su contraseña</a>';
                    var cuerpo: string = "<table width='80%' align='center' style='border:1px solid #acaaaa;background:#FFF;'><tr><td height='69'><img src = 'http://sipsa.fonafifo.com/PPSA/Imagenes/Banners/Logo-Banco-Color.jpg' height='100%' style='padding-left:40px' ></td><td style='font-family:Arial,Helvetica,sans-serif;font-size:16px;text-align:center;color:#592500;'>Solicitud de Ingreso <br><strong>SICORE</strong></td></tr><tr><td colspan='2'><hr></td></tr><tr><td colspan='2' align='center'><table width='100%' align='center' style='background:#FFF;'><tr><td style='width:100px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:right;color:#592500;border:1px dotted #888;'> Asunto: </td><td style='font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#592500;border:1px dotted #888;'>" + asuntomsg + "</td></tr><tr><td valign='top' style='width:100px;font-family:Arial,Helvetica,sans-serif;font-size:13px;text-align:right;color:#592500;border:1px dotted #888;'> Mensaje:</td><td style='font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#592500;border:1px dotted #888;'>Fecha:" + this.formatDate(hoy) + "<br/><br/>" + mensaje + "<br/><br/></td></tr></table></td></tr></table>";
                    
                    this.EnviarCorreo(this.frmLogin.controls['correocedula'].value, 0, asuntomsg, cuerpo, true);
                }
            })
        }
        else {
            Swal.fire('SICORE', 'ATENCIÓN: Debe ingresar un correo electrónico o un número de identificación.', 'info');
        }

    }

    EnviarCorreo(correo: string, idPersona: number, asunto: string, cuerpo: string, mostrarmensaje: boolean) {
        let objCorreo : ModeloCorreo = {
            asunto : asunto,
            cuerpoCorreo : cuerpo,
            correo : correo,
            idPersonaEnvia : idPersona
        }

        this.servicio.correoEnviar(objCorreo).subscribe({
            next: (r) => {
                if (r.valor != '1') {
                    Swal.fire('SICORE', r.descripcion, 'error');
                } else {
                    if (mostrarmensaje == true) {
                        Swal.fire('SICORE', 'La solicitud de re-envío de contraseña se envió exitosamente. Favor ingresar a su correo y confirmar la operación.', 'success');
                    }
                }
            },
            error : (err) => console.error(err)
        })
    }

    OnChangeNoMostrarMsg(e: any) {
        if (this._nomostrarmsg == true) {
            localStorage.setItem('msglogin', '1');
            this._displayhelp = false;
        }
    }

    getstatuslocalstorage(): boolean {
        var r: boolean = true;
        if (localStorage.getItem('msglogin') != null) {
            r = false;
        }

        return r;
    }

    CerrarVentana() {
        this._displayLogin = true;
    }

    EncryptarDesencryptar(op: string, valor: string) {
        let tmpstr: string[] = [];
        let strfecha: string = "";
        let hoy: Date = new Date();

        this.servicio.usuarioEncryptarDesencryptar(op, valor, 'N').subscribe({
            next: (r) => {

                if (r.valor != '-1') {
                    tmpstr = r.valor.split(',');
                    
                    this._idPersonaFromEncrypt = tmpstr[0];
                    this.objLogin.correoCedula = tmpstr[1];
                    this.objLogin.clave = tmpstr[2];
                    strfecha = tmpstr[3];

                    console.log(strfecha.substring(0, 4) + ' | ' + strfecha.substring(4, 6) + ' | ' + strfecha.substring(6, 8));
                    
                    let fechaExpira: Date = new Date(Number(strfecha.substring(0, 4)), Number(strfecha.substring(4, 6)) - 1, Number(strfecha.substring(6, 8)));
                    console.log(fechaExpira.toDateString());

                    if (hoy.toDateString() == fechaExpira.toDateString()) {
                        //this.objLogin.tipologin = '3';
                        sessionStorage.setItem('zip', valor);

                        this.servicio.DoLogin(this.objLogin).subscribe({
                            next: (r2) => {
                                sessionStorage.setItem('token', JSON.stringify(r2!));
                                this.route.navigate(['dashboard']);
                            }
                        })
                    }
                    else {
                        Swal.fire('SICORE', 'ATENCIÓN: El código de acceso utilizado ya expiró. Favor de validar sus credenciales.');
                    }
                }
            }
        })
    }

    MostrarSeleccionCliente(e: any) {
        console.log(e)
        if (this._optIngresoSel == 'CL') {
            this._displaySeleccionCliente = true;
        }
        else {
            this._displaySeleccionCliente = false;
        }
    }

    //#endregion

}