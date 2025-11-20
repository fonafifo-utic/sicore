import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { CotizacionServicio } from "../servicio/cotizacion.servicio";
import { iAnulaCotizacion, iCotizacion, iOpcionesParaAccion } from "../interfaces/iCotizacion";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { FormalizacionServicio } from "../../formalizacion/servicio/formalizacion.servicio";
import { iFacturasYComprobantes, iFormalizacion, iFormalizacionParaSalvar } from "../../formalizacion/interfaces/iFormalizacion";
import { ProyectoServicio } from "../../proyecto/servicio/proyecto.servicio";
import { InventarioServicio } from "../../inventario/servicio/inventario.servicio";
import { ClienteServicio } from "../../clientes/servicio/cliente.servicio";

@Component({
    selector : 'listar-cotizacion',
    templateUrl : 'cotizacion.listar.html',
    styleUrl : 'cotizacion.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListarCotizacion implements OnInit {

    private srv = inject(CotizacionServicio);
    private servicioFormalizacion = inject(FormalizacionServicio);
    private comprobantes! : Observable<iFacturasYComprobantes[]>;

    private servicioProyecto = inject(ProyectoServicio);
    private servicioInventario = inject(InventarioServicio);
    private servicioClientes = inject(ClienteServicio);

    private fechaCotizacionHecha! : string;
    private hoy : Date = new Date();
    _anno : string = this.hoy.getFullYear().toString();

    _fechaCotizacionHecha! : string;
    _fechaExpiracion! : string;

    _cotizaciones$! : Observable<iCotizacion[]>;
    _opciones! : iOpcionesParaAccion[];
    
    columnas : any[] = [];

    _estaCargandoRegistros : boolean = true;
    _mostrarFormalizacion : boolean = false;
    _mostrarPendiente : boolean = false;
    _credito : boolean = false;

    _esRequeridoComprobante : boolean = false;
    _esRequeridoNumeroFactura : boolean = false;
    _fechaValidaRequerida : boolean = false;
    _esMontoColonesRequerido : boolean = false;
    _fechaInvalidaCotizacion : boolean = false;
    _fechaInvalidaExpiracion : boolean = false;
    _esCreditoDebito : boolean = false;
    _yaExisteComprobante : boolean = false;
    _esFormatoIncorrecto : boolean = false;

    _tipoCambio : number = 0;
    _idCotizacion : number = 0;
    
    consecutivo! : number;
    _consecutivo! : string;
    
    _justificacion! : string;
    _guardando : boolean = false;
    _desHabilitarAplicar : boolean = false;

    private listadoFormalizaciones! : iFormalizacion [];

    _esAsistenteDDC : boolean = false;
    _esJefaturaDM : boolean = false;
    _esJefaturaDP : boolean = false;
    
    _uciii! : string;

    constructor (private router : Router, private ref : ChangeDetectorRef) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        if(perfil == 4) this._esAsistenteDDC = true;
        if(perfil == 6) this._esJefaturaDP = true;
        if(perfil == 7) this._esJefaturaDM = true;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)&& (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.hayProyectosAndInventario();
    }

    hayProyectosAndInventario(){
        this.servicioProyecto.traeTodosProyectos().subscribe({
            next : (proyectos) => {
                if(proyectos.length > 0) {

                    const proyectosActivos : number = proyectos.filter(item => item.indicadorEstado == 'Activo').length;
                    if(proyectosActivos > 0) {

                        this.servicioInventario.traeCompletoInventario().subscribe({
                            next : (inventario) => {
                                if(inventario.length > 0) {
                                    this.condicionesIniciales();
                                } else {
                                    Swal.fire('SICORE','No se puede mostrar las cotizaciones sin inventario previo.','warning').then(()=>{
                                        this.router.navigate(['inventario/agregar'])
                                    });
                                }
                            }
                        });

                    } else {
                        Swal.fire('SICORE','No se puede mostrar las cotizaciones sin proyectos activos.','warning').then(()=>{
                            this.router.navigate(['proyecto/listar'])
                        });
                    }
                } else {
                    Swal.fire('SICORE','No se puede mostrar las cotizaciones sin proyectos previos.','warning').then(()=>{
                        this.router.navigate(['proyecto/agregar']);
                    });
                }
            }
        })
    }

    condicionesIniciales() {
        this.traeTodasCotizaciones();
        this.traeFacturasYComprobantes();
                        
        this._opciones = [
            { claveOpcion : '1', opcion : 'Ver' },
            { claveOpcion : '2', opcion : 'Editar' },
            { claveOpcion : '3', opcion : 'Anular' },
            { claveOpcion : '4', opcion : 'Formalizar' }
        ];
    }

    agregarCotizacion(){
        this.router.navigate(['cotizacion/agregar'])
    }

    irAClientes() {
        this.router.navigate(['cliente/listar']);
    }

    traeTodasCotizaciones() {
        this._cotizaciones$ = this.srv.traeTodasCotizaciones();
        
        this._cotizaciones$.subscribe({
            next : (cotizaciones) => {
                if(cotizaciones.length > 0) {
                    this.columnas = [
                        { campo : 'consecutivo', encabezado : 'Consecutivo' },
                        { campo : 'nombreCliente', encabezado : 'Cliente' },
                        { campo : 'fechaHora', encabezado : 'Fecha' },
                        { campo : 'fechaExpiracion', encabezado : 'Expiración' },
                        { campo : 'cantidad', encabezado : 'Cantidad' },
                        { campo : 'precioUnitario', encabezado : 'Precio' },
                        { campo : 'montoTotalColones', encabezado : 'Monto Colones' },
                        { campo : 'montoTotalDolares', encabezado : 'Monto Dólares' },
                        { campo : 'indicadorEstado', encabezado : 'Estado' }
                    ];

                    this.ref.detectChanges();
                } else {
                    this.servicioClientes.traeTodosClientes().subscribe({
                        next : (clientes) => {
                            if(clientes.length > 0) {
                                const clientesActivos : number = clientes.filter(item => item.indicadorEstado == 'Activo').length;

                                if(clientesActivos > 0) {
                                    this.router.navigate(['cotizacion/agregar']);
                                } else {
                                    Swal.fire('SICORE','No se puede mostrar las cotizaciones sin clientes activos.','warning').then(()=>{
                                        this.router.navigate(['cliente/listar']);
                                    });
                                }
                            } else {
                                Swal.fire('SICORE','No se puede mostrar las cotizaciones sin clientes.','warning').then(()=>{
                                    this.router.navigate(['cliente/agregar']);
                                });
                            }
                        }
                    })
                }
            }
        });

        this.traeTodasFormalizaciones();
    }

    traeTodasFormalizaciones() {
        this.servicioFormalizacion.obtenerListadoFormalizacion().subscribe({
            next : (formalizaciones) => {
                this.listadoFormalizaciones = formalizaciones;
           }
        })
    }

    traeFacturasYComprobantes() {
        this.comprobantes = this.servicioFormalizacion.obtenerComprobantes();
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

        return numeroConFormato;
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    editarInventario(id : number){
        this.router.navigate(['inventario/editar/', id])
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

    irAEditarCotizacion(idCotizacion : number) {
        this.router.navigate(['cotizacion/editar/', idCotizacion])
    }

    irAVerCotizacion(idCotizacion : number){
        const cadenaParametroInterno : string = String(idCotizacion) + '0';
        const parametroInterno : number = Number(cadenaParametroInterno);
        
        this.router.navigate(['cotizacion/ver/', parametroInterno]);
    }

    anularCotizacion(idCotizacion : number, consecutivo : number){
        const hoy : Date = new Date();
        const anno : number  = hoy.getFullYear();

        const consecutivoToAnular : string = `DDC-CO-${this.colocaCerosAlNumeroEntero(consecutivo)}-${anno}`
        Swal.fire({
            title: `Va a anular la cotización número: ${consecutivoToAnular} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
          }).then((resultado) => {
            if (resultado.isConfirmed) {
                Swal.fire({
                    title: 'Descripción de la anulación:',
                    input: 'text',
                    showCancelButton: true
                  }).then((descripcionDeLaAnulacion)=>{
                    
                      const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
                      const cotizacionParaAnular : iAnulaCotizacion = {
                          descripcion : descripcionDeLaAnulacion.value,
                          idCotizacion : idCotizacion,
                          idUsuario : valorSesion.idUsuario
                      }
              
                      this.srv.anulaUnaCotizacion(cotizacionParaAnular).subscribe({
                          next : (respuesta) => {
                            if(respuesta.valor == '1'){
                                Swal.fire('SICORE','El registro se actualizó exitosamente.','success').then(()=>{
                                    location.reload();
                                });
                            }
                          },
                          error : (err) => console.error(err)
                      })
                })
            }
        });

    }

    seleccionaUnaOpcion(evento : any, cotizacion : iCotizacion) {
        if(evento.value == null) return;
        
        const valorEvento : iOpcionesParaAccion = evento.value;
        switch(valorEvento.claveOpcion) {
            case '1':
                this.irAVerCotizacion(cotizacion.idCotizacion);
                break;

            case '2':
                this.irAEditarCotizacion(cotizacion.idCotizacion);
                break;

            case '3':
                this.anularCotizacion(cotizacion.idCotizacion, cotizacion.consecutivo);
                break;

            case '4':
                this.mostrarFormalizacion(cotizacion);
                break;        
        }
    }

    mostrarFormalizacion(cotizacion : iCotizacion) {
        if(cotizacion.indicadorEstado == 'Inactiva' || cotizacion.indicadorEstado == 'Pendiente' || cotizacion.indicadorEstado == 'Formalizado') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No se puede formalizar una cotización que está inactiva o pendiente."
            });
            
            return;
        }
        
        const intervaloContenedor = setInterval(()=>{
            if(document.getElementById('comprobantePago')){
                clearInterval(intervaloContenedor);
                (<HTMLInputElement>document.getElementById('comprobantePago')).disabled = false;   
            }
        },300);
        
        const fechaHoy : Date = new Date();
        const anno : number = fechaHoy.getFullYear();

        this._idCotizacion = cotizacion.idCotizacion;
        this._tipoCambio = cotizacion.tipoCambio;
        this._consecutivo = `DDC-CO-${this.colocaCerosAlNumeroEntero(cotizacion.consecutivo)}-${anno}`;
        this.consecutivo = cotizacion.consecutivo;
        this._justificacion = cotizacion.anotaciones;
        this._credito = false;

        this.fechaCotizacionHecha = cotizacion.fechaHora;
        this._fechaCotizacionHecha = this.fechaCotizacionHecha;
        this._fechaExpiracion = cotizacion.fechaExpiracion;
        this._uciii = cotizacion.ucii;
        
        const fechaParaMostrar : string = this.daFormatoFechaCotizacion(this.fechaCotizacionHecha.split(' ')[0]);

        const intervalo = setInterval(()=>{
            if(document.getElementById('montoDolares')){
                clearInterval(intervalo);
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = fechaParaMostrar;
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' + cotizacion.montoTotalDolares.toLocaleString('es-CR', { minimumFractionDigits : 2 }).replace(',','.');
                
                //const montoSugeridoColones : number = cotizacion.montoTotalDolares * cotizacion.tipoCambio;
                //(<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + montoSugeridoColones.toLocaleString('es-CR').replace(',','.');
            }
        },300)

        this._mostrarFormalizacion = true;
    }

    mostrarFormalizacionPendiente(cotizacion : iCotizacion) {
        const fechaHoy : Date = new Date();
        const anno : number = fechaHoy.getFullYear();

        this._idCotizacion = cotizacion.idCotizacion;
        this._tipoCambio = cotizacion.tipoCambio;
        this._consecutivo = `DDC-CO-${this.colocaCerosAlNumeroEntero(cotizacion.consecutivo)}-${anno}`;
        this.consecutivo = cotizacion.consecutivo;
        this._justificacion = cotizacion.anotaciones;
        this._credito = true;

        this.fechaCotizacionHecha = cotizacion.fechaHora;
        this._fechaCotizacionHecha = this.fechaCotizacionHecha;
        this._fechaExpiracion = cotizacion.fechaExpiracion;
        
        const fechaParaMostrar : string = this.daFormatoFechaCotizacion(this.fechaCotizacionHecha.split(' ')[0]);

        const intervalo = setInterval(()=>{
            if(document.getElementById('montoDolares')){
                clearInterval(intervalo);
                (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value = fechaParaMostrar;
                (<HTMLInputElement>document.getElementById('montoDolares')).value = '$ ' +
                    cotizacion.montoTotalDolares.toLocaleString('es-CR', {minimumFractionDigits : 2}).replace(',','.');
                
                //(<HTMLInputElement>document.getElementById('comprobantePago')).focus();
            }
        },300)

        this._mostrarPendiente = true;
    }

    daFormatoFechaCotizacion(fecha : string) : string {
        const [mes, dia, anno] = fecha.split('/');
        
        return `${anno}-${mes}-${dia}`;
    }

    entraMontoColones() {
        this._esMontoColonesRequerido = false;
        let montoColonesSugerido : string = (<HTMLInputElement>document.getElementById('montoColones')).value;
        let montoEnNumeros : string = '';

        montoColonesSugerido.split('').forEach(item => {
            if(item.charCodeAt(0) != 160) montoEnNumeros = montoEnNumeros + item
        });

        (<HTMLInputElement>document.getElementById('montoColones')).value = montoEnNumeros.replace('₡','');
    }

    saleMontoColones() {
        const montoColonesSugerido : number = Number((<HTMLInputElement>document.getElementById('montoColones')).value);
        (<HTMLInputElement>document.getElementById('montoColones')).value = '₡ ' + montoColonesSugerido.toLocaleString('es-CR').replace(',','.');
    }

    cancelarFormalizacion() {
        this._mostrarFormalizacion = false;
        this._mostrarPendiente = false;
    }

    formalizarVenta() {
        if(!this.validaLaFormalizacion()) return;
        this._guardando = true;

        const fechaHora : string = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value;
        const montoDolares : number = this.daFormatoNumero((<HTMLInputElement>document.getElementById('montoDolares')).value);
        const numeroCIIU : string = (<HTMLInputElement>document.getElementById('codigoCIUU')).value;

        const comprobantePago : string = '';
        const numeroFactura : string = '';

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

                const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

                const formalizacion : iFormalizacionParaSalvar = {
                    consecutivo : this.consecutivo,
                    fechaHora : fechaHora,
                    idCotizacion : this._idCotizacion,
                    idFuncionario : valorSesion.idUsuario,
                    indicadorEstado : 'P',
                    justificacionCompra : this._justificacion,
                    montoColones : 0,
                    montoDolares : montoDolares,
                    numeroFacturaFonafifo : numeroFactura,
                    numeroTransferencia : this._credito ? '' : comprobantePago,
                    creditoDebito : this._credito ? 'C' : 'D',
                    numeroComprobante : '',
                    numeroCIIU : numeroCIIU
                }

                this.servicioFormalizacion.registrarUnaFormalizacionVenta(formalizacion).subscribe({
                    next : (respuesta) => {
                        this._guardando = false;
                        if(respuesta.valor == '1') {
                            Swal.fire({
                                title: "¡Gracias!",
                                text: "La cotización ha sido formalizada.",
                                icon: "success"
                            }).then(()=>{
                                location.reload();
                            });
                        }
                    },
                    error : (err) => {
                        console.error(err);
                        this._guardando = false;
                    }
                })

            } else {
                location.reload();
            }
        });
    }

    formalizarVentaPendiente() {
        //if(!this.validaLaFormalizacionPendienteCredito()) return;
        this._guardando = true;

        const fechaHora : string = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value;
        const montoDolares : number = this.daFormatoNumero((<HTMLInputElement>document.getElementById('montoDolares')).value);
        const numeroCIIU : string = '';

        const comprobantePago : string = '';
        const numeroFactura : string = '';

        this._mostrarPendiente = false;

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

                const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

                const formalizacion : iFormalizacionParaSalvar = {
                    consecutivo : this.consecutivo,
                    fechaHora : fechaHora,
                    idCotizacion : this._idCotizacion,
                    idFuncionario : valorSesion.idUsuario,
                    indicadorEstado : 'K',
                    justificacionCompra : this._justificacion,
                    montoColones : 0,
                    montoDolares : montoDolares,
                    numeroFacturaFonafifo : numeroFactura,
                    numeroTransferencia : comprobantePago,
                    creditoDebito : 'C',
                    numeroComprobante : '',
                    numeroCIIU : numeroCIIU
                }

                this.servicioFormalizacion.registrarUnaFormalizacionVenta(formalizacion).subscribe({
                    next : (respuesta) => {
                        this._guardando = false;
                        if(respuesta.valor == '1') {
                            Swal.fire({
                                title: "¡Gracias!",
                                text: "La cotización ha sido formalizada.",
                                icon: "success"
                            }).then(()=>{
                                location.reload();
                            });
                        }
                    },
                    error : (err) => {
                        console.error(err);
                        this._guardando = false;
                    }
                })

            } else {
                location.reload();
            }
        });
    }

    entraComprobante() {
        this._esRequeridoComprobante = false;
        this._esFormatoIncorrecto = false;
    }

    entraNumeroFactura(){
        this._esRequeridoNumeroFactura = false;
    }

    entraFecha() {
        this._fechaValidaRequerida = false;
        this._fechaInvalidaCotizacion = false;
        this._fechaInvalidaExpiracion = false;
    }

    saleFecha() {
        const fechaHoy : Date = new Date();

        const [anno, mes, dia] = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value.split('-');
        const fechaElegida = `${mes}/${dia}/${anno}`;
        const fechaElegidaConvertida : number = Date.parse(fechaElegida);
        const fechaCotizacionConvertida : number = Date.parse(this.fechaCotizacionHecha.split(' ')[0]);
        const fechaExpiracionConvertida : number = Date.parse(this._fechaExpiracion.split(' ')[0]);

        if(fechaElegidaConvertida < fechaCotizacionConvertida) {
            this._fechaInvalidaCotizacion = true;
            this._desHabilitarAplicar = true;
            return;
        }

        if(fechaElegidaConvertida > fechaExpiracionConvertida) {
            this._fechaInvalidaExpiracion = true;
            this._desHabilitarAplicar = true;
            return;
        }

        if((!this._fechaInvalidaCotizacion) && (!this._fechaInvalidaExpiracion)) this._desHabilitarAplicar = false;   
    }

    saleComprobante() {
        this._esRequeridoComprobante = true;
    }

    validaLaFormalizacion() : boolean {
        //const comprobantePago : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        const fechaHora : string = (<HTMLInputElement>document.getElementById('fechaFormalizacion')).value;

        // if(comprobantePago == '' && !this._credito) {
        //     this._esRequeridoComprobante = true;
        //     return false;
        // }

        if(fechaHora == '') {
            this._fechaValidaRequerida = true;
            return false;
        }

        if(this._esRequeridoComprobante) return false;
        if(this._esFormatoIncorrecto) return false;
        
        return true;
    }

    validaLaFormalizacionPendienteCredito() : boolean {
        const comprobantePago : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;
        
        if(this._esFormatoIncorrecto) return false;

        if(comprobantePago == '' && this._credito) {
            this._esRequeridoComprobante = true;
            return false;
        }

        return true;
    }

    validaComprobantes() {
        const codigo : string = (<HTMLInputElement>document.getElementById('codigoCIUU')).value;

        if(codigo == '') {
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

    validaComprobanteCredito() {
        let cantidadComprobantes : number = 0;
        const comprobante : string = (<HTMLInputElement>document.getElementById('comprobantePago')).value;

        if(comprobante == '') {
            this._esRequeridoComprobante = true;
            return;
        }

        // this.comprobantes.subscribe({
        //     next : comprobantes => {
        //         cantidadComprobantes = comprobantes.filter(item => item.numeroTransferencia === comprobante).length;
        //         if(cantidadComprobantes > 0) this._yaExisteComprobante = true;
        //         this.ref.detectChanges();
        //     },
        //     error : err => console.error(err)
        // });

        // if(comprobante.length < 8) {
        //     this._esFormatoIncorrecto = true;
        //     return;
        // }

        if(comprobante.length > 9) {
            this._esFormatoIncorrecto = true;
            return;
        }

        if(isNaN(Number(comprobante))) {
            this._esFormatoIncorrecto = true;
            return;
        }

    }

    formalizacionCredito(evento : any) {
        if(evento.checked) {
            this._credito = true;
            this._esRequeridoComprobante = false;
        } else {
            this._credito = false;
        }
    }

    daFormatoNumero(monto : string) : number {
        let montoEnNumeros : string = '';

        monto.split('').forEach(item => {
            if(item.charCodeAt(0) != 160) montoEnNumeros = montoEnNumeros + item
        });

        if(montoEnNumeros.includes('₡')){
            montoEnNumeros = montoEnNumeros.replace('₡','');
        } else {
            montoEnNumeros = montoEnNumeros.replace('$','');
        }

        return Number(montoEnNumeros);
    }

    determinaAlarma(cantidadDiasEnviado : any) {
        if(cantidadDiasEnviado >= 30) {
            return 'determina-tiempo-envio';
        }

        return '';
    }

    esCreditoDebito(estado : string) : boolean {
        return ((estado === 'Activa') || (estado == 'Enviada'));
    }

    esParaVerEditar(cotizacion : iCotizacion) : boolean {
        if((this._esAsistenteDDC) || (this._esJefaturaDM) || (this._esJefaturaDP)) return false;
        
        return (
            (cotizacion.indicadorEstado == 'Activa') ||
            (cotizacion.indicadorEstado == 'Rechazada') ||
            (cotizacion.indicadorEstado == 'Uso Interno')
        );
    }

    esParaAnular(cotizacion : iCotizacion) : boolean {
        if((this._esAsistenteDDC) || (this._esJefaturaDM) || (this._esJefaturaDP)) return false;

        return (
            (cotizacion.indicadorEstado == 'Activa') ||
            (cotizacion.indicadorEstado == 'Inactiva') ||
            (cotizacion.indicadorEstado == 'Pendiente') ||
            (cotizacion.indicadorEstado == 'Enviada') ||
            (cotizacion.indicadorEstado == 'Rechazada')
        );
    }

    esParaFormalizar(cotizacion : iCotizacion) {
        if((this._esAsistenteDDC) || (this._esJefaturaDM) || (this._esJefaturaDP)) return false;

        return (
            (cotizacion.indicadorEstado == 'Activa') ||
            (cotizacion.indicadorEstado == 'Enviada')
        );
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

    agruparCotizaciones() {
        this.router.navigate(['cotizacion/agrupar']);
    }
}