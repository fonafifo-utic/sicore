import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { iActualizaFormalizacion, iArchivoFacturaFormalizacion, iFacturasYComprobantes, iFormalizacion, iOpcionesParaAccion, iPeticionActivarFormalizacion } from "../interfaces/iFormalizacion";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { FormalizacionServicio } from "../servicio/formalizacion.servicio";
import { FileUploadModule } from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import Swal from "sweetalert2";
import { SkeletonModule } from 'primeng/skeleton';
import { environment } from "../../../../../environments/environment";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CotizacionServicio } from "../../cotizaciones/servicio/cotizacion.servicio";

@Component({
    selector: 'listar-formalizacion',
    templateUrl: 'formalizacion.listar.html',
    styleUrl: 'formalizacion.listar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, FileUploadModule, ToastModule, SkeletonModule, PdfViewerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})

export class ListarFormalizacion implements OnInit {

    private srv = inject(FormalizacionServicio);
    private servicioCotizacion = inject(CotizacionServicio);
    _formalizaciones$!: Observable<iFormalizacion[]>;
    private comprobantes! : Observable<iFacturasYComprobantes[]>;
    private facturas! : Observable<iFacturasYComprobantes[]>;
    private numeroComprobantes! : Observable<iFacturasYComprobantes[]>;
    _opciones!: iOpcionesParaAccion[];

    _columnas: any[] = [];

    _aplicarPago : boolean = false;
    _aplicarPagoDebito : boolean = false;
    _editarPago : boolean = false;
    _reemplazarArchivos : boolean = false;
    _deshabilitado : boolean = true;
    _esRequeridoComprobante: boolean = false;
    _esRequeridoFactura: boolean = false;
    _esRequeridoNumeroComprobante: boolean = false;
    _esCreditoDebito: boolean = false;
    _esFormatoIncorrecto : boolean = false;

    _formalizacionElegida!: iFormalizacion;

    archivosXMLs: any[] = [];

    _skeleton : boolean = false;

    _vistaPreviaFactura : boolean = false;
    _urlDelPDF! : string;

    _desHabilitarElAplicar : boolean = true;
    _guardando : boolean = false;

    _yaExisteComprobante : boolean = false;
    _yaExisteFactura : boolean = false;
    _yaExisteNumeroComprobante : boolean = false;
    _archivoValidos : boolean = false;
    _verMensajeNoFormalizaciones : boolean = false;
    _validarSiEsCredito : boolean = false;

    _anno! : string;
    _tieneFacturas : boolean = false;
    _habilitaCargarArchivos : boolean = false;
    _desHabilitarBotonesEditar : boolean = false;
    _tipoCambio! : string;
    _numeroFacturaDelCredito! : string;

    _facturasManuales : boolean = false;

    _esAsistenteDDC : boolean = false;
    _esJefaturaDF : boolean = false;
    _esJefaturaOrAdministrador : boolean = false;
    _esUsuarioDM : boolean = false;

    _muestraObservaciones : boolean = false;
    _datoRequerido : boolean = false;
    _cantidadMenor : boolean = false;
    _esAprobarFormalizacion : boolean = false;
    _apruebaOrRechaza : boolean = false;

    constructor(private router: Router, private servicioMensaje : MessageService, private ref : ChangeDetectorRef) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        if((perfil == 4)) this._esAsistenteDDC = true;
        if((perfil == 8)) this._esJefaturaDF = true;
        if((perfil == 10)) this._esJefaturaDF = true;
        if((perfil == 1) || (perfil == 8) || (perfil == 10)) this._esJefaturaOrAdministrador = true;
        if((perfil == 2)) this._esUsuarioDM = true;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 3) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7) && (perfil !== 8)  && (perfil !== 10)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idPerfil : number = valorSesion.idPerfil;

        this.traeCotizaciones(idPerfil);
    }

    traeCotizaciones(idPerfil : number) {
        this.servicioCotizacion.traeTodasCotizaciones().subscribe({
            next : cotizaciones => {
                if(cotizaciones.length === 0) {

                    if(idPerfil == 3) {
                        this._verMensajeNoFormalizaciones = true;
                        this.ref.detectChanges();
                    } else {
                        Swal.fire('SICORE','No se puede mostrar las formalizaciones sin cotizaciones.','warning').then(()=>{
                            this.router.navigate(['cotizacion/listar']);
                        });
                    }

                } else {
                    this.condicionesIniciales();
                }
            }
        })
    }

    condicionesIniciales(){
        const hoy : Date = new Date();
        this._anno = String(hoy.getFullYear());
        this.traeFormalizciones();
        this.traeFacturasYComprobantes();

        this._opciones = [
            { claveOpcion: '1', opcion: 'Ver' },
            { claveOpcion: '2', opcion: 'Aplicar Pago' }
        ];
    }

    traeFormalizciones() {
        this._columnas = [
            { campo: 'consecutivo', encabezado: 'Cotización' },
            { campo: 'nombreCliente', encabezado: 'Cliente' },
            { campo: 'fechaHora', encabezado: 'Fecha' },
            { campo: 'montoDolares', encabezado: 'Monto Dólares' },
            { campo: 'montoColones', encabezado: 'Monto Colones' },
            { campo: 'indicadorEstado', encabezado: 'Estado' }
        ];

        this._formalizaciones$ = this.srv.obtenerListadoFormalizacion();
        
        this.ref.detectChanges();
    }

    traeFacturasYComprobantes() {
        this.comprobantes = this.srv.obtenerComprobantes();
        this.facturas = this.srv.obtenerFacturas();
        this.numeroComprobantes = this.srv.obtenerNumeroComprobantes();
    }

    filtroGlobal(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    colocaCerosAlNumeroEntero(numero: number, idFormalizacion : string): string {
        let numeroConFormato : string = '';
        let nomenclatura : string = '';
        
        const prefijoCotizacion : string = 'DDC-CO-'; 
        const prefijoAgrupacion : string = 'DDC-AG-'; 

        switch (numero.toString().length) {
            case 1:
                numeroConFormato = '00' + numero.toString() + '-';
                break;
            case 2:
                numeroConFormato = '0' + numero.toString()  + '-';
                break;
            case 3:
                numeroConFormato = numero.toString() + '-';
                break;
        }

        if(!idFormalizacion.toString().includes(',')) nomenclatura = prefijoCotizacion + numeroConFormato + this._anno;
        else nomenclatura = prefijoAgrupacion + numeroConFormato + this._anno;

        return nomenclatura;
    }

    colocaCerosAlNumeroEnteroFormaalizacion(numero: number): string {
        let numeroConFormato : string = '';
        
        switch (numero.toString().length) {
            case 1:
                numeroConFormato = '00' + numero.toString();
                break;
            case 2:
                numeroConFormato = '0' + numero.toString();
                break;
            case 3:
                numeroConFormato = numero.toString();
                break;
        }

        return numeroConFormato;
    }

    verFormalizacion(idFormalizacion: string) {
        this.router.navigate(['formalizacion/ver', idFormalizacion])
    }

    mostrarAplicacionPago(formalizacion: iFormalizacion) {
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        if (formalizacion.indicadorEstado == 'Formalizado') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Formalizado, no se puede aplicar el pago."
            });

            return;
        }

        this._formalizacionElegida = formalizacion;
        this._aplicarPago = true;
        
        if(this._formalizacionElegida.tieneFacturas == 'S') this._tieneFacturas = true;
        else this._tieneFacturas = false;

        if(formalizacion.creditoDebito == 'Crédito') this._esCreditoDebito = true;
        else this._esCreditoDebito = false;
        
        const intervalo = setInterval(() => {
            if (document.getElementById('montoDolares')) {
                clearInterval(intervalo);

                this.limpiaLosInputs();

                (<HTMLSpanElement>document.getElementById('consecutivo')).innerText = `Cotización Número: ${this.colocaCerosAlNumeroEntero(formalizacion.consecutivo, formalizacion.idFormalizacion)} - ${formalizacion.creditoDebito} -`;

                (<HTMLInputElement>document.getElementById('comprobantePago')).value = formalizacion.numeroTransferencia;
                (<HTMLInputElement>document.getElementById('numeroFactura')).value = formalizacion.numeroFacturaFonafifo;
                this._numeroFacturaDelCredito = formalizacion.numeroFacturaFonafifo;
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = new Date(formalizacion.fechaHora).toLocaleString('es-CR');
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + formalizacion.montoDolares.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                (<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + formalizacion.montoColones.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                this._tipoCambio = '₡ ' + formalizacion.tipoCambio.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                this.ref.detectChanges();
            }
        }, 300)
    }

    mostrarAplicacionPagoDebito(formalizacion: iFormalizacion) {
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        this._formalizacionElegida = formalizacion;
        this._aplicarPagoDebito = true;
        
        if(this._formalizacionElegida.tieneFacturas == 'S') this._tieneFacturas = true;
        else this._tieneFacturas = false;

        if(formalizacion.creditoDebito == 'Crédito') this._esCreditoDebito = true;
        else this._esCreditoDebito = false;
        
        const intervalo = setInterval(() => {
            if (document.getElementById('montoDolares')) {
                clearInterval(intervalo);

                this.limpiaLosInputs();

                (<HTMLSpanElement>document.getElementById('consecutivo')).innerText = `Cotización Número: ${this.colocaCerosAlNumeroEntero(formalizacion.consecutivo, formalizacion.idFormalizacion)} - ${formalizacion.creditoDebito} -`;

                //(<HTMLInputElement>document.getElementById('comprobantePago')).value = formalizacion.numeroTransferencia;
                //(<HTMLInputElement>document.getElementById('numeroFactura')).value = formalizacion.numeroFacturaFonafifo;
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = new Date(formalizacion.fechaHora).toLocaleString('es-CR');
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + formalizacion.montoDolares.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                (<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + formalizacion.montoColones.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                this._tipoCambio = '₡ ' + formalizacion.tipoCambio.toLocaleString('es-CR', { minimumFractionDigits : 2});
                this.ref.detectChanges();
            }
        }, 300)
    }

    limpiaLosInputs(){
        (<HTMLInputElement>document.getElementById('comprobantePago')).value = '';
        (<HTMLInputElement>document.getElementById('numeroFactura')).value = '';
    }

    aplicarPago() {
        this._guardando = true;
        this._aplicarPago = false;
        this._skeleton = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value.toUpperCase();
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        let indicadorEstado : string;
        if(this._formalizacionElegida.creditoDebito == 'Crédito') indicadorEstado = 'P';
        else indicadorEstado = 'K'; 

        const formalizacion : iActualizaFormalizacion = {
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: indicadorEstado,
            numeroTransferencia: comprobante,
            tieneFacturas: 'S',
            numeroFactura : numeroFactura,
            consecutivo : this._formalizacionElegida.consecutivo,
            numeroComprobante : '',
            justificacionActivacion : ''
        }

        const expediente : iArchivoFacturaFormalizacion = {
            archivo : this.archivosXMLs,
            cotizacion : `DDC-FO-${this.colocaCerosAlNumeroEnteroFormaalizacion(this._formalizacionElegida.consecutivo)}-${this._anno}`,
            idFormalizacion : this._formalizacionElegida.idFormalizacion,
            idFuncionario : valorSesion.idUsuario
        }

        this.srv.subeArchivosFacturacionFormalizacion(expediente).subscribe({
            next : (resultado) => {
                this._guardando = false;
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});

                    this.srv.actualizaUnaFormalizacion(formalizacion).subscribe({
                        next: (respuesta) => {
                            if (respuesta.valor == '1') {
                                Swal.fire({
                                    title: "¡Gracias!",
                                    text: "La Cotización quedó en estado de Pendiente de Formalizar.",
                                    icon: "success"
                                }).then(() => {
                                    this._skeleton = false;
                                    location.reload();
                                });
                            } else {
                                console.log(respuesta);
                            }

                            this._guardando = false;
                            this.ref.detectChanges();
                        },
                        error : (err) => {
                            console.error(err);
                            this._guardando = false;
                        }
                    })

                }
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        });

    }

    aplicarPagoDebito() {
        this._guardando = true;
        this._aplicarPagoDebito = false;
        this._skeleton = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value.toUpperCase();
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        const formalizacion : iActualizaFormalizacion = {
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: 'V',
            numeroTransferencia: comprobante,
            tieneFacturas: 'S',
            numeroFactura : numeroFactura,
            consecutivo : this._formalizacionElegida.consecutivo,
            numeroComprobante : comprobante,
            justificacionActivacion : ''
        }

        const expediente : iArchivoFacturaFormalizacion = {
            archivo : this.archivosXMLs,
            cotizacion : `DDC-FO-${this.colocaCerosAlNumeroEnteroFormaalizacion(this._formalizacionElegida.consecutivo)}-${anno}`,
            idFormalizacion : this._formalizacionElegida.idFormalizacion,
            idFuncionario : valorSesion.idUsuario
        }

        this.srv.subeArchivosFacturacionFormalizacion(expediente).subscribe({
            next : (resultado) => {
                this._guardando = false;
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});

                    this.srv.actualizaUnaFormalizacion(formalizacion).subscribe({
                        next: (respuesta) => {
                            if (respuesta.valor == '1') {
                                Swal.fire({
                                    title: "¡Gracias! Formalización pendiente de validación.",
                                    icon: "success"
                                }).then(() => {
                                    this._skeleton = false;
                                    location.reload();
                                });
                            } else {
                                console.log(respuesta);
                            }

                            this._guardando = false;
                            this.ref.detectChanges();
                        },
                        error : (err) => {
                            console.error(err);
                            this._guardando = false;
                        }
                    })

                }
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        });

    }

    editarFormalizacion() {
        this._guardando = true;
        this._editarPago = false;
        this._skeleton = true;

        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value.toUpperCase();
        const numeroComprobante : string = comprobante;
        
        const formalizacion : iActualizaFormalizacion = {
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: 'V',
            numeroTransferencia: comprobante,
            tieneFacturas: 'S',
            numeroFactura : numeroFactura,
            consecutivo : this._formalizacionElegida.consecutivo,
            numeroComprobante : numeroComprobante,
            justificacionActivacion : ''
        }

        this.srv.actualizaUnaFormalizacionSinArchivos(formalizacion).subscribe({
            next: (respuesta) => {
                if (respuesta.valor == '1') {
                    Swal.fire({
                        title: "¡Gracias!",
                        text: "Formalización editada correctamente.",
                        icon: "success"
                    }).then(() => {
                        this._skeleton = false;
                        location.reload();
                    });
                } else {
                    console.log(respuesta);
                }

                this._guardando = false;
                this.ref.detectChanges();
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        });
    }

    aplicaReemplazo() {
        this._guardando = true;
        this._reemplazarArchivos = false;
        this._skeleton = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value;
        
        const formalizacion : iActualizaFormalizacion = {
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: 'V',
            numeroComprobante: '',
            tieneFacturas: 'S',
            numeroFactura : numeroFactura,
            consecutivo : this._formalizacionElegida.consecutivo,
            numeroTransferencia : '',
            justificacionActivacion : ''
        }

        const expediente : iArchivoFacturaFormalizacion = {
            archivo : this.archivosXMLs,
            cotizacion : `${this.colocaCerosAlNumeroEntero(this._formalizacionElegida.consecutivo, this._formalizacionElegida.idCotizacion)}`,
            idFormalizacion : this._formalizacionElegida.idFormalizacion,
            idFuncionario : valorSesion.idUsuario
        }

        this.srv.actualizaFacturacionFormalizacion(expediente).subscribe({
            next : (resultado) => {
                this._guardando = false;
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});

                    this.srv.actualizaUnaFormalizacionCredito(formalizacion).subscribe({
                        next: (respuesta) => {
                            if (respuesta.valor == '1') {

                                Swal.fire({
                                    title: "¡Gracias! Formalización ha sido actualizada.",
                                    icon: "success"
                                }).then(() => {
                                    this._skeleton = false;
                                    location.reload();
                                });

                            } else {
                                console.log(respuesta);
                            }

                            this._guardando = false;
                            this.ref.detectChanges();
                        },
                        error : (err) => {
                            console.error(err);
                            this._guardando = false;
                        }
                    })

                } else {
                    this._guardando = false;
                    this.ref.detectChanges();
                }
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        });
    }

    aplicarFormalizacion() {
        if (!this.validaFormalizacion()) return;

        this.formalizar();
    }

    formalizar() {
        this._guardando = true;
        this._aplicarPago = false;
        this._skeleton = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const numeroTransferencia : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value.toUpperCase();
        
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        const formalizacion : iActualizaFormalizacion = {
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: 'V',
            numeroTransferencia: numeroTransferencia,
            tieneFacturas: 'S',
            numeroFactura : numeroFactura,
            consecutivo : this._formalizacionElegida.consecutivo,
            numeroComprobante : numeroTransferencia,
            justificacionActivacion : ''
        }

        this.srv.actualizaUnaFormalizacion(formalizacion).subscribe({
            next: (respuesta) => {
                if (respuesta.valor == '1') {
                    Swal.fire({
                        title: "¡Gracias! Formalización de venta exitosa.",
                        text: "Ya se puede visualizar el Certificado correspondiente.",
                        icon: "success"
                    }).then(() => {
                        this._skeleton = false;
                        location.reload();
                    });
                } else {
                    console.log(respuesta);
                }

                this._guardando = false;
                this.ref.detectChanges();
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        })

        // const expediente : iArchivoFacturaFormalizacion = {
        //     archivo : this.archivosXMLs,
        //     cotizacion : `DDC-FO-${this.colocaCerosAlNumeroEntero(this._formalizacionElegida.consecutivo)}-${anno}`,
        //     idFormalizacion : this._formalizacionElegida.idFormalizacion,
        //     idFuncionario : valorSesion.idUsuario
        // }

        // this.srv.subeArchivosFacturacionFormalizacion(expediente).subscribe({
        //     next : (resultado) => {
        //         this._guardando = false;
        //         if(resultado.valor == "1") {
        //             this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});

                    

        //         }
        //     },
        //     error : (err) => {
        //         console.error(err);
        //         this._guardando = false;
        //     }
        // });
    }

    validaFormalizacionParaFormalizarCredito(): boolean {
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value;

        if(numeroFactura == '') {
            this._esRequeridoFactura = true;
            return false;
        }

        if(this._yaExisteFactura) return false;
        
        return true;
    }

    validaFormalizacionParaFormalizar(): boolean {
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value;
        const numeroComprobante : string = comprobante;

        if (!this._esCreditoDebito) {
            if (comprobante == '') {
                this._esRequeridoComprobante = true;
                return false;
            }
        }

        if(numeroFactura == '') {
            this._esRequeridoFactura = true;
            return false;
        }

        if (!this._esCreditoDebito) {
            if (numeroComprobante == '') {
                this._esRequeridoNumeroComprobante = true;
                return false;
            }
        }

        if(this._esFormatoIncorrecto) return false;
        
        if(this._yaExisteComprobante) return false;
        
        if(this._yaExisteFactura) return false;
        
        if(this._yaExisteNumeroComprobante) return false;
        
        return true;
    }

    validaFormalizacionParaEditar(): boolean {
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value;
        const numeroComprobante : string = comprobante;

        if (comprobante == '') {
            this._esRequeridoComprobante = true;
            return false;
        }
        
        if(numeroFactura == '') {
            this._esRequeridoFactura = true;
            return false;
        }

        if (numeroComprobante == '') {
            this._esRequeridoNumeroComprobante = true;
            return false;
        }
        
        if(this._esFormatoIncorrecto) return false;

        if(this._yaExisteComprobante) return false;

        if(this._yaExisteFactura) return false;
        
        if(this._yaExisteNumeroComprobante) return false;

        return true;
    }

    validaFormalizacion(): boolean {
        // const numeroComprobante : string = (<HTMLInputElement>document.getElementById('numeroComprobante')).value;

        // if(numeroComprobante == '') {
        //     this._esRequeridoNumeroComprobante = true;
        //     return false;
        // }

        // if(this._yaExisteNumeroComprobante) return false;

        return true;
    }

    validaArhivos() : boolean {
        let contadorArchivos : number = 0;
        let contadorXMLs : number = 0;
        let contadorPDFs : number = 0;

        if(this.archivosXMLs.length <= 0) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'No se puede formalizar una cotización sin archivos que le respalden.'});
            this._archivoValidos = false;
            return false;
        };

        this.archivosXMLs.forEach(archivo => {
            contadorArchivos++;
            if(archivo.type === 'text/xml') contadorXMLs++;
            if(archivo.type === 'application/pdf') contadorPDFs++;
        });

        if((contadorArchivos < 3) && (!this._facturasManuales)) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'Debe existir al menos 3 archivos para respaldar la Formalización de una Cotización.'});
            this._archivoValidos = false;
            return false;
        }

        if((contadorArchivos > 3) && (!this._facturasManuales)) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'No puede existir más de 3 archivos para Formalizar.'});
            this._archivoValidos = false;
            return false;
        }

        if((contadorXMLs < 2) && (!this._facturasManuales)) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'Debe existir al menos dos archivos XML.'});
            this._archivoValidos = false;
            return false;
        }

        if((contadorXMLs > 2) && (!this._facturasManuales)) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'No puede haber más de dos archivos XML.'});
            this._archivoValidos = false;
            return false;
        }

        if(contadorPDFs == 0) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'Debe existir al menos un archivo PDF.'});
            this._archivoValidos = false;
            return false;
        }

        if(contadorPDFs > 1) {
            this.servicioMensaje.add({severity: 'error', summary: 'Opps...', detail: 'No puede haber más de un archivo PDF.'});
            this._archivoValidos = false;
            return false;
        }

        return true;
    }

    validaComprobantes() {
        //if(this._esCreditoDebito) return;

        let cantidadComprobantes : number = 0;
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;

        if(comprobante == '') {
            this._esRequeridoComprobante = true;
            return;
        }

        const numeroTransferencia : string = this._formalizacionElegida.numeroTransferencia;
        if(numeroTransferencia !== comprobante) {
            this.comprobantes.subscribe({
                next : comprobantes => {
                    cantidadComprobantes = comprobantes.filter(item => item.numeroTransferencia === comprobante).length;
                    if(cantidadComprobantes > 0) this._yaExisteComprobante = true;
                    this.ref.detectChanges();
                    return;
                },
                error : err => console.error(err)
            });
        }
        
        if(comprobante.length < 1) {
            this._esFormatoIncorrecto = true;
            return;
        }

        if(comprobante.length > 9) {
            this._esFormatoIncorrecto = true;
            return;
        }

        if(isNaN(Number(comprobante))) {
            this._esFormatoIncorrecto = true;
            return;
        }
        
    }

    estaEnModoEditarFormalizacion() : boolean {
        if(this._editarPago){
            this._formalizacionElegida
        }

        return false;
    }

    validaFacturas() {
        let cantidadFacturas : number = 0;
        const numeroFactura : string = (<HTMLInputElement>document.getElementById('numeroFactura')).value;

        if(numeroFactura == '') {
            this._esRequeridoFactura = true;
            return
        }

        this.facturas.subscribe({
            next : facturas => {
                if(this._numeroFacturaDelCredito !== undefined) {
                    cantidadFacturas = facturas.filter(item =>
                        (item.numeroFacturaFonafifo.toUpperCase() === numeroFactura.toUpperCase()) &&
                        (this._numeroFacturaDelCredito.toUpperCase() !== item.numeroFacturaFonafifo.toUpperCase())).length;
                } else {
                    cantidadFacturas = facturas.filter(item => item.numeroFacturaFonafifo.toUpperCase() === numeroFactura.toUpperCase()).length;
                }
                
                if(cantidadFacturas > 0) this._yaExisteFactura = true;
                this.ref.detectChanges();
                return;
            },
            error : err => console.error(err)
        });

    }

    validaNumeroComprobante() {
        if(this._esCreditoDebito) return;

        let totalComprobantes : number = 0;
        const numeroComprobante : string = (<HTMLInputElement>document.getElementById('numeroComprobante')).value;

        if(numeroComprobante == '') {
            this._esRequeridoNumeroComprobante = true;
            return;
        }

        this.numeroComprobantes.subscribe({
            next : comprobantes => {
                totalComprobantes = comprobantes.filter(item => item.numeroComprobante.toUpperCase() === numeroComprobante.toUpperCase()).length;
                if(totalComprobantes > 0) this._yaExisteNumeroComprobante = true;
                this.ref.detectChanges();
            },
            error : err => console.error(err)
        });
    }

    cancelar() {
        this._aplicarPago = false;
        this.archivosXMLs = [];
    }

    entraComprobante() {
        (<HTMLInputElement>document.getElementById('comprobantePago')).type = 'number';
        this._esRequeridoComprobante = false;
        this._yaExisteComprobante = false;
        this._esFormatoIncorrecto = false;
    }

    entraFactura(){
        this._esRequeridoFactura = false;
        this._yaExisteFactura = false;
    }

    entraNumeroComprobante(){
        this._esRequeridoNumeroComprobante = false;
        this._yaExisteNumeroComprobante = false;
    }

    subirXMLs(evento: any, componente: any) {
        if (!this.validaFormalizacionParaFormalizar()) return;

        this.archivosXMLs = [];
        for (let archivo of evento.files) {
            this.archivosXMLs.push(archivo);
        }

        if(!this.validaArhivos()) return;

        componente.clear();

        if(this.archivosXMLs.length > 0) {
            this._desHabilitarElAplicar = false;
        }

        this._archivoValidos = true;
        this.ref.detectChanges();

        this.aplicarPago();
    }

    aplicarXMLsEnEditar() {
        if (!this.validaFormalizacionParaEditar()) return;

        this.editarFormalizacion();
    }

    subirXMLsEnEditar(evento: any, componente: any) {
        if (!this.validaFormalizacionParaEditar()) return;

        this.archivosXMLs = [];
        for (let archivo of evento.files) {
            this.archivosXMLs.push(archivo);
        }

        if(!this.validaArhivos()) return;

        componente.clear();

        if(this.archivosXMLs.length > 0) {
            this._desHabilitarElAplicar = false;
        }

        this._archivoValidos = true;
        this.ref.detectChanges();

        this.editarArchivosFactura();
    }

    editarArchivosFactura() {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        const expediente : iArchivoFacturaFormalizacion = {
            archivo : this.archivosXMLs,
            cotizacion : `${this.colocaCerosAlNumeroEntero(this._formalizacionElegida.consecutivo, this._formalizacionElegida.idFormalizacion)}`,
            idFormalizacion : this._formalizacionElegida.idFormalizacion,
            idFuncionario : valorSesion.idUsuario
        }

        this.srv.actualizaFacturacionFormalizacion(expediente).subscribe({
            next : (resultado) => {
                this._guardando = false;
                if(resultado.valor == "1") {
                    this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});
                    this.editarFormalizacion();
                } else {
                    this._guardando = false;
                    this.ref.detectChanges();
                }
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        });
    }

    subirXMLsDebito(evento: any, componente: any) {
        if (!this.validaFormalizacionParaFormalizar()) return;

        this.archivosXMLs = [];
        for (let archivo of evento.files) {
            this.archivosXMLs.push(archivo);
        }

        if(!this.validaArhivos()) return;

        componente.clear();

        if(this.archivosXMLs.length > 0) {
            this._desHabilitarElAplicar = false;
        }

        this._archivoValidos = true;
        this.ref.detectChanges();

        this.aplicarPagoDebito();
    }

    reeplazaXML(evento: any, componente: any) {
        if (!this.validaFormalizacionParaFormalizarCredito()) return;

        this.archivosXMLs = [];
        for (let archivo of evento.files) {
            this.archivosXMLs.push(archivo);
        }

        if(!this.validaArhivos()) return;

        componente.clear();

        if(this.archivosXMLs.length > 0) {
            this._desHabilitarElAplicar = false;
        }

        this.aplicaReemplazo();
    }

    verFactura(idFormalizacion : string) {
        this.srv.obtenerRutaFacturaPorId(idFormalizacion).subscribe({
            next : (ruta) => {
                if(ruta.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se tiene vista previa de esta factura."
                    });
                } else {
                    this._urlDelPDF = environment.docspathPreview + ruta[0].ruta;
                    this._vistaPreviaFactura = true;
                    this.ref.detectChanges();
                }
            },
            error : (err) => console.error(err)
        })
    }

    verEditar(formalizacion : iFormalizacion) {
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        this._formalizacionElegida = formalizacion;
        this._editarPago = true;
        
        if(this._formalizacionElegida.tieneFacturas == 'S') this._tieneFacturas = true;
        else this._tieneFacturas = false;

        if(formalizacion.creditoDebito == 'Crédito') this._esCreditoDebito = true;
        else this._esCreditoDebito = false;
        
        const intervalo = setInterval(() => {
            if (document.getElementById('montoDolares')) {
                clearInterval(intervalo);

                this.limpiaLosInputs();

                (<HTMLSpanElement>document.getElementById('consecutivo')).innerText = `Cotización Número: ${this.colocaCerosAlNumeroEntero(formalizacion.consecutivo, formalizacion.idFormalizacion)} - ${formalizacion.creditoDebito} -`;

                (<HTMLInputElement>document.getElementById('comprobantePago')).value = formalizacion.numeroTransferencia;
                (<HTMLInputElement>document.getElementById('numeroFactura')).value = formalizacion.numeroFacturaFonafifo;
                //(<HTMLInputElement>document.getElementById('numeroComprobante')).value = formalizacion.numeroComprobante;

                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = new Date(formalizacion.fechaHora).toLocaleString('es-CR');
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + formalizacion.montoDolares.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                (<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + formalizacion.montoColones.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                this._tipoCambio = formalizacion.tipoCambio.toLocaleString('es-CR', { minimumFractionDigits : 2 });
                this.ref.detectChanges();
            }
        }, 300)

    }

    volverToSubir(formalizacion: iFormalizacion) {
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        this._formalizacionElegida = formalizacion;
        this._reemplazarArchivos = true;

        const intervalo = setInterval(() => {
            if (document.getElementById('montoDolares')) {
                clearInterval(intervalo);

                //this.limpiaLosInputs();

                (<HTMLSpanElement>document.getElementById('consecutivo')).innerText = `Cotización Número: ${this.colocaCerosAlNumeroEntero(formalizacion.consecutivo, formalizacion.idFormalizacion)} - ${formalizacion.creditoDebito} -`;
                
                // (<HTMLInputElement>document.getElementById('comprobantePago')).value = formalizacion.numeroTransferencia;
                // (<HTMLInputElement>document.getElementById('numeroFactura')).value = formalizacion.numeroFacturaFonafifo;
                // (<HTMLInputElement>document.getElementById('numeroComprobante')).value = formalizacion.numeroComprobante;
                
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = new Date(formalizacion.fechaHora).toLocaleString('es-CR');
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + formalizacion.montoDolares.toLocaleString('es-CR', { minimumFractionDigits: 2 });
                (<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + formalizacion.montoColones.toLocaleString('es-CR', { minimumFractionDigits: 2 });
                this._tipoCambio = '₡ ' + formalizacion.tipoCambio.toLocaleString('es-CR', { minimumFractionDigits : 2 })
                this._esCreditoDebito = true;
                this.ref.detectChanges();
            }
        }, 300)
    }

    esParaGenerarFactura(formalizacion : iFormalizacion) : boolean {
        if(this._esAsistenteDDC) return false;
        if(this._esUsuarioDM) return false;
        if(this._esJefaturaDF) return false;

        return (
            (formalizacion.creditoDebito == 'Crédito') &&
            (formalizacion.indicadorEstado == 'Pendiente') &&
            (formalizacion.tieneFacturas == 'N'))
    }

    esParaVerFactura(formalizacion : iFormalizacion) : boolean {
        if(this._esAsistenteDDC) return true;
        else return (formalizacion.tieneFacturas == 'S');
    }

    esParaAplicarPago(formalizacion : iFormalizacion) : boolean {
        if((this._esAsistenteDDC) || (this._esJefaturaDF)) return false;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if(valorSesion.idPerfil == 2) return false;

        return (
            (formalizacion.indicadorEstado == 'Pendiente Crédito') &&
            (formalizacion.creditoDebito == 'Crédito') &&
            (formalizacion.tieneFacturas == 'S'))
    }

    esParaAplicarPagoDebito(formalizacion : iFormalizacion) {
        if((this._esAsistenteDDC) || (this._esJefaturaDF)) return false;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if(valorSesion.idPerfil == 2) return;
        
        return (
            (formalizacion.indicadorEstado == 'Pendiente') &&
            (formalizacion.tieneFacturas == 'N'))
    }

    esParaVerEditar(formalizacion : iFormalizacion) {
        if(this._esAsistenteDDC) return;
        if(this._esUsuarioDM) return;

        if((formalizacion.indicadorEstado == 'Formalizado')) return;

        if(this._esJefaturaOrAdministrador) {
            return (formalizacion.indicadorEstado == 'Pendiente Aprobación')
        }

        return ((formalizacion.indicadorEstado == 'Rechazada') || (formalizacion.indicadorEstado == 'Pendiente Cierre'));
    }

    cancelarVistaPrevia() {
        this._vistaPreviaFactura = false;
        this._aplicarPago = false;
        this._editarPago = false;
    }

    cierraMensaje() {
        
        //location.reload();
    }

    mostrarCargarArchivos(evento : any) {
        if(evento.target.checked) {
            this._editarPago = false;

            if(this._formalizacionElegida.tieneFacturas = 'S'){
                Swal.fire({
                    title: "¿Desea reemplazarlos?",
                    text: "Esta Formalización ya cuenta con los archivos de la factura.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Confirmo",
                    cancelButtonText : "Cancelar"
                  }).then((respuesta) => {
                      if (respuesta.isConfirmed) {
                        this._editarPago = true;
                          this._desHabilitarBotonesEditar = true;
                          this._habilitaCargarArchivos = true;
                          this.ref.detectChanges();
                    } else {
                        this._editarPago = true;
                        this.ref.detectChanges();

                        const intervalo = setInterval(()=>{
                            if(document.getElementById('ckHabilitaCargarArchivos')){
                                clearInterval(intervalo);
                                (<HTMLInputElement>document.getElementById('ckHabilitaCargarArchivos')).checked = false;
                            }
                        },100)
                    }
                });
            } else {
                this._desHabilitarBotonesEditar = true;
                this._habilitaCargarArchivos = true;
                this.ref.detectChanges();
            }
        } else {
            this._desHabilitarBotonesEditar = false;
            this._habilitaCargarArchivos = false;
            this.ref.detectChanges();
        }
    }

    esParaCerrarFormalizacion(formalizacion : iFormalizacion) : boolean {
        if(this._esAsistenteDDC) return false;
        if(this._esJefaturaOrAdministrador) return false;
        if(this._esUsuarioDM) return false;
        
        return (formalizacion.indicadorEstado == 'Pendiente Cierre');
    }

    cerrarFormalizacion(formalizacion : iFormalizacion) {
        const cotizacion : string = this.colocaCerosAlNumeroEntero(formalizacion.consecutivo, formalizacion.idFormalizacion);
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

        if((formalizacion.numeroTransferencia == '')) {
            Swal.fire(`Oops...`, `No se puede formalizar porque le falta el número de comprobante`, 'error');
            return
        }

        const formalizacionParaCerrar : iActualizaFormalizacion = {
            idFormalizacion: formalizacion.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: 'F',
            numeroComprobante: '',
            tieneFacturas: 'S',
            numeroFactura : '',
            consecutivo : formalizacion.consecutivo,
            numeroTransferencia : '',
            justificacionActivacion : ''
        }

        Swal.fire({
            title: "¿Desea continuar?",
            text: `Va a cerrar la Formalización: ${cotizacion}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, continuar."
          }).then((resultado) => {
            if (resultado.isConfirmed) {

                this.srv.cierraUnaFormalizacion(formalizacionParaCerrar).subscribe({
                    next : (resultado) => {
                        if(resultado.valor == '1'){
                            Swal.fire({
                                title: "¡Gracias! Formalización de venta exitosa.",
                                text: "Ya se puede visualizar el Certificado correspondiente.",
                                icon: "success"
                            }).then(() => {
                                location.reload();
                                this._skeleton = false;
                            });
                        } else {
                            console.log(resultado)
                        }
                    },
                    error : (err) => console.error(err)
                });
              
            }
          });
        
    }

    seleccionaManual(e : any) {
        this._facturasManuales = e.target.checked;
    }

    esAprobarFormalizacion() : boolean {
        if(this._formalizacionElegida == null) return false;

        if(this._esJefaturaOrAdministrador) {
            if (this._formalizacionElegida.indicadorEstado == 'Pendiente Aprobación') return true;
            else return false;
        } else {
            return false;
        }
    }

    esParaVerEditarFormalizacion() : boolean {
        if(this._formalizacionElegida == null) return false;

        if(this._esJefaturaOrAdministrador) return false;
        else {
            return true;
        }
    }

    revisarFormalizacion() {
        this._editarPago = false;
        const numeroFormalizacion : string = `${this.colocaCerosAlNumeroEntero(this._formalizacionElegida.consecutivo, this._formalizacionElegida.idFormalizacion)}`;

        Swal.fire({
            title: `¿Confirma la revisión de la formalización: ${numeroFormalizacion}?`,
            showDenyButton: true,
            confirmButtonText: "Confirmo",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if(confirmacion.isConfirmed) {
                this._muestraObservaciones = true;
                this.ref.detectChanges();
            }
        });   
    }

    peticionParaActivarUnaFormalizacion(formalizacion: iFormalizacion) {
        Swal.fire({
            title: "¿Confirma enviar petición de activación?",
            text: "Esta Formalización se encuentra cerrada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí. Confirmo",
            cancelButtonText: "Cancelar"
        }).then((respuesta) => {
            if (respuesta.isConfirmed) {
                Swal.fire({
                    title: 'Justificación:',
                    text: "Debe disponer de una justificación válida.",
                    input: 'text',
                    showCancelButton: true
                }).then((justificacion) => {
                    if (justificacion.isConfirmed) {
                        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
                        const peticion: iPeticionActivarFormalizacion = {
                            idFormalizacion: formalizacion.idFormalizacion,
                            idFuncionario: valorSesion.idUsuario,
                            justificacion: justificacion.value
                        }        

                        this.srv.peticionActivarRevisionDeFormalizacion(peticion).subscribe({
                            next: (respuesta) => {

                                if (respuesta.valor == '1') {
                                    Swal.fire('SICORE', 'La Formalización fue activada con éxito.', 'success').then(() => {
                                        location.reload();
                                    });
                                } else {
                                    console.log(respuesta.descripcion);
                                }

                            },
                            error: (err) => console.error(err)
                        });
                    }
                })
            }
        });

    }

    descargarFacturaPDF() {
        window.open(this._urlDelPDF);
    }

    esRevisarFormalizacion(formalizacion : iFormalizacion) : boolean {
        return ((formalizacion.indicadorEstado == 'Formalizado') && (!this._esJefaturaOrAdministrador));
    }

    esParaActivarUnaFormalizacion(formalizacion : iFormalizacion) : boolean {
        return ((formalizacion.indicadorEstado == 'Formalizado') && (this._esJefaturaOrAdministrador));
    }

    activarUnaFormalizacion(formalizacion: iFormalizacion) {
        Swal.fire({
            title: "¿Confirma activar esta Formalización?",
            text: "Esta Formalización se encuentra cerrada y será activa nuevamente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí. Confirmo",
            cancelButtonText: "Cancelar"
        }).then((respuesta) => {
            if (respuesta.isConfirmed) {
                if (respuesta.isConfirmed) {
                    const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

                    const peticionParaActivar : iActualizaFormalizacion = {
                        consecutivo : formalizacion.consecutivo,
                        idFormalizacion : formalizacion.idFormalizacion,
                        idUsuario : valorSesion.idUsuario,
                        indicadorEstado : '',
                        numeroComprobante : '',
                        numeroFactura : '',
                        numeroTransferencia : '',
                        tieneFacturas : '',
                        justificacionActivacion : ''
                    }

                    this.srv.activaRevisionDeFormalizacion(peticionParaActivar).subscribe({
                        next: (respuesta) => {

                            if (respuesta.valor == '1') {
                                Swal.fire('SICORE', 'La Formalización fue activada con éxito.', 'success').then(() => {
                                    location.reload();
                                });
                            } else {
                                console.log(respuesta.descripcion);
                            }

                        },
                        error: (err) => console.error(err)
                    });
                }
            }
        });

    }

    entraObservaciones() {
        this._datoRequerido = false;
        this._cantidadMenor = false;
    }

    aprobarFormalizacion() {
        this._muestraObservaciones = false;
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const activaFormalizacion: iActualizaFormalizacion = {
            consecutivo: this._formalizacionElegida.consecutivo,
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: '',
            numeroComprobante: '',
            numeroFactura: '',
            numeroTransferencia: '',
            tieneFacturas: '',
            justificacionActivacion : ''
        }

        this.srv.activaRevisionDeFormalizacion(activaFormalizacion).subscribe({
            next: respuesta => {
                console.log(respuesta)
                if (respuesta.valor == '1') {
                    Swal.fire(`La Formalización fue aprobada`, ``, "success").then(() => {
                        location.reload();
                    })
                }
            },
            error: err => console.log(err)
        })
    }

    rechazarFormalizacion() {
        this._muestraObservaciones = false;
        const observaciones : string = (<HTMLTextAreaElement>document.getElementById('observaciones')).value;
        if(this.validaObservaciones(observaciones)) return;

        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const activaFormalizacion : iActualizaFormalizacion = {
            consecutivo: this._formalizacionElegida.consecutivo,
            idFormalizacion: this._formalizacionElegida.idFormalizacion,
            idUsuario: valorSesion.idUsuario,
            indicadorEstado: '',
            numeroComprobante: '',
            numeroFactura: '',
            numeroTransferencia: '',
            tieneFacturas: '',
            justificacionActivacion : observaciones
        }

        this.srv.rechazaRevisionDeFormalizacion(activaFormalizacion).subscribe({
            next: respuesta => {
                if (respuesta.valor == '1') {
                    Swal.fire(`La Formalización fue actualizada`, '', 'success').then(() => {
                        location.reload();
                    })
                }
            },
            error: err => console.log(err)
        })
    }

    validaObservaciones(observaciones : string) : boolean {
        if(observaciones == '') {
            this._datoRequerido = true;
            return true;
        }

        if(observaciones.length < 5) {
            this._cantidadMenor = true;
            return true;
        }

        return false;
    }

    apruebaFormalizacion(e : any) {
        this._apruebaOrRechaza = e.target.checked;

        const intervalo = setInterval(()=>{
            if(document.getElementById('observaciones')) {
                clearInterval(intervalo);

                if(this._apruebaOrRechaza) (<HTMLTextAreaElement>document.getElementById('observaciones')).readOnly = true;
                else (<HTMLTextAreaElement>document.getElementById('observaciones')).readOnly = false;
        
                (<HTMLInputElement>document.getElementById('ckAprobar')).checked = this._apruebaOrRechaza;
            }
        },300)

    }

    determinaColorDeEstado(indicadorEstado : string) : any {
        let colorDeEstado : any;

        switch(indicadorEstado){
            case 'Activa':
                colorDeEstado = { background : '#15803D' };    
                break;

            case 'Inactiva':
                colorDeEstado = { background : '#D32F2F' };
                break;

            case 'Pendiente':
                colorDeEstado = { background : '#0378B0' };
                break;

            case 'Formalizada':
                colorDeEstado = { background : '#15803D' };
                break;

            case 'Enviada':
                colorDeEstado = { background : '#0378B0' };
                break;    
            
            case 'Pendiente Cierre':
                colorDeEstado = { background : '#0378B0' };
                break;

            case 'Pendiente Validación':
                colorDeEstado = { background : '#0378B0' };
                break;

            case 'Rechazada':
                colorDeEstado = { background : '#D32F2F' };
                break;
        }

        return colorDeEstado;
    }
}