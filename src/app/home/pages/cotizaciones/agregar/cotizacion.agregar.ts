import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, LOCALE_ID, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule, registerLocaleData } from "@angular/common";
import { Observable } from "rxjs";
import { iCliente, iFuncionario, iSector } from "../../clientes/interfaces/iCliente";
import { ClienteServicio } from "../../clientes/servicio/cliente.servicio";
import { TextosParaPlantillas } from "../servicio/textos-para-plantillas";
import localeEsCR from '@angular/common/locales/es-CR';
import { ConvierteNumerosEnLetras } from "../servicio/numero-en-letras";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";
import { ProyectoServicio } from "../../proyecto/servicio/proyecto.servicio";
import { iCotizacion, iCotizacionParaSalvar, iJustificaciones, iTipoCompra } from "../interfaces/iCotizacion";
import { CotizacionServicio } from "../servicio/cotizacion.servicio";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { InventarioServicio } from "../../inventario/servicio/inventario.servicio";
import { iInventario } from "../../inventario/interfaces/iInventario";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FormBuilder, FormGroup } from "@angular/forms";
import { TextosParaPlantillaEnIngles } from "../servicio/textos-para-plantilla-ingles";
import { PersonalizacionServicio } from "../../personalizacion/servicio/personalizacion.servicio";
import { iPersonalizacion } from "../../personalizacion/interfaces/iPersonalizacion";
import { EditarCliente } from "../../clientes/editar/cliente.editar";

registerLocaleData( localeEsCR );

@Component({
    selector : 'agregar-cotizacion',
    templateUrl : 'cotizacion.agregar.html',
    styleUrl : 'cotizacion.agregar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule, EditarCliente],
    changeDetection : ChangeDetectionStrategy.OnPush,
    providers : [{provide: LOCALE_ID, useValue: 'es-CR'}]
})

export class AgregarCotizacion implements OnInit {

    private servicioCliente = inject(ClienteServicio);
    private servicioProyecto = inject(ProyectoServicio);
    private servicioInventario = inject(InventarioServicio);
    private servicioPersonalizacion = inject(PersonalizacionServicio);

    private fb = inject(FormBuilder);
    formCotizacion : FormGroup = this.fb.group({
        idCliente : ['']
    });

    private textoDesdePersonalizacion! : iPersonalizacion;

    _sectores$! : Observable<iSector[]>;
    _clientes$! : Observable<iCliente[]>;
    _proyectos$! : Observable<iProyecto[]>;
    _tiposCompra! : iTipoCompra[];
    tipoCompraModelo! : string;
    justificacionModelo! : string;
    tipoCompra : string = '';
    justificacion! : string;
    _justificaciones! : iJustificaciones[];
    _habilitaJustificacion : boolean = false;
    _otraJustificacion : boolean = false;

    _encFonafifo : string = TextosParaPlantillas.E_FONAFIFO;
    _encDir_1 : string = TextosParaPlantillas.E_DIR_1;
    _encDir_2 : string = TextosParaPlantillas.E_DIR_2;

    _tituloCotizacion : string = TextosParaPlantillas.TITULO_COTIZACION;
    _consecutivo! : string;
    _fechaExpiracion: string = 'Válido hasta el: ';

    _fechaActual : Date = new Date();
    _fechaActualEnIngles! : string;
    _fechaAproximadaVencimiento! : Date;
    _fechaAproximadaVencimientoEnIngles! : string;
    _textoFechaInicio : string = TextosParaPlantillas.TEXTO_ACOMPANNA_FECHA;
    _fechaAproximadaVencimientoString! : string;
    _fechaAproximadaVencimientoSugerida! : string;
    _advertenciaFechaPasadaActual : boolean = false;

    idProyectoElegido : number = 0;
    _nombreProyectoElegido! : string;
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
    _justificacionClientePorDescuesto! : string;
    _anotacionesClienteElegido! : string;
    sectorClienteElegido : number = 0;

    _cantidad! : string;
    cantidad : number = 0;
    _remanenteDelProyecto : number = 0;

    _precioEnDolaresSugerido! : string;
    precio : number = 0;

    _resultadoCantidadPorPrecio! : string;

    _descripcion! : string;
    _montoEnLetras : string = '';

    _textoDescriptivoFinalEraParte! : string;
    _textoDescriptivoFinalDaParte! : string;

    _funcionario : string = '';
    _departamento : string = TextosParaPlantillas.DEPARTAMENTO;

    _nombreFuncionario! : string;
    _emailFuncionario! : string;
    _telefonoFuncionario! : string;

    advertenciaRemanente : boolean = false;
    advertenciaPrecioExcedido : boolean = false;
    desHabilitaDropClientes : boolean = true;
    muestraVistaPDF : boolean = false;
    limiteSeleccionEnCliente : number = 1;
    cuentaBancariaConvenio : boolean = false;
    cuentaBancariaPSAMujer : boolean = false;
    _cuentaConvenio! : string;
    cambioDeIdioma : boolean = false;
    _desHabilitarBotonGuardar : boolean = true;

    _bloqueaNombre : boolean = true;
    _habilitaPrecio : boolean = true;
    _habilitaUsoInterno : boolean = true;
    _validaCantidad : boolean = false;
    _fechaValida : boolean = false;
    _fechaValidaSuperior : boolean = false;
    _validaAnotaciones : boolean = false;
    _validaAnotacioDescuento : boolean = false;
    _validaExtensionDescuento : boolean = false;
    _habilitarEditarCliente : boolean = true;
    _salvando : boolean = false;
    _validaLogitudAnotaciones : boolean = false;

    _muestrarEdicionCliente : boolean = false;

    _validaAnotacioJustificacion : boolean = false;
    _validaExtensionJustificacion : boolean = false;
    _deshabilitaMotivoCompra : boolean = false;
    _desHabilitaFechaVencimiento : boolean = false;
    _desHabilitaNumeroCuenta : boolean = false;
    _desHabilitaIdioma : boolean = false;
    _desHabilitaTipoCompra : boolean = false;

    _checkDeUsoInterno : boolean = false;
    
    private agentesDeCuenta! : iFuncionario[];

    constructor(private srvConvertidorNumerosEnLetras : ConvierteNumerosEnLetras, private srv : CotizacionServicio, private router : Router, private ref : ChangeDetectorRef){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado']);
    }

    ngOnInit(): void {
        this.condicionesIniciales();
        this.conformaTextoDescriptivoCotizacion();
        this.cambiaCotizacionToIngles();
    }

//#region codiciones iniciales

    condicionesIniciales() {
        this.formCotizacion.get('idCliente')?.disable();

        this.colocaFechaActualYVencimiento();
        this.traeNumeroConsecutivo();
        this.traeTodosSectores();
        this.colocaNumeroCuenta();
        this.traeTextosDescriptivosPersonalizacion();
        this.colocaTipoCompra();
        this.colocaJustifcacion();
        this.traeAgentesDeCuenta();
    }

    colocaFechaActualYVencimiento() {
        let fechaActual : Date = new Date();
        fechaActual.setDate(fechaActual.getDate() + 30);
        
        this._fechaAproximadaVencimiento = fechaActual;
        
        const fechaEnCadena : string = this._fechaAproximadaVencimiento.toLocaleDateString();
        const [dia, mes, anno] = fechaEnCadena.split('/');

        let diaFechaVencimiento : string = dia.length == 1 ? `0${dia}` : dia;
        let mesFechaVencimiento : string = mes.length == 1 ? `0${mes}` : mes;
        
        const fecha = `${anno}-${mesFechaVencimiento}-${diaFechaVencimiento}`;

        this._fechaAproximadaVencimientoString = fecha;
        this._fechaAproximadaVencimientoSugerida = fecha;
    }

    traeNumeroConsecutivo(){
        const siglas : string = 'DDC-CO-';
        let anno : string =  String(this._fechaActual.getFullYear());
        
        this.srv.traeTodasCotizaciones().subscribe({
            next : (cotizaciones) => {

                if(cotizaciones.length > 0){
                    const cotizacion : iCotizacion = cotizaciones[0];

                    const fechaUltimaCotizacion : Date = new Date(cotizacion.fechaHora);
                    const annoUltimaCotizacion : string = String(fechaUltimaCotizacion.getFullYear());

                    if(annoUltimaCotizacion < anno) {
                        anno = annoUltimaCotizacion;
                        this.consecutivoCorrespondiente = 1;
                    } else {
                        this.consecutivoCorrespondiente = Number(cotizacion.consecutivo) + 1;
                    }

                    this._consecutivo = `${siglas}${this.colocaCerosAlNumeroEntero(this.consecutivoCorrespondiente)}-${anno}`;
                } else {
                    this.consecutivoCorrespondiente = Number(this.colocaCerosAlNumeroEntero(1));
                    this._consecutivo = siglas + this.colocaCerosAlNumeroEntero(1) + '-' + String(anno);
                }
            }
        })
    }

    traeTodosSectores(){
        this._sectores$ = this.servicioCliente.traeTodosSectores();
    }

    colocaNumeroCuenta(){
        const intervalo = setInterval(()=>{
            if(document.getElementById('ckConvenio')){
                clearInterval(intervalo);
                
                const cuentaConvenio : boolean = (<HTMLInputElement>document.getElementById('ckConvenio')).checked;
                const cuentaNacional : boolean = (<HTMLInputElement>document.getElementById('ckNacional')).checked;
                const cuentaPSAMujer : boolean = (<HTMLInputElement>document.getElementById('ckPSAMujer')).checked;
                
                if(!cuentaConvenio && !cuentaNacional && !cuentaPSAMujer){

                    (<HTMLInputElement>document.getElementById('ckConvenio')).checked = true;
                    this.cuentaBancariaConvenio = true;
                    this._cuentaConvenio = 'F';
                }
            }
        },500);
    }

    colocaTipoCompra(){
        const tiposCompra : iTipoCompra [] = [
            {
                tipoCompra : 'Convenio'
            },
            {
                tipoCompra : 'Compra Directa'
            },
            {
                tipoCompra : 'SICOP'
            },
            {
                tipoCompra : 'SINPE'
            },
            {
                tipoCompra : 'En Línea'
            },
        ];

        this._tiposCompra = tiposCompra;
    }

    colocaJustifcacion(){
        const justificaciones : iJustificaciones [] = [
            {
                justificacion : 'Compensación Inventario Anual'
            },
            {
                justificacion : 'Compensación Emisiones Combustibles'
            },
            {
                justificacion : 'Compensación Energía y/o A/C'
            },
            {
                justificacion : 'Compensación Viajes Aéreos'
            },
            {
                justificacion : 'Convenio o Alianza Público - Privado'
            },
            {
                justificacion : 'Convenio Especial ICT'
            },
            {
                justificacion : 'Otro motivo de compra'
            }
        ];

        this._justificaciones = justificaciones;
    }

    traeAgentesDeCuenta() {
        this.servicioCliente.traeFuncionarios().subscribe({
            next : agentes => {
                this.agentesDeCuenta = agentes;
                this.colocaDatosFuncionario();
            },
            error : err => console.error(err)
        })
    }

    // colocaDatosFuncionario(){
    //     const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
    
    //     this._nombreFuncionario = this.daFormatoNombre(valorSesion.nombreCompleto);
    //     this._emailFuncionario = valorSesion.correoUsuario;
    //     this.idFuncionario = valorSesion.idUsuario;
    //     this._telefonoFuncionario = valorSesion.telefonoFijoTrabajo;
    
    //     const intervalo = setInterval(()=>{
    //         if(document.getElementById('nombreFuncionario')) {
    //             clearInterval(intervalo);
    //             (<HTMLInputElement>document.getElementById('nombreFuncionario')).value = this._nombreFuncionario;
    //             (<HTMLInputElement>document.getElementById('emailFuncionario')).value = this._emailFuncionario;
    //             (<HTMLInputElement>document.getElementById('telefonoFuncionario')).value = this._telefonoFuncionario;
    //         }
    //     },300)
    // }

    colocaDatosFuncionario(){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const agenteFuncionario : iFuncionario = this.agentesDeCuenta.filter(agente => agente.idUsuario == valorSesion.idUsuario)[0];

        this._nombreFuncionario = agenteFuncionario.nombre;
        this._emailFuncionario = agenteFuncionario.email;
        this.idFuncionario = agenteFuncionario.idUsuario;
        this._telefonoFuncionario = agenteFuncionario.telefono;
    
        const intervalo = setInterval(()=>{
            if(document.getElementById('nombreFuncionario')) {
                clearInterval(intervalo);
                (<HTMLInputElement>document.getElementById('nombreFuncionario')).value = this._nombreFuncionario;
                (<HTMLInputElement>document.getElementById('emailFuncionario')).value = this._emailFuncionario;
                (<HTMLInputElement>document.getElementById('telefonoFuncionario')).value = this._telefonoFuncionario;
            }
        },300)
    }

    cambiaCotizacionToIngles() {
        if(this.textoDesdePersonalizacion != undefined){
            if(this.cambioDeIdioma) {
                const intervalo = setInterval(()=>{
                    if(this.textoDesdePersonalizacion.idPersonalizacion > 0) {
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
                },300)
            } else {
                const intervalo = setInterval(()=>{
                    if(this.textoDesdePersonalizacion.idPersonalizacion > 0) {
                        clearInterval(intervalo);
        
                        this._fechaActual = new Date();
                        this._tituloCotizacion = TextosParaPlantillas.TITULO_COTIZACION;
                        this._fechaExpiracion = 'Válido hasta el: ';
                        this.conformaTextoDescriptivoCotizacion();
                        this._textoDescriptivoFinalEraParte = this.textoDesdePersonalizacion.leyendaFinalidadCotizacionEspannol;
                        this._textoDescriptivoFinalDaParte = TextosParaPlantillas.TEXTO_FINAL_2;
                        this.condicionesIniciales();
    
                        this.ref.detectChanges();
                    }
                },300)
            }
        }
    }

    traeTextosDescriptivosPersonalizacion(){
        this.servicioPersonalizacion.listarPersonalizacion().subscribe({
            next : (personalizacion) => {
                if(personalizacion.length != 0){
                    this.textoDesdePersonalizacion = personalizacion[0];
                    this._textoDescriptivoFinalEraParte = this.textoDesdePersonalizacion.leyendaFinalidadCotizacionEspannol;
                    this._textoDescriptivoFinalDaParte = TextosParaPlantillas.TEXTO_FINAL_2;
                }
            },
            error : (err) => console.error(err)
        });
    }

//#endregion

//#region código miselaneo

    validaNumerosYLetras(e : any) : boolean {
        let cantidadDigitada : string = (<HTMLInputElement>document.getElementById('cantidad')).value.replace(',','.');
        if(cantidadDigitada.length > 9) return false;

        if(!((e.keyCode > 95 && e.keyCode < 106) || (e.keyCode > 47 && e.keyCode < 58) || e.keyCode == 8)){
            if (e.keyCode == 110) return true;
            return false;
        }

        return true;
    }

    colocaCerosAlNumeroEntero(numero : number) : string {
        let numeroConFormato : string = '';
        switch(numero.toString().length) {
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
    
        //return numeroConFormato;
        return '###';
    }

    poneEnBlancoEntradasCliente(){
        (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value = '';
        (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value = '';
        (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value = '';
        (<HTMLInputElement>document.getElementById('emailClienteElegido')).value = '';
        (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value = '';
        (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value = '';
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

    daformatoAlNumeroIngresado(numero : string) : number {
        return Number(numero);
    }

    convierteMontoEnLetras(monto : number) {
        this._montoEnLetras = this.srvConvertidorNumerosEnLetras.convertidor(monto);
    }

    validaFechaVencimiento(evento : any) {
        if(evento.target.value == '') return;

        const hoy : Date = new Date();
        const hoyString : string = hoy.toLocaleDateString();
        const mesActual : number = Number(hoyString.split('/')[1]);
        const annoActual : number = Number(hoyString.split('/')[2]);

        const [anno, mes, dia] = evento.target.value.split('-');
        const mesElegido : number = Number(mes);
        const annoElegido : number = Number(anno);
        const fechaElegida : Date = new Date(anno, Number(mes)-1, dia);

        if(mesElegido > mesActual) {
            const diferencia : number = mesElegido - mesActual;
            if(diferencia > 3) {
                //(<HTMLInputElement>document.getElementById('fechaVencimiento')).value = this._fechaAproximadaVencimientoSugerida;
                this._fechaValidaSuperior = true;
                return;
            }
        }

        if(annoElegido > annoActual) {
            //(<HTMLInputElement>document.getElementById('fechaVencimiento')).value = this._fechaAproximadaVencimientoSugerida;
            this._fechaValidaSuperior = true;
            return;
        }

        if(this._fechaActual > fechaElegida){
            this._advertenciaFechaPasadaActual = true;
            return;
        }

        const opciones : any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        this._fechaAproximadaVencimiento = fechaElegida;
        this._fechaAproximadaVencimientoEnIngles = fechaElegida.toLocaleDateString('en-US', opciones);
        
        const fechaEnCadena : string = this._fechaAproximadaVencimiento.toISOString().split('T')[0];
        this._fechaAproximadaVencimientoString = fechaEnCadena;
    }

//#endregion

//#region análisis de la cantidad de remanente

    seModificaLaCantidad() {
        const cantidadDigitada : string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        
        if(cantidadDigitada == '') return;

        this.cantidad = Number(cantidadDigitada);
        if(isNaN(this.cantidad)) return;

        if(this.cantidad < 0) {
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if(this.cantidad == 0) {
            this._desHabilitarBotonGuardar = true;
            return;
        }

        this.calculaSubTotalCotización();
    }

    cantidadEntraEnFoco() {
        const cantidad : string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        let cantidadNumerica : string = '';

        cantidad.split('').forEach(item => {
            if(item.charCodeAt(0) !== 160){
                cantidadNumerica += item;
            }
        });

        (<HTMLInputElement>document.getElementById('cantidad')).type = "number";
        (<HTMLInputElement>document.getElementById('cantidad')).value = String(cantidadNumerica);

        this.advertenciaRemanente = false;
        this._validaCantidad = false;
    }

    cantidadSaleDeFoco() {
        (<HTMLInputElement>document.getElementById('cantidad')).type = "text";

        let cantidadDigitada : string = (<HTMLInputElement>document.getElementById('cantidad')).value;

        this.cantidad = Number(cantidadDigitada);

        if(this.cantidad < 0) {
            this._validaCantidad = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if(this.cantidad == 0) {
            this.advertenciaRemanente = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        if(this.cantidad > this._remanenteDelProyecto) {
            this.advertenciaRemanente = true;
            this._desHabilitarBotonGuardar = true;
            return;
        }

        this._cantidad = this.cantidad.toLocaleString('es-CR');

        // if(this.justificacion == undefined) return;
        // if(this.justificacion != '') this._desHabilitarBotonGuardar = false;
    }

//#endregion

//#region análisis del precio
    entraEnPrecio() {
        this.advertenciaPrecioExcedido = false;
    }
    
    seModificaElPrecio() {
        let precioDigitado : string = (<HTMLInputElement>document.getElementById('precioUnitario')).value;
        let nuevoPrecio : string = '';

        precioDigitado.split('').forEach(item => {
            if(item.charCodeAt(0) != 160) nuevoPrecio = nuevoPrecio + item;
        });

        this.precio = Number(nuevoPrecio);
        
        if (this.precio == 0) return;
        if (isNaN(this.precio)) return;

        this.calculaSubTotalCotización();
    }

    precioSaleDeFoco() {
        let precioDigitado : string = (<HTMLInputElement>document.getElementById('precioUnitario')).value;
        let nuevoPrecio : string = '';

        if(precioDigitado == '') precioDigitado = '7.5';
        if (isNaN(Number(precioDigitado))) precioDigitado = '7.5';

        precioDigitado.split('').forEach(item => {
            if(item.charCodeAt(0) != 160) nuevoPrecio = nuevoPrecio + item;
        });
        
        if(Number(nuevoPrecio) < 6 ) {
            this.advertenciaPrecioExcedido = true;
            return;
        }
        
        if(Number(nuevoPrecio) > 7.5) {
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
//#endregion

//#region cálculo de la cotización
    
    calculaSubTotalCotización() {
        if (this.cantidad == 0) return;
        if (this.precio == 0) return;

        let resultado : number = this.cantidad * this.precio;
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

//#region eventos de selección

    seleccionaUnSector(evento : any){
        this._clientes$ = this.servicioCliente.traeClientePorIdSector(evento.value);
        this.formCotizacion.get('idCliente')?.enable();
        this.ref.detectChanges();
    }

    seleccionaUnCliente(evento : any) {
        if(evento != null) {
            if((Number(evento.value) == 0)){
                this.poneEnBlancoEntradasCliente();
                return;
            };

            this.idClienteElegido = Number(evento.value);
        }

        this._clientes$.subscribe({
            next : (clientes) => {
                const cliente : iCliente = clientes.filter(item=>item.idCliente == this.idClienteElegido)[0];

                let nombreDelContacto : string = cliente.contactoCliente;
                if(cliente.esGestor == 'S') nombreDelContacto = `Gestor ${nombreDelContacto}`;

                (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value = cliente.nombreCliente;
                this._nombreClienteElegido = (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value;

                (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value = cliente.cedulaCliente;
                this._cedulaClienteElegido = (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value;

                (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value = nombreDelContacto;
                this._contactoClienteElegido = (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value;

                (<HTMLInputElement>document.getElementById('emailClienteElegido')).value = cliente.emailCliente;
                this._emailClienteElegido = (<HTMLInputElement>document.getElementById('emailClienteElegido')).value;

                (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value = cliente.telefonoCliente;
                this._telefonoClienteElegido = (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value.split(';')[0];
                this._telefonoClienteElegido = this._telefonoClienteElegido.replace(';', '');

                (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value = cliente.direccionFisica;
                this._direccionClienteElegido = (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value;

                this.precio = 7.5;
                this._precioEnDolaresSugerido = this.precio.toLocaleString().replace(',', '.');
                (<HTMLInputElement>document.getElementById('precioUnitario')).value = this._precioEnDolaresSugerido;

                this.sectorClienteElegido = cliente.idSector;
                this._habilitarEditarCliente = false;
                this.ref.detectChanges();

                // const intervalo = setInterval(()=>{
                //     if(document.getElementById('direccionFisicaElegido') != undefined){
                //         clearInterval(intervalo);

                        
                //     }
                // },300)
            }
        })

        this.traeTodosProyectos();
    }

    seleccionaUnProyecto(evento : any) {
        const intervalo = setInterval(()=>{
            if(document.getElementById('proyecto')){
                clearInterval(intervalo);

                this._proyectos$.subscribe({
                    next : (proyectos) => {
                        this.idProyectoElegido = evento.value;
                        const proyecto = proyectos.filter(item => item.idProyecto == evento.value)[0];

                        (<HTMLInputElement>document.getElementById('proyecto')).value = proyecto.proyecto;
                        (<HTMLInputElement>document.getElementById('ubicacionGeografica')).value = proyecto.ubicacionGeografica;
                        this._nombreProyectoElegido = proyecto.proyecto;

                        const inventario : Observable<iInventario[]> = this.servicioInventario.traeCompletoInventario();
                        inventario.subscribe({
                            next : (totalInventario) => {
                                const inventario : iInventario = totalInventario.filter(item => item.idProyecto == evento.value)[0];
                                //let saldoDelRemanente : number = inventario.remanente - inventario.comprometido;
                                //if(saldoDelRemanente == 0) saldoDelRemanente = inventario.comprometido;

                                this._remanenteDelProyecto = inventario.comprometido;

                                this.ref.detectChanges();
                            }
                        })

                        this.desHabilitaDropClientes = false;
                    }
                });
            }
        },300)

    }

    entradaDatosClienteCambia(evento : any) {
        switch(evento.target.id) {
            case 'nombreCliente':
                this._nombreClienteElegido = (<HTMLInputElement>document.getElementById('nombreClienteElegido')).value;
                break;
            
            case 'cedulaClienteElegido':
                this._cedulaClienteElegido = (<HTMLInputElement>document.getElementById('cedulaClienteElegido')).value;
                break;

            case 'contactoCliente':
                this._contactoClienteElegido = (<HTMLInputElement>document.getElementById('contactoClienteElegido')).value;
                break;

            case 'emailCliente':
                this._emailClienteElegido = (<HTMLInputElement>document.getElementById('emailClienteElegido')).value;
                break;

            case 'telefonoCliente':
                this._telefonoClienteElegido = (<HTMLInputElement>document.getElementById('telefonoClienteElegido')).value;
                break;
                
            case 'direccionFisica': 
                this._direccionClienteElegido = (<HTMLInputElement>document.getElementById('direccionFisicaElegido')).value;
                break;

            case 'anotaciones':
                this._anotacionesClienteElegido = (<HTMLInputElement>document.getElementById('anotaciones')).value;
                break;

            case 'justificacionDescuento':
                this._justificacionClientePorDescuesto = (<HTMLInputElement>document.getElementById('justificacionDescuento')).value;
                break;

            case 'excepcion':
                this._anotacionesClienteElegido = (<HTMLInputElement>document.getElementById('excepcion')).value;
                this.entraEnAnotacionesUsoInterno();
                break;
        }  
    }

    entraEnAnotacionesUsoInterno() {
        if(this._anotacionesClienteElegido.length > 10) this._desHabilitarBotonGuardar = false;
    }

    entraAnotaciones(){
        this._validaAnotacioDescuento = false;
        this._validaExtensionDescuento = false;
    }

    entradaDatosFuncionarioCambia(evento : any) {
        switch(evento.target.id) {
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

    seleccionaUnaFechaVencimiento(evento : any) {
        this.validaFechaVencimiento(evento);
    }

    seleccionaNumeroCuenta(evento : any) {
        (<HTMLInputElement>document.getElementById('ckConvenio')).checked = false;
        (<HTMLInputElement>document.getElementById('ckNacional')).checked = false;
        (<HTMLInputElement>document.getElementById('ckPSAMujer')).checked = false;

        switch(evento.target.id) {
            case 'ckConvenio':
                this.cuentaBancariaConvenio = true;
                this.cuentaBancariaPSAMujer = false;
                (<HTMLInputElement>document.getElementById('ckConvenio')).checked = true;
                this._cuentaConvenio = 'F';
                break;  

            case 'ckNacional':
                this.cuentaBancariaConvenio = false;
                this.cuentaBancariaPSAMujer = false;
                (<HTMLInputElement>document.getElementById('ckNacional')).checked = true;
                this._cuentaConvenio = 'N';
                break;

            case 'ckPSAMujer':
                this.cuentaBancariaConvenio = false;
                this.cuentaBancariaPSAMujer = true;
                (<HTMLInputElement>document.getElementById('ckPSAMujer')).checked = true;
                this._cuentaConvenio = 'M';
                break;
        }
    }

    selecccionaIdioma(evento : any) {
        if(evento.target.checked){
            this.cambioDeIdioma = true;
        } else {
            this.cambioDeIdioma = false;
        }

        this.cambiaCotizacionToIngles();
    }

    traeTodosProyectos() {
        this._proyectos$ = this.servicioProyecto.traeTodosProyectosConRemanente();
    }

    selecccionaDescuento(evento : any) {
        this.advertenciaPrecioExcedido = false;

        if(evento.target.checked){
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
        if(evento.target.checked){
            this._checkDeUsoInterno = true;
            this._habilitaUsoInterno = false;

            this._justificaciones.push({
                justificacion : 'Uso interno'
            });

            this._tiposCompra.push({
                tipoCompra : 'Uso interno'
            });
            
            this.justificacionModelo = 'Uso interno';
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

    

    seleccionaTipoCompra(evento : any) {
        this.tipoCompra = evento.value;
    }

    seleccionaJustificacion(evento : any) {
        this._otraJustificacion = false;
        this.justificacion = evento.value;
        this._anotacionesClienteElegido = this.justificacion;

        if(this.justificacion == 'Otro motivo de compra') {
            this._otraJustificacion = true;
            this._habilitaJustificacion = true;
        } else {
            this._habilitaJustificacion = false;
            this._validaAnotaciones = false;
        }

        this._desHabilitarBotonGuardar = false;
    }

    habilitaJustificacion(evento : any) {
        if(evento.target.checked) {
            this._habilitaJustificacion = true;
        } else {
            this._habilitaJustificacion = false;
        }
    }

    irAEditar() {
        if(this.idClienteElegido == 0) return;
        
        this.servicioCliente.setIdCliente(this.idClienteElegido);
        this.servicioCliente.setTerminaEdicionCotizacion(true);
        this._muestrarEdicionCliente = true;

        const intervalo = setInterval(()=>{
            const terminaSesionEditarCliente : boolean = this.servicioCliente.getTerminaEdicionCotizacion();
            if(!terminaSesionEditarCliente) {
                clearInterval(intervalo);
                this._muestrarEdicionCliente = false;
                
                this.seleccionaUnCliente(null);

                this.ref.detectChanges();
            }
        },300)
    }

    saleJustificacionDescuento() {
        const anotacionDescuento : string = (<HTMLTextAreaElement>document.getElementById('justificacionDescuento')).value;
        if(anotacionDescuento.length < 10) {
            this._validaExtensionDescuento = true;
        }

        if(anotacionDescuento.length > 200) {
            this._validaExtensionDescuento = true;
        }
    }

    entraJustificacionMotivo() {
        this._validaAnotaciones = false;
        this._validaLogitudAnotaciones = false;
    }

    saleJustificacionMotivo() {
        if(this.justificacion == 'Otro motivo de compra' && document.getElementById('anotaciones')) {
            const anotaciones : string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
            if(anotaciones == '') {
                this._validaAnotaciones = true;
                return;
            }
        }

        const justificacion : string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
        if(justificacion.length < 10) {
            this._validaLogitudAnotaciones = true;
            return;
        }

        if(justificacion.length > 200) {
            this._validaLogitudAnotaciones = true;
            return;
        }
    }

    saleFechaVencimiento(evento : any) {
        this.validaFechaVencimiento(evento);
    }

//#endregion

//#region eventos para las fechas

    entraFechaVencimiento() {
        this._advertenciaFechaPasadaActual = false;
        this._fechaValida = false;
        this._fechaValidaSuperior = false;
    }

    colocaLaFechaDeVencimiento() {
        let fechaActual : Date = new Date();
        fechaActual.setDate(fechaActual.getDate() + 30);
        const opciones : any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        this._fechaAproximadaVencimientoEnIngles = fechaActual.toLocaleDateString('en-US', opciones);
        
        const fechaEnCadena : string = fechaActual.toISOString().split('T')[0];

        this._fechaAproximadaVencimientoString = fechaEnCadena;
        this._fechaActualEnIngles = new Date().toLocaleDateString('en-US', opciones);
    }

    colocaLaFechaActual() {
        let fechaActual : Date = new Date();
        fechaActual.setDate(fechaActual.getDate() + 30);
        const opciones : any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        this._fechaAproximadaVencimientoEnIngles = fechaActual.toLocaleDateString('en-US', opciones);
        
        const fechaEnCadena : string = this._fechaAproximadaVencimientoEnIngles;
        const [dia, mes, anno] = fechaEnCadena.split('/');
        const fecha = `${anno}-${mes}-${dia}`;

        this._fechaAproximadaVencimientoString = fecha;
    }

//#endregion

//#region conformación de textos

    conformaTextoDescriptivoCotizacion() {
        let cantidadDeConsultas : number = 5;

        const intervalo = setInterval(()=>{

            if(this.textoDesdePersonalizacion != undefined) {
                clearInterval(intervalo);

                this._descripcion = this.textoDesdePersonalizacion.leyendaDescriptivaCotizacionEspannol;
                this.ref.detectChanges();
            } else {
                cantidadDeConsultas--;
                if(cantidadDeConsultas == 0) clearInterval(intervalo);
            }

        },1000)
    }

    conformaTextoDescriptivoCotizacionEnIngles() {
        let cantidadDeConsultas : number = 5;

        const intervalo = setInterval(()=>{

            if(this.textoDesdePersonalizacion != undefined) {
                clearInterval(intervalo);
                
                this._descripcion = this.textoDesdePersonalizacion.leyendaDescriptivaCotizacionIngles;
                this.ref.detectChanges();
            } else {
                cantidadDeConsultas--;
                if(cantidadDeConsultas == 0) clearInterval(intervalo);
            }
        },1000)
    }

//#endregion 

    guardarCotizacion() {
        let tipoCompra : string;
        if(this._checkDeUsoInterno) tipoCompra = 'Uso interno';
        else {
            tipoCompra = this.tipoCompra == '' ? 'Compra Directa' : this.tipoCompra
            if(!this.cotizacionEsValida()) return;
        }
        
        this._salvando = true;
    
        const cotizacionToSalvar : iCotizacionParaSalvar = {
            cantidad : this.cantidad,
            consecutivo : this.consecutivoCorrespondiente,
            idCliente : this.idClienteElegido,
            idFuncionario : this.idFuncionario,
            idProyecto : this.idProyectoElegido,
            montoTotalColones : this.montoColones,
            montoTotalDolares : this.montoDolares == 0 ? this.subTotal : this.montoDolares,
            precioUnitario : this.precio,
            subTotal : this.subTotal,
            idCotizacion : 0,
            anotaciones : this._habilitaJustificacion ? (<HTMLInputElement>document.getElementById('anotaciones')).value : this._anotacionesClienteElegido,
            fechaExpiracion : this._fechaAproximadaVencimientoString,
            cuentaConvenio : this._cuentaConvenio,
            cotizacionEnIngles : this.cambioDeIdioma == true ? 1 : 0,
            tipoCompra : tipoCompra,
            justificacionCompra : !this._habilitaPrecio ? (<HTMLInputElement>document.getElementById('justificacionDescuento')).value : ''
        }

        this.srv.registraUnaCotizacion(cotizacionToSalvar).subscribe({
            next : (respuesta) => {
                console.log(respuesta)
                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El registro se guardó exitosamente.', 'success').then(()=>{
                        this.irAListar();
                    });
                } else {
                    this._salvando = false;
                    this.ref.detectChanges();
                }
            },
            error : (err) => {
                console.error(err);
                this._salvando = false;
                this.ref.detectChanges();
            }
        })
    }

    cotizacionEsValida() : boolean {
        const valorEnCantidad : string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        if(valorEnCantidad == '') {
            this._validaCantidad = true;
            return false;
        }

        if(valorEnCantidad != '') {
            const cantidad : number = Number(valorEnCantidad);
            if(cantidad <= 0) {
                this._validaCantidad = true;
                return false;
            }
        }

        if(!this._habilitaPrecio) {
            const anotacionDescuento : string = (<HTMLTextAreaElement>document.getElementById('justificacionDescuento')).value;
            if(anotacionDescuento == '') {
                this._validaAnotacioDescuento = true;
                return false;
            }
        }

        if(this._validaAnotacioDescuento) {
            return false;
        }

        if(this._validaExtensionDescuento) {
            return false;
        }

        if(this.justificacion == 'Otro motivo de compra') {
            if(document.getElementById('anotaciones')) {
                const anotaciones : string = (<HTMLTextAreaElement>document.getElementById('anotaciones')).value;
                if(anotaciones == '') {
                    this._validaAnotaciones = true;
                    return false;
                }
            }
        }

        if(this._validaAnotaciones) {
            return false;
        }

        if(this._validaLogitudAnotaciones) {
            return false;
        }

        const fechaVencimiento : string = (<HTMLInputElement>document.getElementById('fechaVencimiento')).value;
        if(fechaVencimiento == '') {
            this._fechaValida = true;
            return false;
        }

        if(this._advertenciaFechaPasadaActual) {
            return false;
        }

        if(this._fechaValida) {
            return false;
        }

        if(this._fechaValidaSuperior) {
            return false;
        }

        if(this._descripcion == undefined || this._descripcion == '') {
            Swal.fire('SICORE', 'Debe existir una descripción para la cotización.', 'error');
            return false;
        }

        return true;
    }

    irAListar() {
        this.router.navigate(['cotizacion/listar'])
    }

    descargarPDF(){
        let nombreElementoHTMLCotizacion : string = 'documentoCotizacion';
        if(this.cambioDeIdioma){
            nombreElementoHTMLCotizacion = 'documentoCotizacionIngles';
        }

        this.muestraVistaPDF = true;
        const intervalo = setInterval(()=>{
            if(document.getElementById(nombreElementoHTMLCotizacion)) {
                clearInterval(intervalo);

                const documento : HTMLElement = <HTMLElement>document.getElementById(nombreElementoHTMLCotizacion);
                if(documento) {
                    html2canvas(documento).then((canva)=>{
                        const anchoImagen : number = documento.offsetWidth;
                        const alturaImagen : number = documento.offsetHeight;
                    
                        const contenido = canva.toDataURL('image/png');
                        const pdf = new jsPDF('portrait', 'px', [anchoImagen, alturaImagen]);
                        pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);
        
                        window.open(pdf.output('bloburl'), '_blank');
                        this.muestraVistaPDF = false;
                    });
                }
            }
        },300)
    }
    
}