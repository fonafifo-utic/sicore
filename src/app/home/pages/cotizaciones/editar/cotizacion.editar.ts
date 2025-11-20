import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, LOCALE_ID, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule, registerLocaleData } from "@angular/common";
import { BehaviorSubject, Observable, of } from "rxjs";
import { iCliente, iSector } from "../../clientes/interfaces/iCliente";
import { ClienteServicio } from "../../clientes/servicio/cliente.servicio";
import { TextosParaPlantillas } from "../servicio/textos-para-plantillas";
import localeEsCR from '@angular/common/locales/es-CR';
import { ConvierteNumerosEnLetras } from "../servicio/numero-en-letras";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";
import { ProyectoServicio } from "../../proyecto/servicio/proyecto.servicio";
import { iCotizacion, iCotizacionParaSalvar, iJustificaciones, iTipoCompra } from "../interfaces/iCotizacion";
import { CotizacionServicio } from "../servicio/cotizacion.servicio";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { iUsuarioVista } from "../../usuarios/interfaces/iusuario";
import { UsuarioServicio } from "../../usuarios/servicio/usuario.servicio";
import { iInventario } from "../../inventario/interfaces/iInventario";
import { InventarioServicio } from "../../inventario/servicio/inventario.servicio";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormBuilder, FormGroup } from "@angular/forms";
import { TextosParaPlantillaEnIngles } from "../servicio/textos-para-plantilla-ingles";
import { iPersonalizacion } from "../../personalizacion/interfaces/iPersonalizacion";
import { PersonalizacionServicio } from "../../personalizacion/servicio/personalizacion.servicio";
import { EditarCliente } from "../../clientes/editar/cliente.editar";
import { iLoginSalida } from "../../../../auth/login/ilogin";

registerLocaleData(localeEsCR);

@Component({
    selector: 'editar-cotizacion',
    templateUrl: 'cotizacion.editar.html',
    styleUrl: 'cotizacion.editar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, EditarCliente],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: LOCALE_ID, useValue: 'es-CR' }]
})


export class EditarCotizacion implements OnInit {

    private servicioCliente = inject(ClienteServicio);
    private servicioProyecto = inject(ProyectoServicio);
    private servicioUsuario = inject(UsuarioServicio);
    private servicioInventario = inject(InventarioServicio);
    private servicioPersonalizacion = inject(PersonalizacionServicio)

    private fb = inject(FormBuilder);

    formCliente: FormGroup = this.fb.group({
        idSectorComercial: [''],
        idCliente: ['']
    });

    formProyecto: FormGroup = this.fb.group({
        idProyecto: ['']
    });

    _cotizacionElegida!: iCotizacion;

    private textoDesdePersonalizacion!: iPersonalizacion;

    _sectores$!: Observable<iSector[]>;
    _clientes$!: Observable<iCliente[]>;
    _clientesSectorTurismo$!: Observable<iCliente[]>;
    _proyectos$!: Observable<iProyecto[]>;
    _funcionarios$!: Observable<iUsuarioVista[]>;

    _tiposCompra!: iTipoCompra[];
    tipoCompraModelo!: string;
    tipoCompra: string = '';
    justificacion!: string;
    _justificaciones!: iJustificaciones[];
    _habilitaJustificacion: boolean = false;
    justificacionModelo!: string;
    _otraJustificacion: boolean = false;

    _encGcr: string = TextosParaPlantillas.E_GCR;
    _encMinisterio: string = TextosParaPlantillas.E_MINISTERIO;
    _encFonafifo: string = TextosParaPlantillas.E_FONAFIFO;
    _encDir_1: string = TextosParaPlantillas.E_DIR_1;
    _encDir_2: string = TextosParaPlantillas.E_DIR_2;
    _encTel: string = TextosParaPlantillas.E_TEL;
    _encFax: string = TextosParaPlantillas.E_FAX;

    _tituloCotizacion: string = TextosParaPlantillas.TITULO_COTIZACION;
    _consecutivo!: string;
    _fechaExpiracion: string = 'Válido hasta el: ';

    _fechaActual!: Date;
    _fechaActualEnIngles!: string;
    _fechaAproximadaVencimiento!: Date;
    _fechaAproximadaVencimientoEnIngles!: string;
    _textoFechaInicio: string = TextosParaPlantillas.TEXTO_ACOMPANNA_FECHA;
    _advertenciaFechaPasadaActual: boolean = false;

    idProyectoElegido: number = 0;
    idClienteElegido: number = 0;
    consecutivoCorrespondiente: number = 0;
    idFuncionario: number = 0;
    subTotal: number = 0;
    montoColones: number = 0;
    montoDolares: number = 0;

    _nombreClienteElegido!: string;
    _cedulaClienteElegido!: string;
    _contactoClienteElegido!: string;
    _emailClienteElegido!: string;
    _telefonoClienteElegido!: string;
    _direccionClienteElegido!: string;
    _anotacionesClienteElegido!: string;
    _justificacionClientePorDescuesto!: string;
    sectorClienteElegido: number = 0;

    _cantidad!: string;
    cantidad: number = 0;
    cantidadOriginal!: number;
    _remanenteDelProyecto!: number;
    _remanenteRealDelProyecto!: number;
    advertenciaRemanente: boolean = false;
    advertenciaPrecioExcedido: boolean = false;

    _precioEnDolaresSugerido!: string;
    precio: number = 0;

    _resultadoCantidadPorPrecio!: string;

    _descripcion!: string;
    _montoEnLetras: string = '';

    _textoDescriptivoFinalEraParte: string = TextosParaPlantillas.TEXTO_FINAL_1;
    _textoDescriptivoFinalDaParte: string = TextosParaPlantillas.TEXTO_FINAL_2;

    _funcionario: string = '';
    _departamento: string = TextosParaPlantillas.DEPARTAMENTO;

    _nombreFuncionario!: string;
    _emailFuncionario!: string;
    _telefonoFuncionario!: string;

    idCotizacion: number = 0;

    _muestraCotizacion$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    muestraVistaPDF: boolean = false;
    desHabilitaDropClientes: boolean = true;
    limiteSeleccionEnCliente: number = 1;

    _fechaAproximadaVencimientoString!: string;
    cuentaBancariaConvenio: boolean = false;
    cuentaBancariaPSAMujer: boolean = false;
    _cuentaConvenio!: string;
    _nombreProyectoElegido!: string;
    clienteElegido: any;
    _cambioDeIdioma: boolean = false;
    _desHabilitarBotonGuardar: boolean = false;
    cambioDeIdioma: boolean = false;

    _bloqueaNombre: boolean = true;
    _habilitaPrecio: boolean = true;
    _habilitaUsoInterno : boolean = true;
    _validaCantidad: boolean = false;
    _fechaValida: boolean = false;
    _fechaValidaSuperior: boolean = false;
    _validaAnotaciones: boolean = false;
    _validaAnotacioDescuento: boolean = false;
    _validaExtensionDescuento: boolean = false;
    _habilitarEditarCliente: boolean = true;
    _salvando: boolean = false;
    _validaLogitudAnotaciones: boolean = false;
    _desHabilitarSectores: boolean = true;

    _muestrarEdicionCliente: boolean = false;
    _muestraObservaciones: boolean = false;
    _lasObservaciones! : string;

    _validaAnotacioJustificacion : boolean = false;
    _validaExtensionJustificacion : boolean = false;
    _deshabilitaMotivoCompra : boolean = false;
    _desHabilitaFechaVencimiento : boolean = false;
    _desHabilitaNumeroCuenta : boolean = false;
    _desHabilitaIdioma : boolean = false;
    _desHabilitaTipoCompra : boolean = false;

    _checkDeUsoInterno : boolean = false;

    constructor(
        private srvConvertidorNumerosEnLetras: ConvierteNumerosEnLetras, private srv: CotizacionServicio,
        private route: ActivatedRoute, private router: Router, private ref: ChangeDetectorRef) {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil: number = valorSesion.idPerfil;

        if ((perfil !== 1) && (perfil !== 2) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.idCotizacion = Number(this.route.snapshot.paramMap.get('id')!);

        this.traeCotizacionElegida();
    }

    //#region condiciones iniciales

    traeCotizacionElegida() {
        this.srv.traeCotizacionPorId(this.idCotizacion).subscribe({
            next: (cotizacion) => {
                this._cotizacionElegida = cotizacion[0];

                this.traeNumeroConsecutivo();
                this.colocaFechasCotizacion();
                this.traeClienteElegido();
                this.traeProyectoElegido();
                this.poneDatosDeLaCotizacion();
                this.traeTextosDescriptivosPersonalizacion();
                this.colocaDatosFuncionario();
            },
            error: (err) => console.error(err)
        });
    }

    traeNumeroConsecutivo() {
        const siglas: string = 'DDC-CO-';
        const anno: number = new Date().getFullYear();

        this._consecutivo = siglas + this.colocaCerosAlNumeroEntero(this._cotizacionElegida.consecutivo) + '-' + String(anno);
        this.consecutivoCorrespondiente = this._cotizacionElegida.consecutivo;
        this.ref.detectChanges();
    }

    colocaFechasCotizacion() {
        this._fechaAproximadaVencimiento = new Date(this._cotizacionElegida.fechaExpiracion);
        this._fechaActual = new Date(this._cotizacionElegida.fechaHora);

        const opciones: any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        if (this._cotizacionElegida.cotizacionEnIngles) {
            this._fechaExpiracion = 'Expiry: ';
            const fechaDeExpiracion: Date = this._fechaAproximadaVencimiento;
            this._fechaAproximadaVencimientoEnIngles = fechaDeExpiracion.toLocaleDateString('en-US', opciones);
            this._fechaActualEnIngles = this._fechaActual.toLocaleDateString('en-US', opciones);
        }

        const [mes, dia, anno] = this._cotizacionElegida.fechaExpiracion.replace(' 00:00:00', '').split('/');
        const fecha: string = `${anno}-${mes}-${dia}`;
        this._fechaAproximadaVencimientoString = fecha;

        (<HTMLInputElement>document.getElementById('fechaVencimiento')).value = fecha;

        this.ref.detectChanges();
    }

    traeClienteElegido() {
        this._sectores$ = this.servicioCliente.traeTodosSectores();
        this._clientes$ = this.servicioCliente.traeTodosClientes();

        this.seleccionaUnCliente(null, this._cotizacionElegida.idCliente);
    }

    traeProyectoElegido() {
        this.idProyectoElegido = this._cotizacionElegida.idProyecto;
        this._proyectos$ = this.servicioProyecto.traeTodosProyectos();

        this.servicioProyecto.traeProyectoPorId(this.idProyectoElegido).subscribe({
            next: (proyectoElegido) => {

                this.formProyecto.get('idProyecto')?.setValue(this.idProyectoElegido);
                this._nombreProyectoElegido = proyectoElegido[0].proyecto;

                (<HTMLInputElement>document.getElementById('proyecto')).value = proyectoElegido[0].proyecto;
                (<HTMLInputElement>document.getElementById('ubicacionGeografica')).value = proyectoElegido[0].ubicacionGeografica;

                const inventario: Observable<iInventario[]> = this.servicioInventario.traeCompletoInventario();
                inventario.subscribe({
                    next: (totalInventario) => {
                        const inventario: iInventario = totalInventario.filter(item => item.idProyecto == this.idProyectoElegido)[0];

                        this._remanenteDelProyecto = inventario.comprometido;
                        this._remanenteRealDelProyecto = inventario.remanente;

                        this.ref.detectChanges();
                    }
                })

            }
        })
    }

    poneDatosDeLaCotizacion() {
        this.cantidad = this._cotizacionElegida.cantidad;
        this.cantidadOriginal = this._cotizacionElegida.cantidad;

        (<HTMLInputElement>document.getElementById('cantidad')).type = 'text';
        this._cantidad = this.cantidad.toLocaleString('es-CR');

        this.precio = this._cotizacionElegida.precioUnitario;
        (<HTMLInputElement>document.getElementById('precioUnitario')).value = String(this.precio);
        this._precioEnDolaresSugerido = this.precio.toLocaleString('es-CR');

        this.subTotal = this._cotizacionElegida.subTotal;
        (<HTMLInputElement>document.getElementById('valorLinea')).value = String(this.subTotal);
        this._resultadoCantidadPorPrecio = this.subTotal.toLocaleString('es-CR');

        this._cuentaConvenio = this._cotizacionElegida.cuentaConvenio;
        this.seleccionaNumeroCuenta(null);

        if ((this._cotizacionElegida.justificacionCompra != '')) {
            this._habilitaPrecio = true;
            (<HTMLInputElement>document.getElementById('ckHabilitaPrecio')).checked = true;

            const intervalo = setInterval(() => {
                if (document.getElementById('justificacionDescuento')) {
                    clearInterval(intervalo);
                    this._justificacionClientePorDescuesto = this._cotizacionElegida.justificacionCompra;
                    (<HTMLTextAreaElement>document.getElementById('justificacionDescuento')).value = this._cotizacionElegida.justificacionCompra;

                    this.ref.detectChanges();
                }
            }, 300)
        }

        this.colocaJustifcacion();

        this.justificacionModelo = this._cotizacionElegida.anotaciones;
        this.justificacion = this._cotizacionElegida.anotaciones;
        const numeroJustificacionesCoincidentes = this._justificaciones.filter(item => item.justificacion == this._cotizacionElegida.anotaciones).length;

        if (numeroJustificacionesCoincidentes == 0) {
            this._habilitaJustificacion = true;
            this._otraJustificacion = true;

            const intervalo = setInterval(() => {
                if (document.getElementById('anotaciones')) {
                    clearInterval(intervalo);

                    this.justificacionModelo = 'Otro motivo de compra';
                    this._anotacionesClienteElegido = this._cotizacionElegida.anotaciones;
                    (<HTMLTextAreaElement>document.getElementById('anotaciones')).value = this._cotizacionElegida.anotaciones;

                    this.ref.detectChanges();
                }
            }, 300)

        } else {
            this._anotacionesClienteElegido = this._cotizacionElegida.anotaciones;
        }

        this._cambioDeIdioma = Boolean(this._cotizacionElegida.cotizacionEnIngles);
        this.selecccionaIdioma(null);

        this.convierteMontoEnLetras(this.subTotal);

        this.colocaTipoCompra();
        this.tipoCompraModelo = this._cotizacionElegida.tipoCompra;

        this._lasObservaciones = this._cotizacionElegida.observacionDeAprobacion;

        if(this._cotizacionElegida.indicadorEstado == 'Uso Interno') {                 
            (<HTMLInputElement>document.getElementById('ckExcepcion')).checked = true;

            this.colocaComentarioDeUsoInterno();

            this.seleccionaExcepcion(null);
            this.ref.detectChanges();
        }
    }

    colocaTipoCompra() {
        const tiposCompra: iTipoCompra[] = [
            {
                tipoCompra: 'Convenio'
            },
            {
                tipoCompra: 'Compra Directa'
            },
            {
                tipoCompra: 'SICOP'
            },
            {
                tipoCompra: 'SINPE'
            },
            {
                tipoCompra: 'En Línea'
            },
        ];

        this._tiposCompra = tiposCompra;
    }

    colocaJustifcacion() {
        const justificaciones: iJustificaciones[] = [
            {
                justificacion: 'Compensación Inventario Anual'
            },
            {
                justificacion: 'Compensación Emisiones Combustibles'
            },
            {
                justificacion: 'Compensación Energía y/o A/C'
            },
            {
                justificacion: 'Compensación Viajes Aéreos'
            },
            {
                justificacion: 'Convenio o Alianza Público - Privado'
            },
            {
                justificacion: 'Convenio Especial ICT'
            },
            {
                justificacion: 'Otro motivo de compra'
            }
        ];

        this._justificaciones = justificaciones;
    }

    colocaDatosFuncionario() {
        this._funcionarios$ = this.servicioUsuario.traeTodosUsuarios();
        this._funcionarios$.subscribe({
            next: (funcionarios) => {
                const funcionario: iUsuarioVista = funcionarios.filter(item => item.idUsuario == this._cotizacionElegida.idUsuario)[0];
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

    traeTodosSectores() {
        this._sectores$ = this.servicioCliente.traeTodosSectores();
    }

    traeTodosProyectos() {
        this._proyectos$ = this.servicioProyecto.traeTodosProyectos();
    }

    //#endregion

    //#region código miselaneo

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

    colocaLosCamposDelClienteElegido() {
        this._clientes$.subscribe({
            next: (clientes) => {

                const cliente: iCliente = clientes.filter(item => item.idCliente == this.idClienteElegido)[0];
                this.formCliente.get('idSectorComercial')?.setValue(cliente.idSector);
                this.formCliente.get('idCliente')?.setValue([this.idClienteElegido]);

                if ((document.getElementById('direccionFisicaElegido') != undefined)) {
                    (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value = cliente.nombreCliente;
                    this._nombreClienteElegido = (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value;

                    (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value = cliente.cedulaCliente;
                    this._cedulaClienteElegido = (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value;

                    (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value = cliente.contactoCliente;
                    this._contactoClienteElegido = (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value;

                    (<HTMLInputElement>document.getElementById('emailClienteElegido')).value = cliente.emailCliente;
                    this._emailClienteElegido = (<HTMLInputElement>document.getElementById('emailClienteElegido')).value;

                    (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value = cliente.telefonoCliente;
                    this._telefonoClienteElegido = (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value.split(';')[0];

                    (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value = cliente.direccionFisica;
                    this._direccionClienteElegido = (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value;


                    if(!this._checkDeUsoInterno) this.precio = 7.5;
                    else this.precio = 0;
                        
                    this._precioEnDolaresSugerido = this.precio.toLocaleString().replace(',', '.');
                    (<HTMLInputElement>document.getElementById('precioUnitario')).value = this._precioEnDolaresSugerido;

                    this.sectorClienteElegido = cliente.idSector;
                    this._habilitarEditarCliente = false;
                }

            }
        })
    }

    poneEnBlancoEntradasCliente() {
        (<HTMLInputElement>document.getElementById('nombreCliente')).value = '';
        (<HTMLInputElement>document.getElementById('cedulaCliente')).value = '';
        (<HTMLInputElement>document.getElementById('contactoCliente')).value = '';
        (<HTMLInputElement>document.getElementById('emailCliente')).value = '';
        (<HTMLInputElement>document.getElementById('telefonoCliente')).value = '';
        (<HTMLInputElement>document.getElementById('direccionFisica')).value = '';
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

    daformatoAlNumeroIngresado(numero: string): number {
        return Number(numero);
    }

    validaNumerosYLetras(e: any): boolean {
        let cantidadDigitada: string = (<HTMLInputElement>document.getElementById('cantidad')).value.replace(',', '.');
        if (cantidadDigitada.length > 9) return false;

        if (!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)) {
            if (e.keyCode == 110) return true;
            return false;
        }

        return true;
    }

    daFormatoAFecha(fecha: Date): string {
        return fecha.toISOString().split('T')[0];
    }

    //#endregion

    //#region eventos de selección

    seleccionaUnCliente(e: any, idCliente: number) {
        if (e == null && idCliente != 0) {
            this.idClienteElegido = idCliente;
        } else {
            this.idClienteElegido = Number(e.value);
        }

        if (e != null) {
            if (e.value === 0 && idCliente == 0) {
                this.poneEnBlancoEntradasCliente();
                return;
            };
        }

        this.colocaLosCamposDelClienteElegido();
    }

    seleccionaUnSector(e: any) {
        this.formCliente.get('idCliente')?.setValue([]);
        this._clientes$ = this.servicioCliente.traeClientePorIdSector(e.value);

        this.desHabilitaDropClientes = false;
        this.formCliente.get('idCliente')?.enable();
    }

    seleccionaUnaFechaVencimiento(evento: any) {
        this.validaFechaVencimiento(evento);
    }

    seleccionaNumeroCuenta(evento: any) {
        let cuentaConvenio;

        if (evento == null) cuentaConvenio = this._cuentaConvenio;
        else cuentaConvenio = evento.target.value;

        (<HTMLInputElement>document.getElementById('ckConvenio')).checked = false;
        (<HTMLInputElement>document.getElementById('ckNacional')).checked = false;
        (<HTMLInputElement>document.getElementById('ckPSAMujer')).checked = false;

        switch (cuentaConvenio) {
            case 'F':
                this.cuentaBancariaConvenio = true;
                this.cuentaBancariaPSAMujer = false;
                (<HTMLInputElement>document.getElementById('ckConvenio')).checked = true;
                this._cuentaConvenio = 'F';
                break;

            case 'N':
                this.cuentaBancariaConvenio = false;
                this.cuentaBancariaPSAMujer = false;
                (<HTMLInputElement>document.getElementById('ckNacional')).checked = true;
                this._cuentaConvenio = 'N';
                break;

            case 'M':
                this.cuentaBancariaConvenio = false;
                this.cuentaBancariaPSAMujer = true;
                (<HTMLInputElement>document.getElementById('ckPSAMujer')).checked = true;
                this._cuentaConvenio = 'M';
                break;
        }

        this.ref.detectChanges();
    }

    selecccionaIdioma(evento: any) {
        let cambioDeIdioma;

        if (evento == null) cambioDeIdioma = this._cambioDeIdioma;
        else cambioDeIdioma = evento.target.checked;

        if (cambioDeIdioma) {
            this.cambioDeIdioma = true;
            this._cambioDeIdioma = true;
            (<HTMLInputElement>document.getElementById('ckCotizacionEnIngles')).checked = true;
        } else {
            this.cambioDeIdioma = false;
            this._cambioDeIdioma = false;
            (<HTMLInputElement>document.getElementById('ckCotizacionEnIngles')).checked = false;
        }

        this.cambiaCotizacionToIngles();
    }

    cambiaCotizacionToIngles() {
        if (this.textoDesdePersonalizacion != undefined) {
            if (this._cambioDeIdioma) {
                const intervalo = setInterval(() => {
                    if (this.textoDesdePersonalizacion.idPersonalizacion > 0) {
                        clearInterval(intervalo);

                        this._fechaActual = new Date();
                        this._tituloCotizacion = TextosParaPlantillaEnIngles.TITULO_COTIZACION;
                        this._fechaExpiracion = 'Expiry: ';
                        this.conformaTextoDescriptivoCotizacionEnIngles();
                        this._textoDescriptivoFinalEraParte = this.textoDesdePersonalizacion.leyendaFinalidadCotizacionIngles;
                        this._textoDescriptivoFinalDaParte = TextosParaPlantillaEnIngles.TEXTO_FINAL_2;
                        this.colocaLaFechaDeVencimiento();

                        this.ref.detectChanges();
                    }
                }, 300)
            } else {
                const intervalo = setInterval(() => {
                    if (this.textoDesdePersonalizacion.idPersonalizacion > 0) {
                        clearInterval(intervalo);

                        this._fechaActual = new Date();
                        this._tituloCotizacion = TextosParaPlantillas.TITULO_COTIZACION;
                        this._fechaExpiracion = 'Válido hasta el: ';
                        this.conformaTextoDescriptivoCotizacion();
                        this._textoDescriptivoFinalEraParte = this.textoDesdePersonalizacion.leyendaFinalidadCotizacionEspannol;
                        this._textoDescriptivoFinalDaParte = TextosParaPlantillas.TEXTO_FINAL_2;
                        //this.condicionesIniciales();

                        this.ref.detectChanges();
                    }
                }, 300)
            }
        }
    }

    seleccionaUnProyecto(e: any) {
        const intervalo = setInterval(() => {
            if (document.getElementById('proyecto')) {
                clearInterval(intervalo);

                this._proyectos$.subscribe({
                    next: (proyectos) => {
                        proyectos.forEach(proyecto => {
                            if (proyecto.idProyecto == e.value) {
                                this.idProyectoElegido = e.value;
                                (<HTMLInputElement>document.getElementById('proyecto')).value = proyecto.proyecto;
                                (<HTMLInputElement>document.getElementById('ubicacionGeografica')).value = proyecto.ubicacionGeografica;

                                const inventario: Observable<iInventario[]> = this.servicioInventario.traeCompletoInventario();
                                inventario.subscribe({
                                    next: (totalInventario) => {
                                        const inventario: iInventario = totalInventario.filter(item => item.idProyecto == e.value)[0];
                                        const remanente: number = inventario.remanente - inventario.comprometido;
                                        this._remanenteDelProyecto = remanente;
                                    }
                                })
                            }
                        })
                    }
                });
            }
        }, 300)

    }

    entradaDatosClienteCambia(evento: any) {
        switch (evento.target.id) {
            case 'nombreCliente':
                this._nombreClienteElegido = (<HTMLInputElement>document.getElementById('nombreCliente')).value;
                break;

            case 'cedulaCliente':
                this._cedulaClienteElegido = (<HTMLInputElement>document.getElementById('cedulaCliente')).value;
                break;

            case 'contactoCliente':
                this._contactoClienteElegido = (<HTMLInputElement>document.getElementById('contactoCliente')).value;
                break;

            case 'emailCliente':
                this._emailClienteElegido = (<HTMLInputElement>document.getElementById('emailCliente')).value;
                break;

            case 'telefonoCliente':
                this._telefonoClienteElegido = (<HTMLInputElement>document.getElementById('telefonoCliente')).value;
                break;

            case 'direccionFisica':
                this._direccionClienteElegido = (<HTMLInputElement>document.getElementById('direccionFisica')).value;
                break;

            case 'anotaciones':
                this._anotacionesClienteElegido = (<HTMLInputElement>document.getElementById('anotaciones')).value;
                break;

            case 'justificacionDescuento':
                this._justificacionClientePorDescuesto = (<HTMLInputElement>document.getElementById('justificacionDescuento')).value;
                break;
        }
    }

    entraAnotaciones() {
        this._validaAnotacioDescuento = false;
        this._validaExtensionDescuento = false;
    }

    entradaDatosFuncionarioCambia(e: any) {
        switch (e.target.id) {
            case 'nombreFuncionario':
                this._nombreFuncionario = (<HTMLInputElement>document.getElementById('nombreFuncionario')).value;
                break;

            case 'emailFuncionario':
                this._emailFuncionario = (<HTMLInputElement>document.getElementById('emailFuncionario')).value;
                break;

            case 'telefonoFuncionario':
                this._telefonoFuncionario = (<HTMLInputElement>document.getElementById('telefonoFuncionario')).value;
                break;
        }
    }

    selecccionaDescuento(evento: any) {
        this.advertenciaPrecioExcedido = false;

        if (evento.target.checked) {
            this._habilitaPrecio = false;
        } else {
            this._validaAnotacioDescuento = false;
            this._validaExtensionDescuento = false;
            this._habilitaPrecio = true;
            this._precioEnDolaresSugerido = '7.5';
            this.precio = 7.5;
            this.calculaSubTotalCotización();
        }
    }

    seleccionaExcepcion(evento : any) {
        let esExcepcion : boolean = false;

        if(evento == null) esExcepcion = true;
        else esExcepcion = evento.target.checked;

        if(esExcepcion){
            this._checkDeUsoInterno = true;
            this._habilitaUsoInterno = false;

            this.colocaComentarioDeUsoInterno();

            const intervalo = setInterval(() => {
                if (document.getElementById('anotaciones')) {
                    clearInterval(intervalo);

                    this._justificaciones.push({
                        justificacion : 'Uso interno'
                    });

                    this._habilitaJustificacion = false;
                    this._otraJustificacion = false;
                    this.justificacionModelo = 'Uso interno';
                    
                    this.ref.detectChanges();
                }
            }, 300)

            this._tiposCompra.push({
                tipoCompra : 'Uso interno'
            });
            
            this.tipoCompraModelo = 'Uso interno';

            this._deshabilitaMotivoCompra = true;
            this._desHabilitaFechaVencimiento = true;
            this._desHabilitaNumeroCuenta = true;
            this._desHabilitaIdioma = true;
            this._desHabilitaTipoCompra = true;

            this.calculaSubTotalCotizacionDeUsoInterno();

        } else {
            this._checkDeUsoInterno = false;
            this._habilitaUsoInterno = true;
            
            this._deshabilitaMotivoCompra = false;
            this._desHabilitaFechaVencimiento = false;
            this._desHabilitaNumeroCuenta = false;
            this._desHabilitaIdioma = false;
            this._desHabilitaTipoCompra = false;

            this.colocaJustifcacion();
            this.colocaTipoCompra();
        }
    }

    colocaComentarioDeUsoInterno() {
        const intervalo = setInterval(()=>{
            if(document.getElementById('excepcion')) {
                clearInterval(intervalo);
                (<HTMLTextAreaElement>document.getElementById('excepcion')).value = this._cotizacionElegida.anotaciones;
            }
        },150);
    }

    seleccionaTipoCompra(evento: any) {
        if (evento == null) return;
        else this.tipoCompra = evento.value;
    }

    seleccionaJustificacion(evento: any) {
        this._otraJustificacion = false;
        this.justificacion = evento.value;
        this._anotacionesClienteElegido = this.justificacion;

        if (this.justificacion == 'Otro motivo de compra') {
            this._otraJustificacion = true;
            this._habilitaJustificacion = true;
        } else {
            this._habilitaJustificacion = false;
            this._validaAnotaciones = false;
        }

        this._desHabilitarBotonGuardar = false;
    }

    habilitaJustificacion(evento: any) {
        if (evento.target.checked) {
            this._habilitaJustificacion = true;
        } else {
            this._habilitaJustificacion = false;
        }
    }

    irAEditar() {
        if (this.idClienteElegido == 0) return;
        this.servicioCliente.setIdCliente(this.idClienteElegido);
        this.servicioCliente.setTerminaEdicionCotizacion(true);
        this._muestrarEdicionCliente = true;

        const intervalo = setInterval(() => {
            const terminaSesionEditarCliente: boolean = this.servicioCliente.getTerminaEdicionCotizacion();
            if (!terminaSesionEditarCliente) {
                clearInterval(intervalo);
                this._muestrarEdicionCliente = false;

                this.seleccionaUnCliente(null, this.idClienteElegido);

                this.ref.detectChanges();
            }
        }, 300)
    }

    saleJustificacionDescuento() {
        const anotacionDescuento: string = (<HTMLTextAreaElement>document.getElementById('justificacionDescuento')).value;
        if (anotacionDescuento.length < 10) {
            this._validaExtensionDescuento = true;
        }

        if (anotacionDescuento.length > 200) {
            this._validaExtensionDescuento = true;
        }
    }

    entraJustificacionMotivo() {
        this._validaAnotaciones = false;
        this._validaLogitudAnotaciones = false;
    }

    saleJustificacionMotivo() {
        if (this.justificacion == 'Otro motivo de compra' && document.getElementById('anotaciones')) {
            const anotaciones: string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
            if (anotaciones == '') {
                this._validaAnotaciones = true;
                return;
            }
        }

        const justificacion: string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
        if (justificacion.length < 10) {
            this._validaLogitudAnotaciones = true;
            return;
        }

        if (justificacion.length > 200) {
            this._validaLogitudAnotaciones = true;
            return;
        }
    }

    saleFechaVencimiento(evento: any) {
        this.validaFechaVencimiento(evento);
    }

    //#endregion

    //#region cantidad

    seModificaLaCantidad() {
        const cantidadDigitada: string = (<HTMLInputElement>document.getElementById('cantidad')).value;

        if (cantidadDigitada == '') return;

        this.cantidad = Number(cantidadDigitada);
        if (isNaN(this.cantidad)) return;

        if (this.cantidad < 0) {
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if (this.cantidad == 0) {
            this._desHabilitarBotonGuardar = true;
            return;
        }

        this._remanenteDelProyecto += this.cantidadOriginal;
        if (this._remanenteDelProyecto > this._remanenteRealDelProyecto) this._remanenteDelProyecto = this._remanenteRealDelProyecto;

        this.calculaSubTotalCotización();
    }

    cantidadEntraEnFoco() {
        const cantidad: string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        let cantidadNumerica: string = '';

        cantidad.split('').forEach(item => {
            if (item.charCodeAt(0) !== 160) {
                cantidadNumerica += item;
            }
        });

        (<HTMLInputElement>document.getElementById('cantidad')).type = "number";
        (<HTMLInputElement>document.getElementById('cantidad')).value = String(cantidadNumerica);

        this.advertenciaRemanente = false;
        this._validaCantidad = false;
    }

    cantidadSaleDeFoco() {
        let cantidadDigitada: string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        this.cantidad = Number(cantidadDigitada);

        if (this.cantidad < 0) {
            this._validaCantidad = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if (this.cantidad == 0) {
            this.advertenciaRemanente = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if (this.cantidad > this._remanenteDelProyecto) {
            this.advertenciaRemanente = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        this._cantidad = this.cantidad.toLocaleString('es-CR');
        (<HTMLInputElement>document.getElementById('cantidad')).type = "text";
        (<HTMLInputElement>document.getElementById('cantidad')).value = this._cantidad;
    }

    devuelveCantidadAlRemanente() {
        this._remanenteDelProyecto = this._remanenteDelProyecto + this.cantidadOriginal;
        this._remanenteDelProyecto = this._remanenteDelProyecto - this.cantidad;
    }

    //#endregion

    //#region precio
    seModificaElPrecio() {
        let precioDigitado: string = (<HTMLInputElement>document.getElementById('precioUnitario')).value;
        let nuevoPrecio: string = '';

        precioDigitado.split('').forEach(item => {
            if (item.charCodeAt(0) != 160) nuevoPrecio = nuevoPrecio + item;
        });

        this.precio = Number(nuevoPrecio);

        if (this.precio == 0) return;
        if (isNaN(this.precio)) return;

        this.calculaSubTotalCotización();
    }

    precioSaleDeFoco() {
        let precioDigitado: string = (<HTMLInputElement>document.getElementById('precioUnitario')).value;
        let nuevoPrecio: string = '';

        if (precioDigitado == '') precioDigitado = '7.5';
        if (isNaN(Number(precioDigitado))) precioDigitado = '7.5';

        precioDigitado.split('').forEach(item => {
            if (item.charCodeAt(0) != 160) nuevoPrecio = nuevoPrecio + item;
        });

        if (Number(nuevoPrecio) < 6) {
            this.advertenciaPrecioExcedido = true;
            return;
        }

        if (Number(nuevoPrecio) > 7.5) {
            this.advertenciaPrecioExcedido = true;
            return;
        }

        this.precio = Number(nuevoPrecio);
        if (isNaN(this.precio)) return;
        if (this.precio == 0) return;

        this._precioEnDolaresSugerido = this.precio.toLocaleString('es-CR');
        this._precioEnDolaresSugerido = this.precio.toLocaleString().replace(',', '.');
        (<HTMLInputElement>document.getElementById('precioUnitario')).value = this._precioEnDolaresSugerido;
        this.calculaSubTotalCotización();
    }

    entraEnPrecio() {
        this.advertenciaPrecioExcedido = false;
    }
    //#endregion

    //#region calculo de cotización

    calculaSubTotalCotización() {
        if (this.cantidad == 0) return;
        if (this.precio == 0) return;

        let resultado: number = this.cantidad * this.precio;
        this.subTotal = resultado;
        this.montoDolares = resultado;

        this.convierteMontoEnLetras(resultado);
        this._resultadoCantidadPorPrecio = resultado.toLocaleString('es-CR');
    }

    calculaSubTotalCotizacionDeUsoInterno() {
        let resultado : number = 0;
        this.subTotal = resultado;
        this.montoDolares = resultado;
        this.precio = resultado;

        this.convierteMontoEnLetras(resultado);
        this._resultadoCantidadPorPrecio = resultado.toLocaleString('es-CR');
        this._precioEnDolaresSugerido = this.precio.toLocaleString('es-CR');
    }

    //#endregion

    //#region conformación de textos

    traeTextosDescriptivosPersonalizacion() {
        this.servicioPersonalizacion.listarPersonalizacion().subscribe({
            next: (personalizacion) => {
                if (personalizacion.length != 0) {
                    this.textoDesdePersonalizacion = personalizacion[0];
                    this.conformaTextoDescriptivoCotizacion();
                }
            },
            error: (err) => console.error(err)
        });
    }

    conformaTextoDescriptivoCotizacion() {
        if (this._cambioDeIdioma) {
            this.conformaTextoDescriptivoCotizacionEnIngles();
        } else {
            if (this.textoDesdePersonalizacion != undefined) {
                this._descripcion = this.textoDesdePersonalizacion.leyendaDescriptivaCotizacionEspannol;
                this.ref.detectChanges();
            }
        }
    }

    conformaTextoDescriptivoCotizacionEnIngles() {
        if (this.textoDesdePersonalizacion != undefined) {
            this._tituloCotizacion = TextosParaPlantillaEnIngles.TITULO_COTIZACION;
            this._descripcion = this.textoDesdePersonalizacion.leyendaDescriptivaCotizacionIngles;
            this._textoDescriptivoFinalEraParte = this.textoDesdePersonalizacion.leyendaFinalidadCotizacionIngles;
            this._textoDescriptivoFinalDaParte = TextosParaPlantillaEnIngles.TEXTO_FINAL_2;

            this.ref.detectChanges();
        }
    }

    convierteMontoEnLetras(monto: number) {
        this._montoEnLetras = this.srvConvertidorNumerosEnLetras.convertidor(monto);
    }

    validaFechaVencimiento(evento: any) {
        if (evento.target.value == '') return;

        const hoy: Date = new Date();
        const hoyString: string = hoy.toLocaleDateString();
        const mesActual: number = Number(hoyString.split('/')[1]);
        const annoActual: number = Number(hoyString.split('/')[2]);

        const [anno, mes, dia] = evento.target.value.split('-');
        const mesElegido: number = Number(mes);
        const annoElegido: number = Number(anno);
        const fechaElegida: Date = new Date(anno, Number(mes) - 1, dia);

        if (mesElegido > mesActual) {
            const diferencia: number = mesElegido - mesActual;
            if (diferencia > 3) {
                this._fechaValidaSuperior = true;
                return;
            }
        } else this._fechaValidaSuperior = false;

        if (annoElegido > annoActual) {
            this._fechaValidaSuperior = true;
            return;
        } else this._fechaValidaSuperior = false;

        if (this._fechaActual > fechaElegida) {
            this._advertenciaFechaPasadaActual = true;
            return;
        } else this._advertenciaFechaPasadaActual = false;

        const opciones: any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        this._fechaAproximadaVencimiento = fechaElegida;
        this._fechaAproximadaVencimientoEnIngles = fechaElegida.toLocaleDateString('en-US', opciones);

        const fechaEnCadena: string = this._fechaAproximadaVencimiento.toISOString().split('T')[0];
        this._fechaAproximadaVencimientoString = fechaEnCadena;
    }

    //#endregion

    //#region fechas

    entraFechaVencimiento() {
        this._advertenciaFechaPasadaActual = false;
        this._fechaValida = false;
        this._fechaValidaSuperior = false;
    }

    colocaLaFechaDeVencimiento() {
        const fechaEnCadena: string = this._fechaAproximadaVencimiento.toISOString().split('T')[0];
        const opciones: any = {
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

    guardarCotizacion() {
        if (!this.cotizacionEsValida()) return;

        //this._salvando = true;

        const cotizacionToSalvar: iCotizacionParaSalvar = {
            cantidad: this.cantidad,
            consecutivo: this.consecutivoCorrespondiente,
            idCliente: this.idClienteElegido,
            idFuncionario: this.idFuncionario,
            idProyecto: this.idProyectoElegido,
            montoTotalColones: this.montoColones,
            montoTotalDolares: this.montoDolares == 0 ? this.subTotal : this.montoDolares,
            precioUnitario: this.precio,
            subTotal: this.subTotal,
            idCotizacion: this.idCotizacion,
            anotaciones: this._habilitaJustificacion ? (<HTMLInputElement>document.getElementById('anotaciones')).value : this.justificacion,
            fechaExpiracion: this._fechaAproximadaVencimientoString,
            cuentaConvenio: this._cuentaConvenio,
            cotizacionEnIngles: this._cambioDeIdioma == true ? 1 : 0,
            tipoCompra: this.tipoCompra == '' ? 'Compra Directa' : this.tipoCompra,
            justificacionCompra: !this._habilitaPrecio ? (<HTMLInputElement>document.getElementById('justificacionDescuento')).value : ''
        }

        //console.log(cotizacionToSalvar)

        this.srv.actualizaUnaCotizacion(cotizacionToSalvar).subscribe({
            next: (respuesta) => {
                if (respuesta.valor == '1') {
                    this._salvando = false;
                    Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                        this.router.navigate(['cotizacion/listar']);
                    });
                } else {
                    console.log(respuesta)
                    this._salvando = false;
                }
            },
            error: (err) => console.error(err)
        })
    }

    cotizacionEsValida(): boolean {
        const valorEnCantidad: string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        if (valorEnCantidad == '') {
            this._validaCantidad = true;
            return false;
        }

        if (valorEnCantidad != '') {
            const cantidad: number = Number(valorEnCantidad);
            if (cantidad <= 0) {
                this._validaCantidad = true;
                return false;
            }
        }

        if (!this._habilitaPrecio) {
            const anotacionDescuento: string = (<HTMLTextAreaElement>document.getElementById('justificacionDescuento')).value;
            if (anotacionDescuento == '') {
                this._validaAnotacioDescuento = true;
                return false;
            }
        }

        if (this._validaAnotacioDescuento) {
            return false;
        }

        if (this._validaExtensionDescuento) {
            return false;
        }

        if (this.justificacion == 'Otro motivo de compra') {
            if (document.getElementById('anotaciones')) {
                const anotaciones: string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
                if (anotaciones == '') {
                    this._validaAnotaciones = true;
                    return false;
                }
            }
        }

        if (this._validaAnotaciones) {
            return false;
        }

        if (this._validaLogitudAnotaciones) {
            return false;
        }

        const fechaVencimiento: string = (<HTMLInputElement>document.getElementById('fechaVencimiento')).value;
        if (fechaVencimiento == '') {
            this._fechaValida = true;
            return false;
        }

        if (this._advertenciaFechaPasadaActual) {
            return false;
        }

        if (this._fechaValida) {
            return false;
        }

        if (this._fechaValidaSuperior) {
            return false;
        }

        if (this._descripcion == undefined || this._descripcion == '') {
            Swal.fire('SICORE', 'Debe existir una descripción para la cotización.', 'error');
            return false;
        }

        return true;
    }

    irAListar() {
        this.router.navigate(['cotizacion/listar'])
    }

    descargarPDF() {
        let nombreElementoHTMLCotizacion: string = 'documentoCotizacion';
        if (this._cambioDeIdioma) {
            nombreElementoHTMLCotizacion = 'documentoCotizacionIngles';
        }

        this.muestraVistaPDF = true;
        const intervalo = setInterval(() => {
            if (document.getElementById(nombreElementoHTMLCotizacion)) {
                clearInterval(intervalo);

                const documento: HTMLElement = <HTMLElement>document.getElementById(nombreElementoHTMLCotizacion);
                if (documento) {
                    html2canvas(documento).then((canva) => {
                        const anchoImagen: number = documento.offsetWidth;
                        const alturaImagen: number = documento.offsetHeight;

                        const contenido = canva.toDataURL('image/png');
                        const pdf = new jsPDF('portrait', 'px', [anchoImagen, alturaImagen]);
                        pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);

                        window.open(pdf.output('bloburl'), '_blank');
                        this.muestraVistaPDF = false;
                    });
                }
            }
        }, 300)

    }

    verDialogoObservaciones() {
        this._muestraObservaciones = true;

        const intervalo = setInterval(()=>{
            if(document.getElementById('observaciones')){
                clearInterval(intervalo);

                (<HTMLTextAreaElement>document.getElementById('observaciones')).value =  this._lasObservaciones;

            }
        },300)
    }
}