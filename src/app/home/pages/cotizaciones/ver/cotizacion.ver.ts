import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule, registerLocaleData } from "@angular/common";
import { BehaviorSubject, Observable } from "rxjs";
import { iCliente } from "../../clientes/interfaces/iCliente";
import { ClienteServicio } from "../../clientes/servicio/cliente.servicio";
import { TextosParaPlantillas } from "../servicio/textos-para-plantillas";
import localeEsCR from '@angular/common/locales/es-CR';
import { ConvierteNumerosEnLetras } from "../servicio/numero-en-letras";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";
import { ProyectoServicio } from "../../proyecto/servicio/proyecto.servicio";
import { CotizacionServicio } from "../servicio/cotizacion.servicio";
import { ActivatedRoute, Router } from "@angular/router";
import { iUsuarioVista } from "../../usuarios/interfaces/iusuario";
import { UsuarioServicio } from "../../usuarios/servicio/usuario.servicio";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TextosParaPlantillaEnIngles } from "../servicio/textos-para-plantilla-ingles";
import { iCotizacion, iExportacionArchivoCotizacion, iValidaCotizacion } from "../interfaces/iCotizacion";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import Swal from "sweetalert2";

registerLocaleData( localeEsCR );

@Component({
    selector : 'ver-cotizacion',
    templateUrl : 'cotizacion.ver.html',
    styleUrl : 'cotizacion.ver.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection : ChangeDetectionStrategy.OnPush,
    providers : [{provide: LOCALE_ID, useValue: 'es-CR'}]
})


export class VerCotizacion implements OnInit {

    private servicioProyecto = inject(ProyectoServicio);
    _proyectos$! : Observable<iProyecto[]>;
    
    private servicioCliente = inject(ClienteServicio);
    _clientes$! : Observable<iCliente[]>;

    private servicioUsuario = inject(UsuarioServicio);
    _funcionarios$!: Observable<iUsuarioVista[]>;

    _cotizacionElegida! : iCotizacion;

    _encGcr : string = TextosParaPlantillas.E_GCR;
    _encMinisterio : string = TextosParaPlantillas.E_MINISTERIO;
    _encFonafifo : string = TextosParaPlantillas.E_FONAFIFO;
    _encDir_1 : string = TextosParaPlantillas.E_DIR_1;
    _encDir_2 : string = TextosParaPlantillas.E_DIR_2;
    _encTel : string = TextosParaPlantillas.E_TEL;
    _encFax : string = TextosParaPlantillas.E_FAX;
    
    _tituloCotizacion : string = TextosParaPlantillas.TITULO_COTIZACION;
    _consecutivo! : string;
    _fechaExpiracion : string = 'Válido hasta el: ';

    _fechaActual! : Date;
    _fechaAproximadaVencimiento! : Date;
    _textoFechaInicio : string = TextosParaPlantillas.TEXTO_ACOMPANNA_FECHA;
    _fechaAproximadaVencimientoEnIngles! : string;
    _fechaActualEnIngles! : string;

    idProyectoElegido : number = 0;
    idClienteElegido : number = 0;
    consecutivoCorrespondiente : number = 0;
    idFuncionario : number = 0;
    subTotal : number = 0;
    montoColones : number = 0;
    montoDolares : number = 0;

    _nombreClienteElegido! : string;
    _cedulaClienteElegido! : string;
    _contactoClienteElegido! : string;
    _emailClienteElegido! : string;
    _telefonoClienteElegido! : string;
    _direccionClienteElegido! : string;

    _cantidad! : string;
    cantidad : number = 0;

    _precioEnDolaresSugerido! : string;
    precio : number = 0;

    _resultadoCantidadPorPrecio! : string;

    _descripcion! : string;
    _montoEnLetras : string = '';

    _textoDescriptivoFinalEraParte : string = TextosParaPlantillas.TEXTO_FINAL_1;
    _textoDescriptivoFinalDaParte : string = TextosParaPlantillas.TEXTO_FINAL_2;

    _funcionario : string = '';
    _departamento : string = TextosParaPlantillas.DEPARTAMENTO;

    _nombreFuncionario! : string;
    _emailFuncionario! : string;
    _telefonoFuncionario! : string;

    idCotizacion : number = 0;

    _muestraCotizacion$ : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    cuentaBancariaConvenio : boolean = false;
    cuentaBancariaPSAMujer : boolean = false;
    _nombreProyectoElegido! : string;
    _anotacionesClienteElegido! : string;
    _justificacionClientePorDescuesto! : string;
    _cuentaConvenio! : string;
    cambioDeIdioma : boolean = false;
    _fechaAproximadaVencimientoString! : string;

    muestraBotonExportar : boolean = true;
    muestraBotonEnviar : boolean = true;

    _esInactiva : boolean = true;
    _esJefatura : boolean = false;

    _habilitaPrecio : boolean = false;
    _habilitaJustificacion : boolean = false;

    _muestraObservaciones : boolean = false;
    _datoRequerido : boolean = false;
    _cantidadMenor : boolean = false;
    _esAsistenteDDC : boolean = false;

    private ingresaPor! : string;

    _esDeUsoInterno : boolean = false;

    constructor(private srvConvertidorNumerosEnLetras : ConvierteNumerosEnLetras, private srv : CotizacionServicio, private route : ActivatedRoute, private router : Router){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        if(perfil == 4) this._esAsistenteDDC = true;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)&& (perfil !== 9)) this.router.navigate(['no-encontrado'])

        if((perfil == 7) || (perfil == 6)) this._esInactiva = false;

        if((perfil == 1) || (perfil == 7) || (perfil == 6) || (perfil == 9)) this._esJefatura = true;
    }

    ngOnInit(): void {
        const parametroInterno : string = this.route.snapshot.paramMap.get('id')!;
        this.ingresaPor = parametroInterno.slice(-1);
        this.idCotizacion = Number(parametroInterno.slice(0, parametroInterno.length - 1));

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        this.idFuncionario = valorSesion.idUsuario;
        
        this.traeCotizacionElegida();

        const intervalo = setInterval(()=>{
            if(this._consecutivo != undefined) {
                this._muestraCotizacion$.next(true)
                clearInterval(intervalo);
            }
        },300);
    }

    //#region Condiciones Iniciales
        traeCotizacionElegida(){
            this.srv.traeCotizacionPorId(this.idCotizacion).subscribe({
                next : (cotizacion) => {
                    this._cotizacionElegida = cotizacion[0];
                    
                    if((this._cotizacionElegida.indicadorEstado == 'Inactiva') || 
                        (this._cotizacionElegida.indicadorEstado == 'Pendiente Validación') || 
                        (this._cotizacionElegida.indicadorEstado == 'Rechazada')) {
                        
                        this._esInactiva = false;
                    }

                    this.traeNumeroConsecutivo();
                    this.colocaFechasCotizacion();
                    this.traeProyectoElegido();
                    this.traeClienteElegido();
                    this.poneDatosDeLaCotizacion();
                    this.colocaDatosFuncionario();
                },
                error : (err) => console.error(err)
            });
        }
    //#endregion

    //#region Consecutivo

        traeNumeroConsecutivo() {
            const siglas : string = 'DDC-CO-';
            const anno : number =  new Date().getFullYear();
            
            this._consecutivo = siglas + this.colocaCerosAlNumeroEntero() + '-' + String(anno);
        }

        colocaCerosAlNumeroEntero() : string {
            const numeroConsecutivo : number = this._cotizacionElegida.consecutivo;
            let numeroConFormato : string = '';

            switch(numeroConsecutivo.toString().length) {
                case 1:
                    numeroConFormato = '00' + numeroConsecutivo.toString();
                    break;
                case 2:
                    numeroConFormato = '0' + numeroConsecutivo.toString();
                    break;
                case 3:
                    numeroConFormato = numeroConsecutivo.toString();
                    break;
            }

            return numeroConFormato;
        }

    //#endregion

    //#region Fechas

        colocaFechasCotizacion() {
            const fechaExpiracion : string = this._cotizacionElegida.fechaExpiracion;
            const fechaCotizacion : string = this._cotizacionElegida.fechaHora;
            
            this._fechaAproximadaVencimiento = new Date(fechaExpiracion);
            this._fechaActual = new Date(fechaCotizacion);
        }

        colocaLaFechaDeVencimiento() {
            const fechaEnCadena : string = this._fechaAproximadaVencimiento.toISOString().split('T')[0];
            const opciones : any = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
    
            this._fechaAproximadaVencimientoEnIngles = this._fechaAproximadaVencimiento.toLocaleDateString('en-US', opciones);
            this._fechaAproximadaVencimientoString = fechaEnCadena;
            this._fechaActualEnIngles = new Date().toLocaleDateString('en-US', opciones);
        }

    //#endregion

    //#region Proyecto

        traeProyectoElegido() {
            this.idProyectoElegido = this._cotizacionElegida.idProyecto;
            this._nombreProyectoElegido = this._cotizacionElegida.proyecto;
            this._proyectos$ = this.servicioProyecto.traeProyectoPorId(this.idProyectoElegido);
        }

    //#endregion

    //#region Cliente

        traeClienteElegido(){
            this.idClienteElegido = this._cotizacionElegida.idCliente;
            this._anotacionesClienteElegido = this._cotizacionElegida.anotaciones;
            this._justificacionClientePorDescuesto = this._cotizacionElegida.justificacionCompra;
            
            this._clientes$ = this.servicioCliente.traeClientePorId(this.idClienteElegido);
            this.seleccionaUnCliente();
        }

        seleccionaUnCliente() {
            this._clientes$.subscribe({
                next : (clientes) => {
                    const cliente : iCliente = clientes.filter(item=>item.idCliente == this.idClienteElegido)[0];
                    
                    this._nombreClienteElegido = cliente.nombreCliente;
                    this._cedulaClienteElegido = cliente.cedulaCliente;
                    this._contactoClienteElegido = cliente.contactoCliente;
                    this._emailClienteElegido = cliente.emailCliente;
                    this._telefonoClienteElegido = cliente.telefonoCliente.split(';')[0];
                    this._direccionClienteElegido = cliente.direccionFisica;
                    this._precioEnDolaresSugerido = this.precio.toLocaleString();
                }
            })
        }

    //#endregion

    //#region Cotizacion

        poneDatosDeLaCotizacion() {
            this.cantidad = this._cotizacionElegida.cantidad;
            this._cantidad = this.cantidad.toLocaleString('es-CR', { minimumFractionDigits : 2 });

            this.precio = this._cotizacionElegida.precioUnitario;
            this._precioEnDolaresSugerido = this.precio.toLocaleString('es-CR', { minimumFractionDigits : 2 });

            this.subTotal = this._cotizacionElegida.subTotal;
            this._resultadoCantidadPorPrecio = this.subTotal.toLocaleString('es-CR', { minimumFractionDigits : 2 });
            
            this._cuentaConvenio = this._cotizacionElegida.cuentaConvenio;
            this.seleccionaNumeroCuenta();

            this.conformaTextoDescriptivoCotizacion();

            this.convierteMontoEnLetras(this.subTotal);

            // if(this._cotizacionElegida.cotizacionEnIngles == 1){
            //     this.cambioDeIdioma = true;
            //     this.cuentaBancariaConvenio = true;
            //     this._cuentaConvenio = '';
            // } else {
            //     this.cambioDeIdioma = false;
            //     this.cuentaBancariaConvenio = false;
            //     this._cuentaConvenio = '';
            // }

            if(this._cotizacionElegida.justificacionCompra != '') {
                this._habilitaPrecio = true;
                this._justificacionClientePorDescuesto = this._cotizacionElegida.justificacionCompra;
            }

            if(this._cotizacionElegida.anotaciones != '') {
                this._habilitaJustificacion = true;
                this._anotacionesClienteElegido = this._cotizacionElegida.anotaciones;
            }

            this.cambiaCotizacionToIngles();
        }

        conformaTextoDescriptivoCotizacion() {
            this._descripcion = TextosParaPlantillas.TEXTO_DESCRIPTIVO_COTIZACION_1;
            this._descripcion = this._descripcion + TextosParaPlantillas.TEXTO_DESCRIPTIVO_COTIZACION_2;
            this._descripcion = this._descripcion + TextosParaPlantillas.TEXTO_DESCRIPTIVO_COTIZACION_3;
        }

        convierteMontoEnLetras(monto : number) {
            this._montoEnLetras = this.srvConvertidorNumerosEnLetras.convertidor(monto);
        }

        cambiaCotizacionToIngles() {
            if(this.cambioDeIdioma) {
                //this._fechaActual = new Date();
                this._tituloCotizacion = TextosParaPlantillaEnIngles.TITULO_COTIZACION;
                this._fechaExpiracion = 'Expiry: ';
                this.conformaTextoDescriptivoCotizacionEnIngles();
                this._textoDescriptivoFinalEraParte = TextosParaPlantillaEnIngles.TEXTO_FINAL_1;
                this._textoDescriptivoFinalDaParte = TextosParaPlantillaEnIngles.TEXTO_FINAL_2;
                this.colocaLaFechaDeVencimiento();
            } else {
                //this._fechaActual = new Date();
                this._tituloCotizacion = TextosParaPlantillas.TITULO_COTIZACION;
                this._fechaExpiracion = 'Válido hasta el: ';
                this.conformaTextoDescriptivoCotizacion();
                this._textoDescriptivoFinalEraParte = TextosParaPlantillas.TEXTO_FINAL_1;
                this._textoDescriptivoFinalDaParte = TextosParaPlantillas.TEXTO_FINAL_2;
            }
        }

        conformaTextoDescriptivoCotizacionEnIngles() {
            this._descripcion = TextosParaPlantillaEnIngles.TEXTO_DESCRIPTIVO_COTIZACION_1;
            this._descripcion = this._descripcion + TextosParaPlantillaEnIngles.TEXTO_DESCRIPTIVO_COTIZACION_2;
            this._descripcion = this._descripcion + TextosParaPlantillaEnIngles.TEXTO_DESCRIPTIVO_COTIZACION_3;
        }

        seleccionaNumeroCuenta() {
            if(this._cotizacionElegida.indicadorEstado != 'Uso Interno') {
                switch(this._cuentaConvenio){
                    case 'N':
                        this.cuentaBancariaConvenio = false;
                        this.cuentaBancariaPSAMujer = false;
                        break;
    
                    case 'F':
                        this.cuentaBancariaConvenio = true;
                        this.cuentaBancariaPSAMujer = false;
                        break;
    
                    case 'M':
                        this.cuentaBancariaConvenio = false;
                        this.cuentaBancariaPSAMujer = true;
                        break;
                }
            } else {
                this._esDeUsoInterno = true;
            }
            
        }

    //#endregion

    //#region Funcionario

        colocaDatosFuncionario() {
            this._funcionarios$ = this.servicioUsuario.traeTodosUsuarios();
            this._funcionarios$.subscribe({
                next: (funcionarios) => {
                    const funcionario : iUsuarioVista = funcionarios.filter(item => item.idUsuario == this._cotizacionElegida.idUsuario)[0];
                    const nombreFuncionario: string = this.daFormatoNombre(funcionario.nombre)
                        + ' ' + this.daFormatoNombre(funcionario.primerApellido)
                        + ' ' + this.daFormatoNombre(funcionario.segundoApellido);

                    this._nombreFuncionario = nombreFuncionario;
                    this._emailFuncionario = funcionario.usuario;
                    this.idFuncionario = funcionario.idUsuario;
                    this._telefonoFuncionario = funcionario.telefonoFijoTrabajo;

                    const intervalo = setInterval(() => {
                        if (document.getElementById('nombreFuncionario')) {
                            clearInterval(intervalo);
                            (<HTMLInputElement>document.getElementById('nombreFuncionario')).value = this._nombreFuncionario;
                            (<HTMLInputElement>document.getElementById('emailFuncionario')).value = this._emailFuncionario;
                            (<HTMLInputElement>document.getElementById('telefonoFuncionario')).value = this._telefonoFuncionario;
                        }
                    }, 300)
                },
                error: (err) => console.error(err)
            })
        }

        daFormatoNombre(cadena: string) {
            let cadenaConFormato: string = '';
    
            cadena = cadena.toLowerCase();
            let arreglo: string[] = cadena.split(' ');
    
            if (arreglo.length > 1) {
                arreglo.forEach(item => {
                    cadenaConFormato = cadenaConFormato + ' ' + item.charAt(0).toUpperCase() + item.slice(1)
                });
    
                return cadenaConFormato;
            } else {
                return cadena.charAt(0).toUpperCase() + cadena.slice(1);
            }
        }

    //#endregion

    irAListar() {
        switch(this.ingresaPor) {
            case '0':
                this.router.navigate(['cotizacion/listar']);
                break;

            case '1':
                this.router.navigate(['inventario/listar']);
                break;

            case '2':
                this.router.navigate(['reportes/cotizacion/listado-mensual']);
                break;
        }
    }

    descargarPDF(){
        const documento : HTMLElement = <HTMLElement>document.getElementById('documentoCotizacion');
        const intervalo = setInterval(()=>{
            if(documento) {
                clearInterval(intervalo);
                
                html2canvas(documento).then((canva)=>{
                    const anchoImagen : number = documento.offsetWidth;
                    const alturaImagen : number = documento.offsetHeight;
                    const contenido = canva.toDataURL('image/png');
                    const pdf = new jsPDF('portrait', 'px', [anchoImagen, alturaImagen]);
    
                    pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);
                    window.open(pdf.output('bloburl'), '_blank');
                })
            }
        },300)
    }

    enviarPDF() {

        Swal.fire({
            title: `Va a enviar por correo la cotización número: ${this._consecutivo} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if (confirmacion.isConfirmed) {
                Swal.fire({
                    title: 'Destinatario:',
                    text: "Puede disponer de varios correos electrónicos, separados por punto y coma (;), sin espacios.",
                    input: 'text',
                    inputValue : this._emailClienteElegido, 
                    showCancelButton: true,
                    inputValidator : (email) => {
                        let emailInvalido : number = 0;
                        let respuesta : boolean = true;

                        if(email.includes(';')){
                            email.split(';').forEach(item => {
                                const esEmailValido = item.match(/^(([^<>()[\]\\.,;:/\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                                if(!esEmailValido) emailInvalido += 1
                            })
                        } else {
                            const esEmailValido = email.match(/^(([^<>()[\]\\.,;:/\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                            if(!esEmailValido) emailInvalido += 1
                        }

                        if(emailInvalido > 0) respuesta = false;

                        return !respuesta && 'Debe ser un correo electrónico válido.'
                    }
                }).then((eventoEnvio)=>{
                    if(eventoEnvio.isConfirmed) {
                        const documento : HTMLElement = <HTMLElement>document.getElementById('documentoCotizacion');
                        
                        if(documento) {
    
                            html2canvas(documento).then((canva)=>{
                                const anchoImagen : number = documento.offsetWidth;
                                const alturaImagen : number = documento.offsetHeight;
                                const contenido = canva.toDataURL('image/png');
                                const pdf = new jsPDF('portrait', 'px', [anchoImagen, alturaImagen]);
                
                                pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);
                
                                const archivoToExportar : iExportacionArchivoCotizacion = {
                                    archivo : pdf.output('blob'),
                                    consecutivo : this._consecutivo,
                                    idCotizacion : this.idCotizacion,
                                    idCliente : this.idClienteElegido,
                                    idFuncionario : this.idFuncionario,
                                    destinatario : eventoEnvio.value
                                }
                
                                this.srv.enviaPorCorreoCotizacion(archivoToExportar).subscribe({
                                    next : (respuesta) => {
                                        if(respuesta.valor == '1') {
                                            Swal.fire('SICORE','La cotización se envío exitosamente.','success').then(()=>{
                                                this.router.navigate(['cotizacion/listar'])
                                            });
                                        }
                                    },
                                    error : (err) => console.error(err)
                                });
                            });
                        }
                    }
                })
            }
        });

    }

    paraVerBotonEnviar() : boolean {
        if(this._esAsistenteDDC) {
            return false;
        } else {
            return this._esInactiva;
        }
    }

    paraVerBotonDescargar() : boolean {
        return this._esInactiva;
    }

    validarCotizacion() {
        Swal.fire({
            title: `Va a aprobar la cotización número: ${this._consecutivo} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmo",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if(confirmacion.isConfirmed) {
                const cotizacion : iValidaCotizacion = {
                    idCotizacion : this._cotizacionElegida.idCotizacion,
                    idUsuario : this.idFuncionario,
                    observacion : ''
                }

                this.srv.validaUnaCotizacion(cotizacion).subscribe({
                    next: (respuesta) => {
                        if (respuesta.valor == '1') {
                            Swal.fire('SICORE', 'La cotización se aprobó exitosamente.', 'success').then(() => {
                                this.router.navigate(['cotizacion/listar'])
                            });
                        }
                    },
                    error: (err) => console.error(err)
                });
            }

        });
    }

    entraEnRechazarCotizacion() {
        Swal.fire({
            title: `Va a rechazar la cotización número: ${this._consecutivo} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmo",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if(confirmacion.isConfirmed) {
                this._muestraObservaciones = true;
            }
        });
    }

    rechazarCotizacion() {
        if(!document.getElementById('observaciones')) return;

        const observaciones : string = (<HTMLInputElement>document.getElementById('observaciones')).value;
        if(this.validaObservaciones(observaciones)) return;

        this._muestraObservaciones = false;
        
        const cotizacion: iValidaCotizacion = {
            idCotizacion: this._cotizacionElegida.idCotizacion,
            idUsuario: this.idFuncionario,
            observacion: observaciones
        }

        this.srv.rechazaUnaCotizacion(cotizacion).subscribe({
            next: (respuesta) => {
                if (respuesta.valor == '1') {
                    Swal.fire('SICORE', 'Se enviaron las observaciones exitosamente.', 'success').then(() => {
                        this.router.navigate(['cotizacion/listar']);
                    });
                }
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    paraVerBotonValidar () : boolean {
        if((this._cotizacionElegida.indicadorEstado == 'Pendiente Validación') && (this._esJefatura)) return true;
        else return false;
    }

    entraObservaciones() {
        this._datoRequerido = false;
        this._cantidadMenor = false;
    }

    validaObservaciones(observaciones : string) : boolean {
        if(observaciones == '') {
            this._datoRequerido = true;
            return true;
        }

        if(observaciones.length < 3) {
            this._cantidadMenor = true;
            return true;
        }

        return false;
    }
}