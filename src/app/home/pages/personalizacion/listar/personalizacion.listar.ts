import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { iDirectorEjecutivo, iPersonalizacion } from "../interfaces/iPersonalizacion";
import { PersonalizacionServicio } from "../servicio/personalizacion.servicio";
import Swal from "sweetalert2";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { iSubirArchivoAlExpediente } from "../../certificacion/interfaces/iCertificacion";
import { MessageService } from "primeng/api";
import { CertificacionServicio } from "../../certificacion/servicio/certificacion.servicio";
import { Router } from "@angular/router";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { environment } from "../../../../../environments/environment";

@Component({
    selector : 'listar-personalizacion',
    templateUrl : 'personalizacion.listar.html',
    styleUrl : 'personalizacion.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule, PdfViewerModule],
    providers: [MessageService]
})

export class ListarPersonalizacion implements OnInit {

    private _personalizacion! : iPersonalizacion;
    private _idPersonalizacion : number = 0;

    private servicioCertificados = inject(CertificacionServicio);

    _leyendaDescriptivaCotizacionEspannol! : string;
    _leyendaDescriptivaCotizacionIngles! : string;

    _leyendaFinalidadCotizacionEspannol! : string;
    _leyendaFinalidadCotizacionIngles! : string;

    _leyendaDescripcionCertificadoEspannol! : string;
    _leyendaDescripcionCertificadoIngles! : string;

    _correoGerenciaEjecutiva! : string;

    _desHabilitaGuardar : boolean = false;

    _invalidaDescripcionCotizacion : boolean = false;
    _invalidaDescripcionCotizacionIngles : boolean = false;
    _invalidaFinalidadCotizacion : boolean = false;
    _invalidaFinalidadCotizacionIngles : boolean = false;
    _invalidaDescripcionCertificado : boolean = false;
    _invalidaDescripcionCertificadoIngles : boolean = false;
    _invalidaCorreoGerenciaEjecutiva : boolean = false;

    _vistaSubidaPermanencia : boolean = false;
    _vistaSubidaCC : boolean = false;
    _vistaExpediente : boolean = false;
    archivos : any[] = [];
    _archivoValidos : boolean = false;

    _urlDelExpedienteUno! : string;
    _urlDelExpedienteDos! : string;
    _urlDelExpedienteTres! : string;

    _permanencia! : string;
    _cambioClimatico! : string;
    _nombreExpedienteTres! : string;

    _verExpedienteUno : boolean = false;
    _verExpedienteDos : boolean = false;
    _verExpedienteTres : boolean = false;

    _informacionProyecto! : string;
    _verProyecto : boolean = false;
    _urlDelProyecto ! : string;

    _directores! : iDirectorEjecutivo [];
    _director! : string;

    _esAsistente : boolean = false;
    
    constructor (private srv : PersonalizacionServicio, private ref : ChangeDetectorRef, private servicioMensaje : MessageService, private router : Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        if(perfil == 5) this._esAsistente = true;
        
        if((perfil !== 1) && (perfil !== 9) && (perfil !== 6) && (perfil !== 7) && (perfil !== 5)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.traeDirectores();

        const intervalo = setInterval(() => {
            if(document.getElementById('leyendaDescripcionCertificadoEspannol')){
                clearInterval(intervalo);

                this.srv.listarPersonalizacion().subscribe({
                    next : (personalizacion) => {
                        if(personalizacion.length != 0){
                            this._personalizacion = personalizacion[0];

                            this._idPersonalizacion = this._personalizacion.idPersonalizacion;
            
                            this._leyendaDescriptivaCotizacionEspannol = this._personalizacion.leyendaDescriptivaCotizacionEspannol;
                            this._leyendaDescriptivaCotizacionIngles = this._personalizacion.leyendaDescriptivaCotizacionIngles;

                            this._leyendaFinalidadCotizacionEspannol = this._personalizacion.leyendaFinalidadCotizacionEspannol;
                            this._leyendaFinalidadCotizacionIngles = this._personalizacion.leyendaFinalidadCotizacionIngles;
                            
                            this._leyendaDescripcionCertificadoEspannol = this._personalizacion.leyendaDescripcionCertificadoEspannol;
                            this._leyendaDescripcionCertificadoIngles = this._personalizacion.leyendaDescripcionCertificadoIngles;
                            
                            this._correoGerenciaEjecutiva = this._personalizacion.correoGerenciaEjecutiva;

                            this._director = this._personalizacion.directorEjecutivo;
                            const intervalo = setInterval(()=>{
                                if(document.getElementById('emailEjecutivo')) {
                                    clearInterval(intervalo);
                                    (<HTMLOptionElement>document.getElementById(this._director)).selected = true;
                                }
                            },300);
                            
                            this.ref.detectChanges();
                        }
                    },
                    error : (err) => console.error(err)
                });
            } else {
                if(document.getElementById('emailEjecutivo')) {
                    clearInterval(intervalo);

                    this.srv.listarPersonalizacion().subscribe({
                        next : (personalizacion) => {
                            if(personalizacion.length != 0){
                                this._personalizacion = personalizacion[0];

                                this._idPersonalizacion = this._personalizacion.idPersonalizacion;
                                this._director = this._personalizacion.directorEjecutivo;
                                this._correoGerenciaEjecutiva = this._personalizacion.correoGerenciaEjecutiva;
                                
                                const intervalo = setInterval(()=>{
                                    if(document.getElementById('emailEjecutivo')) {
                                        clearInterval(intervalo);
                                        (<HTMLOptionElement>document.getElementById(this._director)).selected = true;
                                    }
                                },300);

                                this.ref.detectChanges();
                            }
                        },
                        error : (err) => console.error(err)
                    });
                    
                }
            }
        }, 300)
    }

    traeDirectores() {
        this.srv.obtenerListadoDeDirectores().subscribe({
            next : directores => {
                this._directores = directores;
            }
        })
    }

    salvarPersonalizacion() {
        if(this._esAsistente) {
            this.salvarPersonalizacionAsistenteEjecutiva();
            return;
        }

        if(!this.validacion()) {
            this._desHabilitaGuardar = true;
            return;
        };

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario : number = valorSesion.idUsuario;

        const personalizacionToSalvar : iPersonalizacion = {
            idFuncionario : idFuncionario,
            idPersonalizacion : this._idPersonalizacion,
            leyendaDescripcionCertificadoEspannol : (<HTMLTextAreaElement>document.getElementById('leyendaDescripcionCertificadoEspannol')).value,
            leyendaDescripcionCertificadoIngles : (<HTMLTextAreaElement>document.getElementById('leyendaDescripcionCertificadoIngles')).value,
            leyendaDescriptivaCotizacionEspannol : (<HTMLTextAreaElement>document.getElementById('leyendaDescriptivaCotizacionEspannol')).value,
            leyendaDescriptivaCotizacionIngles : (<HTMLTextAreaElement>document.getElementById('leyendaDescriptivaCotizacionIngles')).value,
            leyendaFinalidadCotizacionEspannol : (<HTMLTextAreaElement>document.getElementById('leyendaFinalidadCotizacionEspannol')).value,
            leyendaFinalidadCotizacionIngles : (<HTMLTextAreaElement>document.getElementById('leyendaFinalidadCotizacionIngles')).value,
            logoPrincipal : '',
            logoSecundario : '',
            logoSistema : '',
            tercerLogo : '',
            correoGerenciaEjecutiva : (<HTMLTextAreaElement>document.getElementById('emailEjecutivo')).value,
            directorEjecutivo : this._director
        }

        this.srv.actualizaPersonalizacion(personalizacionToSalvar).subscribe({
            next : (respuesta) => {
                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El registro se actualizó exitosamente.','success').then(()=>{
                        location.reload();
                    });
                }
            },
            error : (err) => console.error(err)
        })
    }

    salvarPersonalizacionAsistenteEjecutiva() {
        if(!this.validacionParaAsistenteEjecutiva()) {
            this._desHabilitaGuardar = true;
            return;
        };

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario : number = valorSesion.idUsuario;

        const personalizacionToSalvar : iPersonalizacion = {
            idFuncionario : idFuncionario,
            idPersonalizacion : this._idPersonalizacion,
            leyendaDescripcionCertificadoEspannol : this._personalizacion.leyendaDescripcionCertificadoEspannol,
            leyendaDescripcionCertificadoIngles : this._personalizacion.leyendaDescripcionCertificadoIngles,
            leyendaDescriptivaCotizacionEspannol : this._personalizacion.leyendaDescriptivaCotizacionEspannol,
            leyendaDescriptivaCotizacionIngles : this._personalizacion.leyendaDescriptivaCotizacionIngles,
            leyendaFinalidadCotizacionEspannol : this._personalizacion.leyendaFinalidadCotizacionEspannol,
            leyendaFinalidadCotizacionIngles : this._personalizacion.leyendaFinalidadCotizacionIngles,
            logoPrincipal : '',
            logoSecundario : '',
            logoSistema : '',
            tercerLogo : '',
            correoGerenciaEjecutiva : (<HTMLTextAreaElement>document.getElementById('emailEjecutivo')).value,
            directorEjecutivo : this._director
        }

        this.srv.actualizaPersonalizacion(personalizacionToSalvar).subscribe({
            next : (respuesta) => {
                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El registro se actualizó exitosamente.','success').then(()=>{
                        location.reload();
                    });
                }
            },
            error : (err) => console.error(err)
        })
    }

    validacion() : boolean {
        const leyendaDescripcionCertificadoEspannol : string = (<HTMLTextAreaElement>document.getElementById('leyendaDescripcionCertificadoEspannol')).value;
        if(leyendaDescripcionCertificadoEspannol == '') {
            this._invalidaDescripcionCertificado = true;
            return false;
        }
        
        const leyendaDescripcionCertificadoIngles : string = (<HTMLTextAreaElement>document.getElementById('leyendaDescripcionCertificadoIngles')).value;
        if(leyendaDescripcionCertificadoIngles == '') {
            this._invalidaDescripcionCertificadoIngles = true;
            return false;
        }
        
        const leyendaDescriptivaCotizacionEspannol : string = (<HTMLTextAreaElement>document.getElementById('leyendaDescriptivaCotizacionEspannol')).value;
        if(leyendaDescriptivaCotizacionEspannol == '') {
            this._invalidaDescripcionCotizacion = true;
            return false;
        }
        
        const leyendaDescriptivaCotizacionIngles : string = (<HTMLTextAreaElement>document.getElementById('leyendaDescriptivaCotizacionIngles')).value;
        if(leyendaDescriptivaCotizacionIngles == '') {
            this._invalidaDescripcionCotizacionIngles = true;
            return false;
        }
        
        const leyendaFinalidadCotizacionEspannol : string = (<HTMLTextAreaElement>document.getElementById('leyendaFinalidadCotizacionEspannol')).value;
        if(leyendaFinalidadCotizacionEspannol == '') {
            this._invalidaFinalidadCotizacion = true;
            return false;
        }
        
        const leyendaFinalidadCotizacionIngles : string = (<HTMLTextAreaElement>document.getElementById('leyendaFinalidadCotizacionIngles')).value;
        if(leyendaFinalidadCotizacionIngles == '') {
            this._invalidaFinalidadCotizacionIngles = true;
            return false;
        }

        const emailEjecutivo : string = (<HTMLTextAreaElement>document.getElementById('emailEjecutivo')).value;
        if(emailEjecutivo == '') {
            this._invalidaCorreoGerenciaEjecutiva = true;
            return false;
        }

        return true;
    }

    validacionParaAsistenteEjecutiva() : boolean {
        const emailEjecutivo : string = (<HTMLTextAreaElement>document.getElementById('emailEjecutivo')).value;
        if(emailEjecutivo == '') {
            this._invalidaCorreoGerenciaEjecutiva = true;
            return false;
        }

        return true;
    }

    entraTextArea() {
        this._invalidaDescripcionCotizacion = false;
        this._invalidaDescripcionCotizacionIngles = false;
        this._invalidaFinalidadCotizacion = false;
        this._invalidaFinalidadCotizacionIngles = false;
        this._invalidaDescripcionCertificado = false;
        this._invalidaDescripcionCertificadoIngles = false;
        this._invalidaCorreoGerenciaEjecutiva = false;

        this._desHabilitaGuardar = false;
    }

    subirPermanencia(e : any, componente : any) {
        this.archivos = [];
        this.archivos.push(e.files[0]);
        
        if(!this.validaArhivos()) return;

        componente.clear();

        this.ref.detectChanges();

        this.terminaSubirArchivoPermanencia();
    }

    subirCambioClimatico(e : any, componente : any) {
        this.archivos = [];
        this.archivos.push(e.files[0]);

        if(!this.validaArhivos()) return;

        componente.clear();

        this.ref.detectChanges();

        this.terminaSubirArchivoCambioClimatico();
    }

    abrirVentanaCargarPermanencia() {
        this._vistaSubidaPermanencia = true;   
    }

    abrirVentanaCargarCC() {
        this._vistaSubidaCC = true;   
    }

    abrirVentanaVerExpediente() {
        this.servicioCertificados.obtieneRutaElementosExpediente().subscribe({
            next : (rutas) => {
                if(rutas.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No existen elementos para mostrar."
                    });
                } else {
                    console.log(rutas)
                    rutas.forEach((item, indice) => {
                        if(indice == 0) {
                            this._urlDelExpedienteUno = environment.docspathPreview + item.ruta;
                            this._permanencia = `${item.ruta} (Permanencia)`;
                            this._verExpedienteUno = true;
                        }
                        
                        if(indice == 1) {
                            this._urlDelExpedienteDos = environment.docspathPreview + item.ruta;
                            this._cambioClimatico = `${item.ruta} (Cambio Climático)`;
                            this._verExpedienteDos = true;
                        }
                        
                    });

                    this._vistaExpediente = true;
    
                    this.ref.detectChanges();
                }
            },
            error : (err) => console.error(err)
        })
    }

    terminaSubirArchivoPermanencia() {
        this._vistaSubidaPermanencia = false;
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        const expediente : iSubirArchivoAlExpediente = {
            archivo : this.archivos,
            nombreArchivo : 'DDC-EX-PER',
            extension : '.pdf',
            idFuncionario : valorSesion.idUsuario
        }

        this.servicioCertificados.subeArchivosAlExpediente(expediente).subscribe({
            next : (resultado) => {
                
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});
                    
                    Swal.fire({
                        title: "¡Gracias! Archivo subido exitosamente.",
                        icon: "success"
                    }).then(() => {
                        location.reload();
                    });

                } else {
                    console.error(resultado.descripcion);    
                }
            },
            error : (err) => {
                console.error(err);
            }
        });
    
    }

    terminaSubirArchivoCambioClimatico() { 
        this._vistaSubidaCC = false;
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        const expediente : iSubirArchivoAlExpediente = {
            archivo : this.archivos,
            nombreArchivo : 'DDC-EX-DCC',
            extension : '.pdf',
            idFuncionario : valorSesion.idUsuario
        }

        this.servicioCertificados.subeArchivosAlExpediente(expediente).subscribe({
            next : (resultado) => {
                
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivo cargado exitosamente.'});
                    
                    Swal.fire({
                        title: "¡Gracias! Archivo subido exitosamente.",
                        icon: "success"
                    }).then(() => {
                        location.reload();
                    });

                } else {
                    console.error(resultado.descripcion);    
                }
            },
            error : (err) => {
                console.error(err);
            }
        });
    
    }

    validaArhivos() : boolean {
        let contadorPDFs : number = this.archivos.length;
        
        if(contadorPDFs == 0) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'Debe existir al menos un archivo PDF.'});
            this._archivoValidos = false;
            return false;
        }

        return true;
    }

    seleccionaDirector(e : any) {
        this._director = e.target.value;
    }

    cierraMensaje() {
        //location.reload();
    }
}