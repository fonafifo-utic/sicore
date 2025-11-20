import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CotizacionServicio } from "../servicio/cotizacion.servicio";
import { Observable } from "rxjs";
import { iActualizaIncadorEstadoAgrupacion, iAnulaCotizacion, iCotizacion, iCotizacionAgrupada, iListaCotizacionesAgrupadas } from "../interfaces/iCotizacion";
import Swal from "sweetalert2";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { iFormalizacionParaSalvar } from "../../formalizacion/interfaces/iFormalizacion";
import { FormalizacionServicio } from "../../formalizacion/servicio/formalizacion.servicio";

@Component({
    selector: 'agrupar-cotizacion',
    templateUrl: 'cotizacion.agrupar.html',
    styleUrl: 'cotizacion.agrupar.html',
    imports: [PrimeNgModule, CommonModule],
    standalone: true
})

export class AgruparCotizacion implements OnInit {

    private srv = inject(CotizacionServicio);
    private servicioFormalizacion = inject(FormalizacionServicio);
    private hoy: Date = new Date();

    _cotizacionesActivas!: iCotizacion[];
    _cotizacionesAgrupadas!: iCotizacion[];
    _cotizacionesYaAgrupadas$!: Observable<iListaCotizacionesAgrupadas[]>;
    _cotizaciones$!: Observable<iCotizacion[]>;

    _idCotizacion: number = 0;

    _mostrarFormalizacion: boolean = false;
    _consecutivo!: string;
    private consecutivo: number = 0;
    _esRequeridoComprobante: boolean = false;
    _esFormatoIncorrecto: boolean = false;
    _fechaValidaRequerida: boolean = false;
    _fechaInvalidaCotizacion: boolean = false;
    _fechaInvalidaExpiracion: boolean = false;
    _fechaCotizacionHecha!: string;
    private fechaCotizacionHecha!: string;
    _fechaExpiracion!: string;
    _guardando: boolean = false;
    _desHabilitarAplicar: boolean = false;
    _mostrarPendiente: boolean = false;
    _credito: boolean = false;
    _mostrarAgrupacion: boolean = false;
    private numeroConsecutivo: number = 0;

    _anno: string = this.hoy.getFullYear().toString();

    private idFuncionario: number = 0;

    _esAsistenteDDC: boolean = false;
    _esJefaturaDM: boolean = false;
    _esJefaturaDP: boolean = false;
    _esAgente: boolean = false;

    private elementosEnLaAgrupacion: number = 0;
    _desHabilitaAplicarAgrupacion: boolean = true;

    constructor(private router: Router, private ref: ChangeDetectorRef) {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil: number = valorSesion.idPerfil;
        this.idFuncionario = valorSesion.idUsuario;

        if (perfil == 4) this._esAsistenteDDC = true;
        if (perfil == 6) this._esJefaturaDP = true;
        if (perfil == 7) this._esJefaturaDM = true;
        if (perfil == 2) this._esAgente = true;

        if ((perfil !== 1) && (perfil !== 2) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado']);
    }

    ngOnInit(): void {
        this.traeCotizacionesActivas();
        this.traeCotizacionesYaAgrupadas();
    }

    traeCotizacionesYaAgrupadas() {
        this._cotizacionesYaAgrupadas$ = this.srv.obtenerListadoCotizacionesAgrupadas();
    }

    traeCotizacionesActivas() {
        this.srv.traeTodasCotizacionesActivas().subscribe({
            next: cotizaciones => {
                this._cotizacionesActivas = cotizaciones;
                this._cotizacionesAgrupadas = [];

                this.ref.detectChanges();
            },
            error: err => console.error(err)
        })
    }

    volverListado() {
        this.router.navigate(['cotizacion/listar']);
    }

    colocaCerosAlNumeroEntero(numero: number): string {
        let numeroConFormato: string = '';
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

    guardarListadoAgrupado() {
        let cotizaciones : string = '';
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        this._cotizacionesAgrupadas.forEach(items=>{
            cotizaciones = cotizaciones + ', ' + 'DDC-CO-' + this.colocaCerosAlNumeroEntero(items.consecutivo) + '-' + anno.toString();
        })

        cotizaciones = cotizaciones + '.';

        const cotizacion: iCotizacionAgrupada[] = [];

        Swal.fire({
            title: "¿Confirma?",
            showDenyButton: true,
            confirmButtonText: "Confirmo",
            denyButtonText: `Cancelar`,
            text : (`Va a agrupar las cotizaciones: ${cotizaciones}`).replace(' , ', ' ')
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                
                this._cotizacionesAgrupadas.forEach(item => {
                    cotizacion.push({
                        consecutivo: 0,
                        fechaHora: '',
                        idAgrupacion: 0,
                        idCliente: item.idCliente,
                        idCotizacion: item.idCotizacion,
                        idFuncionario: this.idFuncionario,
                        indicadorEstado: 'V'
                    })
                })

                this.srv.ingresaCotizacionAgrupada(cotizacion).subscribe({
                    next: resultado => {
                        if (resultado.valor == '1') {
                            Swal.fire({
                                title: "¡Gracias!",
                                text: "Las cotizaciones han sido agrupadas.",
                                icon: "success"
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "No se pudo agrupar correctamente las cotizaciones."
                            });
                            console.log(resultado)
                        }
                    },
                    error: err => console.error(err)
                })

            }
        });

    }

    esParaFormalizar(agrupacion: iListaCotizacionesAgrupadas) {
        if ((this._esAsistenteDDC) || (this._esJefaturaDM) || (this._esJefaturaDP)) return false;

        return ((agrupacion.indicadorEstado == 'Activa'));
    }

    esParaAnular(agrupacion: iListaCotizacionesAgrupadas) {
        if ((this._esAsistenteDDC) || (this._esJefaturaDM) || (this._esJefaturaDP)) return false;

        return ((agrupacion.indicadorEstado == 'Activa'));
    }

    esParaAprobar(agrupacion: iListaCotizacionesAgrupadas): boolean {
        if ((this._esJefaturaDM) || (this._esJefaturaDP)) {
            if (agrupacion.indicadorEstado == 'Pendiente Validación') return true;
            else return false
        } else return false;
    }

    mostrarFormalizacion(cotizacion: iListaCotizacionesAgrupadas) {
        const intervaloContenedor = setInterval(() => {
            if (document.getElementById('comprobantePago')) {
                clearInterval(intervaloContenedor);
                (<HTMLInputElement>document.getElementById('comprobantePago')).disabled = false;
            }
        }, 300);

        const fechaHoy: Date = new Date();
        const anno: number = fechaHoy.getFullYear();

        this.fechaCotizacionHecha = cotizacion.fechaHora;
        this._fechaCotizacionHecha = this.fechaCotizacionHecha;

        const fechaParaMostrar: string = this.daFormatoFechaCotizacion(this.fechaCotizacionHecha.split(' ')[0]);

        this._consecutivo = `DDC-AG-${this.colocaCerosAlNumeroEntero(cotizacion.consecutivo)}-${anno}`;
        this.consecutivo = cotizacion.consecutivo;

        const intervalo = setInterval(() => {
            if (document.getElementById('montoDolares')) {
                clearInterval(intervalo);
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = fechaParaMostrar;
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + cotizacion.montoDolares.toLocaleString('es-CR', { minimumFractionDigits: 2 }).replace(',', '.');
            }
        }, 300)

        this._credito = false;
        this._mostrarFormalizacion = true;

        //this._idCotizacion = cotizacion.idCotizacion;
        //this._tipoCambio = cotizacion.tipoCambio;
        //this._justificacion = cotizacion.anotaciones;
        //this._fechaExpiracion = cotizacion.fechaExpiracion;
    }

    entraComprobante() {
        this._esRequeridoComprobante = false;
        this._esFormatoIncorrecto = false;
    }

    validaComprobantes() {
        const codigo: string = (<HTMLInputElement>document.getElementById('codigoCIUU')).value;

        if (codigo == '') {
            this._esRequeridoComprobante = true;
            return;
        }

        if (!codigo.includes('.')) {
            this._esFormatoIncorrecto = true;
            return;
        }

        for (let i = 0; i < codigo.length; i++) {
            const caracter = codigo[i];
            if (!(/[a-zA-Z0-9]/.test(caracter)) && caracter !== '.') {
                this._esFormatoIncorrecto = true;
                return;
            }
        }

    }

    entraFecha() {
        this._fechaValidaRequerida = false;
        this._fechaInvalidaCotizacion = false;
        this._fechaInvalidaExpiracion = false;
    }

    saleFecha() {
        const fechaHoy: Date = new Date();

        const [anno, mes, dia] = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value.split('-');
        const fechaElegida = `${mes}/${dia}/${anno}`;
        const fechaElegidaConvertida: number = Date.parse(fechaElegida);
        const fechaCotizacionConvertida: number = Date.parse(this.fechaCotizacionHecha.split(' ')[0]);
        const fechaExpiracionConvertida: number = Date.parse(this._fechaExpiracion.split(' ')[0]);

        if (fechaElegidaConvertida < fechaCotizacionConvertida) {
            this._fechaInvalidaCotizacion = true;
            this._desHabilitarAplicar = true;
            return;
        }

        if (fechaElegidaConvertida > fechaExpiracionConvertida) {
            this._fechaInvalidaExpiracion = true;
            this._desHabilitarAplicar = true;
            return;
        }

        if ((!this._fechaInvalidaCotizacion) && (!this._fechaInvalidaExpiracion)) this._desHabilitarAplicar = false;
    }

    formalizarVenta() {
        if (!this.validaLaFormalizacion()) return;
        this._guardando = true;

        const fechaHora: string = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value;
        const montoDolares: number = this.daFormatoNumero((<HTMLInputElement>document.getElementById('montoDolares')).value);

        const comprobantePago: string = '';
        const numeroFactura: string = '';

        this._mostrarFormalizacion = false;

        Swal.fire({
            title: "¿Formalizar?",
            text: "Va a formalizar la cotización número: " + this._consecutivo,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#689f38",
            cancelButtonColor: "#d32f2f",
            confirmButtonText: "Sí, formalizar."
        }).then((resultado) => {
            if (resultado.isConfirmed) {

                const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

                const formalizacion: iFormalizacionParaSalvar = {
                    consecutivo: this.consecutivo,
                    fechaHora: fechaHora,
                    idCotizacion: this._idCotizacion,
                    idFuncionario: valorSesion.idUsuario,
                    indicadorEstado: 'P',
                    justificacionCompra: '',
                    montoColones: 0,
                    montoDolares: montoDolares,
                    numeroFacturaFonafifo: numeroFactura,
                    numeroTransferencia: this._credito ? '' : comprobantePago,
                    creditoDebito: this._credito ? 'C' : 'D',
                    numeroComprobante: '',
                    numeroCIIU: ''
                }

                this.servicioFormalizacion.registraUnaFormalizacionAgrupada(formalizacion).subscribe({
                    next: (respuesta) => {
                        this._guardando = false;
                        if (respuesta.valor == '1') {
                            Swal.fire({
                                title: "¡Gracias!",
                                text: "La cotización ha sido formalizada.",
                                icon: "success"
                            }).then(() => {
                                location.reload();
                            });
                        }
                    },
                    error: (err) => {
                        console.error(err);
                        this._guardando = false;
                    }
                })

            } else {
                location.reload();
            }
        });
    }

    cancelarFormalizacion() {
        this._mostrarFormalizacion = false;
        this._mostrarPendiente = false;
    }

    daFormatoFechaCotizacion(fecha: string): string {
        const [mes, dia, anno] = fecha.split('/');

        return `${anno}-${mes}-${dia}`;
    }

    validaLaFormalizacion(): boolean {
        const fechaHora: string = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value;

        if (fechaHora == '') {
            this._fechaValidaRequerida = true;
            return false;
        }

        if (this._esRequeridoComprobante) return false;
        if (this._esFormatoIncorrecto) return false;

        return true;
    }

    daFormatoNumero(monto: string): number {
        let montoEnNumeros: string = '';

        monto.split('').forEach(item => {
            if (item.charCodeAt(0) != 160) montoEnNumeros = montoEnNumeros + item
        });

        if (montoEnNumeros.includes('₡')) {
            montoEnNumeros = montoEnNumeros.replace('₡', '');
        } else {
            montoEnNumeros = montoEnNumeros.replace('$', '');
        }

        return Number(montoEnNumeros);
    }

    formalizacionCredito(evento: any) {
        if (evento.checked) {
            this._credito = true;
            this._esRequeridoComprobante = false;
        } else {
            this._credito = false;
        }
    }

    anularCotizacion(consecutivo: number) {
        const hoy: Date = new Date();
        const anno: number = hoy.getFullYear();

        const consecutivoToAnular: string = `DDC-AG-${this.colocaCerosAlNumeroEntero(consecutivo)}-${anno}`
        Swal.fire({
            title: `Va a anular la agrupación número: ${consecutivoToAnular} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                Swal.fire({
                    title: 'Descripción de la anulación:',
                    input: 'text',
                    showCancelButton: true
                }).then((descripcionDeLaAnulacion) => {
                    if (descripcionDeLaAnulacion.isConfirmed) {

                        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
                        const cotizacionParaAnular: iAnulaCotizacion = {
                            descripcion: descripcionDeLaAnulacion.value,
                            idCotizacion: consecutivo,
                            idUsuario: valorSesion.idUsuario
                        }

                        this.srv.anulaUnaAgrupacion(cotizacionParaAnular).subscribe({
                            next: (respuesta) => {
                                if (respuesta.valor == '1') {
                                    Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                                        location.reload();
                                    });
                                }
                            },
                            error: (err) => console.error(err)
                        })
                    }

                })
            }
        });

    }

    verAgrupacion(agrupacion: iListaCotizacionesAgrupadas) {
        this._mostrarAgrupacion = true;
        this.numeroConsecutivo = agrupacion.consecutivo;

        this._cotizaciones$ = this.srv.traeCotizacionesPorConsecutivo(agrupacion.cotizaciones);
        this.ref.detectChanges();
    }

    aprobarAgrupacion() {
        this._mostrarAgrupacion = false;
        const actualizacion : iActualizaIncadorEstadoAgrupacion = {
            consecutivo: this.numeroConsecutivo,
            idFuncionario: this.idFuncionario,
            indicadorEstado: 'A',
            justificacion: ''
        }

        this.srv.actualizaEstadoAgrupacion(actualizacion).subscribe({
            next: resultado => {
                console.log(resultado)

                if(resultado.valor == '1') {
                    Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo aprobar la cotización."
                    });
                }
            },
            error: err => console.error(err)
        })

    }

    cancelarAprobacion() {
        this._mostrarAgrupacion = false;

        Swal.fire({
            title: "Justificación de la desaprobación:",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Aplicar"
        }).then((result) => {
            if (result.isConfirmed) {
                const actualizacion: iActualizaIncadorEstadoAgrupacion = {
                    consecutivo: this.numeroConsecutivo,
                    idFuncionario: this.idFuncionario,
                    indicadorEstado: 'R',
                    justificacion: result.value
                }

                this.srv.actualizaEstadoAgrupacion(actualizacion).subscribe({
                    next: resultado => {
                        console.log(resultado)
                        Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                            location.reload();
                        });
                    },
                    error: err => console.error(err)
                })

            } else {
                this._mostrarAgrupacion = true;
                this.ref.detectChanges();
            }
        });

    }

    determinaColorDeEstado(indicadorEstado: string): any {
        let colorDeEstado: any;

        switch (indicadorEstado) {
            case 'Activa':
                colorDeEstado = { background: '#15803D' };
                break;

            case 'Inactiva':
                colorDeEstado = { background: '#D32F2F' };
                break;

            case 'Pendiente':
                colorDeEstado = { background: '#0378B0' };
                break;

            case 'Formalizada':
                colorDeEstado = { background: '#15803D' };
                break;

            case 'Enviada':
                colorDeEstado = { background: '#0378B0' };
                break;

            case 'Pendiente Cierre':
                colorDeEstado = { background: '#0378B0' };
                break;

            case 'Pendiente Validación':
                colorDeEstado = { background: '#0378B0' };
                break;

            case 'Rechazada':
                colorDeEstado = { background: '#D32F2F' };
                break;
        }

        return colorDeEstado;
    }

    haciaElTarget(evento: any) {
        this.elementosEnLaAgrupacion += evento.items.length;
        if (this.elementosEnLaAgrupacion >= 2) {
            this._desHabilitaAplicarAgrupacion = false;
        }
    }

    haciaElOrigen(evento: any) {
        this.elementosEnLaAgrupacion -= evento.items.length;

        if (this.elementosEnLaAgrupacion < 2) {
            this._desHabilitaAplicarAgrupacion = true;
        }
    }

}