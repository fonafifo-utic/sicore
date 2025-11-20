import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { CertificacionServicio } from "../servicio/certificacion.servicio";
import { TextosParaCertificado } from "../servicio/texto-para-certificado";
import { iPoneObservacionesAlCertificado, iVistaCertificado } from "../interfaces/iCertificacion";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PersonalizacionServicio } from "../../personalizacion/servicio/personalizacion.servicio";
import { iPersonalizacion } from "../../personalizacion/interfaces/iPersonalizacion";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import Swal from "sweetalert2";
import { EditarCertificado } from "../editar/certificado.editar";
import { scale } from "pdf-lib";

@Component({
    selector: 'certificado-ver',
    templateUrl: 'certificado.ver.html',
    styleUrl: 'certificado.ver.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, EditarCertificado]
})

export class VerCertificado implements OnInit, OnDestroy {

    private servicioPersonalizacion = inject(PersonalizacionServicio);
    private textoDesdePersonalizacion!: iPersonalizacion;
    private idFuncionario: number = 0;

    _idCertificado!: string;

    _encabezado_1: string = TextosParaCertificado.E_GCR;
    _encabezado_2: string = TextosParaCertificado.E_MINISTERIO;
    _encabezado_3: string = TextosParaCertificado.E_FONAFIFO;

    _ucc: string = TextosParaCertificado.C_UCC;
    _ucc_ingles: string = TextosParaCertificado.C_UCC_INGLES;

    _advertencia: string = TextosParaCertificado.ADVERTENCIA_TRANSFERENCIA;
    _advertencia_ingles: string = TextosParaCertificado.ADVERTENCIA_TRANSFERENCIA_INGLES;

    _adquisicionA : string = '';
    _adquisicionB!: string;
    _adquisicionC!: string;

    _nombreCertificado: string = '';
    _autorizacion!: string;

    _fecha!: string;
    _numeroCertificado!: string;

    _numeroCedula : string = '';
    _montoTransferencia : string = '';
    
    private monto : number = 0;

    _numeroTransferencia!: string;
    _banco!: string;
    _fechaTransferencia!: string;
    _cantidad! : string;
    cantidad: number = 0;
    
    _proyecto : string = '';
    _periodo!: string;
    _convenio: string = TextosParaCertificado.ADENDA;
    _convenio_ingles: string = TextosParaCertificado.ADENDA_INGLES;
    _notaFinal!: string;
    _usuarioFecha!: string;
    _anotaciones!: string;
    _numeroDeIdentificacionUnico! : string;

    _enIngles: boolean = false;
    _esAsistenteDDC: boolean = false;
    _esAsistenteDE: boolean = false;
    _activaObservaciones : boolean = false;
    _desHabilitarGuardar: boolean = true;
    _seExportara: boolean = false;
    _observaciones: string = '';
    _director!: string;
    _tituloDirector! : string;
    _numeroCertificadoUnico! : string;

    _vistaEdicion : boolean = false;

    private cedulaJuridica! : string;
    private nombreCertificado! : string;
    private numeroTransferencia! : string;

    _muestrarEdicionCertificado : boolean = false;
    _muestraModalEdicionCertificado : boolean = false;

    _fuenteCliente : string = 'font-size: 50px;';

    _certificadoAprobado : boolean = false;

    private revisaAccionesEnEditar : any;

    private ingresaPor! : string;

    _certificadoDeUsoInterno : boolean = false;

    constructor(private route: ActivatedRoute, private router: Router, private srv: CertificacionServicio, private ref: ChangeDetectorRef) {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        this.idFuncionario = valorSesion.idUsuario;
        const perfil: number = valorSesion.idPerfil;

        if ((perfil !== 1) && (perfil !== 2) && (perfil !== 5) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])

        if (perfil == 4) this._esAsistenteDDC = true;

        if (perfil == 5) this._esAsistenteDE = true;
    }

    ngOnInit(): void {
        const parametroInterno : string = this.route.snapshot.paramMap.get('id')!;
        
        this.ingresaPor = parametroInterno.slice(-1);
        
        this._idCertificado = parametroInterno.slice(0, parametroInterno.length - 1);

        this.srv.setIdCertificado(this._idCertificado);
        this.srv.setCertificadoEnIngles(false);
        this.srv.setMuestraObservaciones(false);
        
        this.traeCertificado();
        this.traePersonalizacion();
    }

    traePersonalizacion() {
        this.servicioPersonalizacion.listarPersonalizacion().subscribe({
            next: (personalizacion) => {
                if (personalizacion.length != 0) {
                    this.textoDesdePersonalizacion = personalizacion[0];
                }
            },
            error: (err) => console.error(err)
        });
    }

    colocaLosTextosDelCertificado() {
        const intervalo = setInterval(() => {
            if (this.textoDesdePersonalizacion.idPersonalizacion > 0) {
                clearInterval(intervalo);
    
                if(this._adquisicionA.length > 1) return;

                this._adquisicionA = `${TextosParaCertificado.ADQUISICION_1}`;
    
                this._adquisicionB = `${TextosParaCertificado.ADQUISICION_2}`;
                this._adquisicionB = `${this._adquisicionB} ${TextosParaCertificado.ADQUISICION_3}`;
    
                this._autorizacion = this.textoDesdePersonalizacion.leyendaDescripcionCertificadoEspannol;
    
                this._notaFinal = `${TextosParaCertificado.NOTA_1}`;
                this._notaFinal = `${this._notaFinal} ${TextosParaCertificado.NOTA_2}`;
                
                this.ref.detectChanges();
            }
        }, 300)
    }

    colocaLosTextosDelCertificadoIngles() {
        const intervalo = setInterval(() => {
            if (this.textoDesdePersonalizacion.idPersonalizacion > 0) {
                clearInterval(intervalo);

                this._adquisicionA = TextosParaCertificado.ADQUISICION_1_INGLES;
                this._adquisicionB = TextosParaCertificado.ADQUISICION_2_INGLES;
                this._adquisicionC = TextosParaCertificado.ADQUISICION_3_INGLES;

                this._autorizacion = this.textoDesdePersonalizacion.leyendaDescripcionCertificadoIngles;

                this._notaFinal = `${TextosParaCertificado.NOTA_1_INGLES}`;
                this._notaFinal = `${this._notaFinal} ${TextosParaCertificado.NOTA_2_INGLES}`;
                this._notaFinal = `${this._notaFinal} ${TextosParaCertificado.NOTA_3_INGLES}`;

                this._convenio = TextosParaCertificado.ADENDA_INGLES;

                this.ref.detectChanges();
            }
        }, 300)
    }

    traeCertificado() {
        this.srv.obtieneCertificadoPorId(this._idCertificado).subscribe({
            next: (certificados) => {
                const certificado : iVistaCertificado[] = certificados;
                
                certificado.forEach(item => {
                    if(item.indicadorEstado == 'U') this._certificadoDeUsoInterno = true;
                })
                
                this.construyeCertificado(certificado);
            },
            error: (err) => console.error(err)
        })
    }

    construyeCertificado(certificados : iVistaCertificado[]) {
        certificados.forEach(certificado => {
            this._director = certificado.directorEjecutivo;
            this._tituloDirector = this.determinaTituloDirector(this._director);
            
            this.colocaLaCantidad(certificado.cantidad);

            this.colocaElNombreProyecto(certificado.proyecto);
    
            if(certificado.enIngles == 'S') {
                this.colocaLosTextosDelCertificadoIngles();
                this._enIngles = true;
            } else {
                this.colocaLosTextosDelCertificado();
                this._enIngles = false;
            }
            
            this.colocaElNombreCertificado(certificado.nombreCertificado);
                
            this._fecha = this.daFormatoFecha(certificado.fechaEmisionCertificado);
            this._numeroCertificado = this.construyeNumeroCertificado(certificado.numeroCertificado, certificado.periodo);
    
            this.colocaElMontoDelCertificado(certificado.montoTransferencia);
            
            this._numeroTransferencia = certificado.numeroTransferencia;
            this._banco = 'Banco Nacional de Costa Rica';
            this._fechaTransferencia = this.daFormatoFecha(certificado.fechaTransferencia);
    
            this._periodo = certificado.periodo.toString();
            this._anotaciones = certificado.anotaciones;
    
            this._usuarioFecha = this.construyeNombreUsuario(certificado.usuario, certificado.emailUsuario);
            this._numeroCertificadoUnico = certificado.numeroIdentificacionUnico;
    
            this.colocaElNumeroCedula(certificado.cedulaJuridicaComprador);
            
            this.numeroTransferencia = certificado.numeroTransferencia;
    
            if(certificado.indicadorEstado == 'A') this._certificadoAprobado = true;
    
            this._numeroDeIdentificacionUnico = certificado.numeroCertificadoUnico;
    
            this.construyeObservaciones(certificado);
            this.construyeTamannoTitulo(certificado);
        })
        
        this.ref.detectChanges();
    }

    colocaLaCantidad(cantidad : number) {
        this.cantidad += cantidad;
        this._cantidad = this.cantidad.toLocaleString('es-CR', { minimumFractionDigits: 2 });
    }

    colocaElNombreProyecto(proyecto : string) {
        this._proyecto = this._proyecto + ', ' + proyecto;
        this._proyecto = this._proyecto.replace(/^,/, '').trim();

        if(this._proyecto.split(', ')[0] == this._proyecto.split(', ')[1]) {
            this._proyecto = proyecto;
        }
    }

    colocaElNombreCertificado(nombre : string) {
        if(this._nombreCertificado.includes(nombre)) return;

        this._nombreCertificado =  this._nombreCertificado + ', ' + nombre;
        this._nombreCertificado =  this._nombreCertificado.replace(/^,/, '').trim();

        this.nombreCertificado = this.nombreCertificado + ', ' + nombre;
        this.nombreCertificado = this.nombreCertificado.replace(/^,/, '').trim();
    }

    colocaElNumeroCedula(cedula : string) {
        if(this._numeroCedula.includes(cedula)) return;

        this._numeroCedula = this._numeroCedula + ', ' + cedula;
        this._numeroCedula = this._numeroCedula.replace(/^,/, '').trim();
        
        if (this._numeroCedula.startsWith(',')) this._numeroCedula.slice(1).trim();

    }

    colocaElMontoDelCertificado(montoTransferencia : number) {
        this.monto += montoTransferencia;
        
        this._montoTransferencia = this.monto.toLocaleString('es-CR', { minimumFractionDigits: 2 });
    }

    construyeObservaciones(certificado: iVistaCertificado) {
        if (certificado.observaciones.length > 0) {
            this._activaObservaciones = true;
            this._observaciones = this.recortaObservaciones(certificado.observaciones);
        }
    }

    construyeTamannoTitulo(certificado : iVistaCertificado) {
        if(certificado.cssCertificado == null) return;
        
        if(certificado.cssCertificado.length > 0) {
            this._fuenteCliente = certificado.cssCertificado;
            //this._fuenteCliente = `font-size: ${certificado.cssCertificado}px;`;
        }
    }

    irToCertificados() {
        switch(this.ingresaPor) {
            case '0':
                this.router.navigate(['certificados/listar']);
                break;

            case '1':
                this.router.navigate(['reportes/certificado/listado-mensual']);
                break;
        }
    }

    construyeNumeroCertificado(consecutivo: string, periodo: number): string {
        return String(periodo) + '-' + this.colocaCerosAlNumeroEntero(consecutivo);
    }

    construyeNombreUsuario(usuario: string, email: string): string {
        const nombre: string = this.daFormatoNombre(usuario);
        const hoy: Date = new Date();
        const mes: string = this.nombreMes(hoy.getMonth() + 1);
        const anno: string = hoy.getFullYear().toString();

        return `${nombre} | ${email} | ${mes} ${anno}`;
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

    nombreMes(mes: number): string {
        let nombreMes: string = '';
        switch (mes) {
            case 1:
                nombreMes = 'Enero';
                break;

            case 2:
                nombreMes = 'Febrero';
                break;

            case 3:
                nombreMes = 'Marzo';
                break;

            case 4:
                nombreMes = 'Abril';
                break;

            case 5:
                nombreMes = 'Mayo';
                break;

            case 6:
                nombreMes = 'Junio';
                break;

            case 7:
                nombreMes = 'Julio';
                break;

            case 8:
                nombreMes = 'Agosto';
                break;

            case 9:
                nombreMes = 'Septiembre';
                break;

            case 10:
                nombreMes = 'Octubre';
                break;

            case 11:
                nombreMes = 'Noviembre';
                break;

            case 12:
                nombreMes = 'Diciembre';
                break;
        }

        return nombreMes;
    }

    colocaCerosAlNumeroEntero(consecutivo: string): string {
        let numeroConFormato: string = '';

        switch (consecutivo.length) {
            case 1:
                numeroConFormato = '00' + consecutivo;
                break;
            case 2:
                numeroConFormato = '0' + consecutivo;
                break;
            case 3:
                numeroConFormato = consecutivo;
                break;
        }

        return numeroConFormato;
    }

    daFormatoFecha(fecha: string): string {
        const nuevaFecha: Date = new Date(fecha);
        const opciones: any = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return nuevaFecha.toLocaleDateString('es-CR', opciones);
    }

    selecccionaIdioma(evento: any) {
        if (evento.target.checked) {
            this._enIngles = true;
            this.colocaLosTextosDelCertificadoIngles();
        }
        else {
            this._enIngles = false;
            this.colocaLosTextosDelCertificado();
        }
    }

    activaObservaciones(evento: any) {
        if (evento.target.checked) {
            this._activaObservaciones = true;
        }
        else {
            this._activaObservaciones = false;
        }
    }

    bancoTransferido(convenio: string): string {
        let banco: string = '';
        switch (convenio) {
            case 'N':
                banco = 'Banco Nacional de Costa Rica';
                break;

            case 'F':
                banco = 'Convenio ICT-BNCR';
                break;

            case 'M':
                banco = 'FONDO PSA-Mujer';
                break;
        }

        return banco;
    }

    descargarPDF_ambiguo() {
        this._seExportara = true;

        const primeraPlana: HTMLElement = <HTMLElement>document.getElementById('primerPlanoCertificado');
        const segundaPlana: HTMLElement = <HTMLElement>document.getElementById('segundoPlanoCertificado');

        const intervalo = setInterval(() => {
            if (primeraPlana) {
                clearInterval(intervalo);

                html2canvas(primeraPlana).then((canva) => {
                    const anchoImagen: number = primeraPlana.offsetWidth;
                    const alturaImagen: number = primeraPlana.offsetHeight;

                    const contenido = canva.toDataURL('image/png');
                    const pdf = new jsPDF('landscape', 'px', [anchoImagen, alturaImagen]);

                    pdf.setProperties({
                        title: this._numeroCertificado
                    });

                    pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);

                    html2canvas(segundaPlana).then((segundaCanva) => {
                        const anchoImagenSegundaPlana: number = segundaPlana.offsetWidth;
                        const alturaImagenSegundaPlana: number = segundaPlana.offsetHeight;

                        const contenidoSegundaPlana = segundaCanva.toDataURL('image/png');

                        pdf.addPage([anchoImagenSegundaPlana, alturaImagenSegundaPlana], 'landscape');
                        pdf.addImage(contenidoSegundaPlana, 'PNG', 0, 0, anchoImagenSegundaPlana, alturaImagenSegundaPlana);

                        window.open(pdf.output('bloburl'), '_blank');

                        this._seExportara = false;
                        const intervalo = setInterval(() => {
                            if (this._enIngles) {
                                if (document.getElementById('observacionIngles')) {
                                    (<HTMLTextAreaElement>document.getElementById('observacionIngles')).value = this.recortaObservaciones(this._observaciones);
                                }
                            } else {
                                if (document.getElementById('observacion')) {
                                    (<HTMLTextAreaElement>document.getElementById('observacion')).value = this.recortaObservaciones(this._observaciones);
                                }
                            }

                            clearInterval(intervalo);
                        }, 300);

                    })
                })
            }
        }, 300)
    }

    descargarPDF() {
        this._seExportara = true;

        const primeraPlana: HTMLElement = <HTMLElement>document.getElementById('primerPlanoCertificado');
        const segundaPlana: HTMLElement = <HTMLElement>document.getElementById('segundoPlanoCertificado');

        const intervalo = setInterval(() => {
            if (primeraPlana) {
                clearInterval(intervalo);

                const configuracionCanvas = {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    allowTaint: false,
                    removeContainer: true,
                    width: primeraPlana.offsetWidth,
                    height: primeraPlana.offsetHeight,
                    windowWidth: primeraPlana.scrollWidth
                };

                const comprimeCanvas = (canvas: HTMLCanvasElement): string => {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    const scaleFactor = 1;
                    tempCanvas.width = canvas.width * scaleFactor;
                    tempCanvas.height = canvas.height * scaleFactor;
                    
                    tempCtx?.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                    
                    return tempCanvas.toDataURL('image/jpeg', 1);
                };

                Promise.all([
                    html2canvas(primeraPlana, configuracionCanvas),
                    html2canvas(segundaPlana, configuracionCanvas)
                ]).then(([canvaPrimera, canvaSegunda]) => {
                    const anchoImagen: number = primeraPlana.offsetWidth;
                    const alturaImagen: number = primeraPlana.offsetHeight;
                    
                    const anchoImagenSegunda: number = segundaPlana.offsetWidth;
                    const alturaImagenSegunda: number = segundaPlana.offsetHeight;

                    const contenido = comprimeCanvas(canvaPrimera);
                    const contenidoSegunda = comprimeCanvas(canvaSegunda);

                    const pdf = new jsPDF('landscape', 'px', [anchoImagen, alturaImagen]);

                    pdf.setProperties({
                        title: this._numeroCertificado
                    });

                    pdf.addImage(contenido, 'JPEG', 0, 0, anchoImagen, alturaImagen);
                    pdf.addPage([anchoImagenSegunda, alturaImagenSegunda], 'landscape');
                    pdf.addImage(contenidoSegunda, 'JPEG', 0, 0, anchoImagenSegunda, alturaImagenSegunda);

                    window.open(pdf.output('bloburl'), '_blank');

                    this._seExportara = false;

                    const intervaloObs = setInterval(() => {
                        if (this._enIngles) {
                            if (document.getElementById('observacionIngles')) {
                                (<HTMLTextAreaElement>document.getElementById('observacionIngles')).value = this.recortaObservaciones(this._observaciones);
                            }
                        } else {
                            if (document.getElementById('observacion')) {
                                (<HTMLTextAreaElement>document.getElementById('observacion')).value = this.recortaObservaciones(this._observaciones);
                            }
                        }
                        
                        clearInterval(intervaloObs);
                    }, 300);
                });
            }
        }, 300);
    }

    saleObservaciones() {
        if (this._activaObservaciones) {
            if (this._enIngles) {
                this._observaciones = this.recortaObservaciones((<HTMLTextAreaElement>document.getElementById('observacionIngles')).value);
            } else {
                this._observaciones = this.recortaObservaciones((<HTMLTextAreaElement>document.getElementById('observacion')).value);
            }

            if (this._observaciones.length > 0) this._desHabilitarGuardar = false;
        } else return;
    }

    actualizarCertificado() {
        const certificado: iPoneObservacionesAlCertificado = {
            observacion: this._observaciones,
            idCertificado: this._idCertificado,
            idFuncionario: this.idFuncionario,
            cedulaJuridica : this.cedulaJuridica,
            nombreCertificado : this.nombreCertificado,
            numeroTransferencia : this.numeroTransferencia,
            justificacionEdicion : '',
            cssCertificado : '',
            indicadorEstado : 'A',
            enIngles : ''
        }

        this.srv.apruebaCertificado(certificado).subscribe({
            next: respuesta => {
                if (respuesta.valor == '1') {
                    Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                        location.reload();
                    })
                }
            },
            error: err => console.error(err)
        })
    }

    determinaTituloDirector(director : string) : string {
        if(director == 'Gilmar Navarrete Chacón') return 'Director Ejecutivo';
        else return 'Director Ejecutivo a. i.';
    }
    
    irToEditar() {
        this.monitorDeServicioCertificado();

        this._muestrarEdicionCertificado = true;
        this._muestraModalEdicionCertificado = true;
        this.srv.setTerminaEdicionCertificado(true);

        const intervalo = setInterval(()=>{
            const terminaSesionEditarCertificado : boolean = this.srv.getTerminaEdicionCertificado();
            if(!terminaSesionEditarCertificado) {
                clearInterval(intervalo);
                this._muestrarEdicionCertificado = false;
                
                this.ref.detectChanges();
            }
        },300)
    }

    monitorDeServicioCertificado(){
        this.revisaAccionesEnEditar = setInterval(()=>{
            if(this.srv.getCertificadoEnIngles()) this.colocaLosTextosDelCertificadoIngles();    
            else this.colocaLosTextosDelCertificado();
                
            if(this.srv.getMuestraObservaciones()) {
                this._activaObservaciones = true;
                const cadena : string = this.srv.getLasObservaciones();
                this._observaciones = cadena.substring(0, 700);
            } else this._activaObservaciones = false;

            if(this.srv.getTamannoBarraTitulo() != undefined){
                this._fuenteCliente = `font-size: ${this.srv.getTamannoBarraTitulo()}px`;
            }
        },300)
    }

    ngOnDestroy(): void {
        clearInterval(this.revisaAccionesEnEditar);
    }

    fuenteNormal(proyecto : string) : string {
        if(proyecto.length > 115) return 'fuente-normal';
        else return 'fuente-normal-1';
    }

    recortaObservaciones(cadena : string) : string {
        if (cadena.length > 700) {
            return cadena.substring(0, 700) + "...";
        }
        
        return cadena;
    }

}