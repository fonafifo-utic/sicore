import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { PrimeNgModule } from "../../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../../../auth/login/ilogin";
import { ReportesServicio } from "../../../servicio/reportes.servicio";
import { iListadoRespuestasPorAnno } from "../../../../certificacion/interfaces/iCertificacion";
import { PersonalizacionServicio } from "../../../../personalizacion/servicio/personalizacion.servicio";
import { iParametrosReporteEncuesta } from "../../../../personalizacion/interfaces/iPersonalizacion";
import { FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";

@Component({
    selector: 'encuesta-respuestas-poranno',
    templateUrl: 'encuesta.respuestas.poranno.html',
    styleUrl: 'encuesta.respuestas.poranno.css',
    imports: [PrimeNgModule, CommonModule],
    standalone: true
})

export class EncuestaRespuestasPorAnno implements OnInit, OnDestroy {
    @ViewChild('myTextArea') myTextArea!: ElementRef<HTMLTextAreaElement>;
    
    private elementosConSombra : HTMLElement[] = [];
    private sombras = new Map<HTMLElement, string>();

    _pieData: any;
    _pieOpciones: any;

    private srv = inject(ReportesServicio);
    private servicioPersonalizacion = inject(PersonalizacionServicio);

    _perfilPermitido: boolean = true;
    _respuestas!: iListadoRespuestasPorAnno;

    private parametros!: iParametrosReporteEncuesta;
    _consecutivoDeDescarga: number = 0;
    _textoAlternativo!: string;

    _fechaGeneracion: Date = new Date();
    _consecutivo: string = `DOC-ENCUESTA-XXX-${this._fechaGeneracion.getFullYear()}`;
    _usuario!: string;
    _esVisibleTexto: boolean = false;

    _desHabilitarSalvar: boolean = true;
    _desHabilitarDescargar: boolean = true;

    textAreaControl = this.fb.control('');

    constructor(private router: Router, private ref: ChangeDetectorRef, private fb: FormBuilder) {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if (valorSesion.idPerfil == 4) this._perfilPermitido = false;
        this._usuario = this.daFormatoNombre(valorSesion.nombreCompleto);
    }

    ngOnInit(): void {
        const documentStyle = getComputedStyle(document.documentElement);

        this.srv.traeRespuestasPorAnno().subscribe({
            next: respuestas => {
                this._respuestas = respuestas[0];

                const conteo: number[] = [];

                conteo.push(this._respuestas.formulariosEnviados);
                conteo.push(this._respuestas.formulariosRespondidos);

                this._pieData = {
                    labels: [
                        `Enviadas: ${this._respuestas.formulariosEnviados.toString()} encuestas.`,
                        `Contestadas: ${this._respuestas.formulariosRespondidos.toString()} encuestas.`
                    ],
                    datasets: [
                        {
                            data: conteo,
                            backgroundColor: [
                                documentStyle.getPropertyValue('--indigo-500'),
                                documentStyle.getPropertyValue('--purple-500')
                            ],
                            hoverBackgroundColor: [
                                documentStyle.getPropertyValue('--indigo-400'),
                                documentStyle.getPropertyValue('--purple-400')
                            ],
                            borderRadius: 10
                        }
                    ]
                };

                this._pieOpciones = {
                    layout: {
                        padding: 100
                    },
                    plugins: {
                        datalabels: {
                            display: true,
                            color: '#000',
                            anchor: 'end',
                            align: 'end',
                            offset: 10,
                            formatter: (contextoDelGrafico: any) => {
                                const formato = new Intl.NumberFormat('es-CR', {
                                    minimumFractionDigits: 2
                                });

                                return `${formato.format(contextoDelGrafico)}`;
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (contextoDelGrafico: any) => {
                                    const valorNumerico = contextoDelGrafico.parsed;

                                    const totalNumerico = contextoDelGrafico.chart.data.datasets[0].data.reduce((anterior: number, actual: number) => anterior + actual, 0);
                                    const porcentajeRequerido = ((valorNumerico / totalNumerico) * 100).toFixed(2);

                                    const formatoMoneda = new Intl.NumberFormat('es-CR', {
                                        minimumFractionDigits: 2
                                    });

                                    return `${formatoMoneda.format(valorNumerico)}: (${porcentajeRequerido}%)`;
                                }
                            }
                        },
                        legend: {
                            display: true,
                            position: "bottom",
                            align: "center",
                            textDirection: 'ltr',
                            labels: {
                                usePointStyle: true,
                                fontColor: "#006192",
                            },
                        },
                        title: {
                            display: true,
                            text: 'Respuestas a la Encuesta por Año'
                        },
                    }
                };

                this.ref.detectChanges();
            },
            error: err => console.error(err)
        });

        this.servicioPersonalizacion.obtenerParametrosReporteEncuesta().subscribe({
            next: parametros => {
                this.parametros = parametros[0];
                this._consecutivoDeDescarga = this.parametros.consecutivo;
                this._consecutivo = `DOC-ENCUESTA-${this.colocaCerosAlNumeroEntero(this._consecutivoDeDescarga)}-${this._fechaGeneracion.getFullYear()}`;
                this._textoAlternativo = this.parametros.textoAlternativoReporte;

                (<HTMLTextAreaElement>document.getElementById('textoPersonalizado')).value = this._textoAlternativo;

                this.ref.detectChanges();
            },
            error: err => console.error(err)
        });

        this.textAreaControl.valueChanges.subscribe(() => {
            this.contenidoDelTextArea();
        });

        document.addEventListener('visibilitychange', this.handleVisibilizarCambios.bind(this));

        this.quitaBoxShadows();
    }

    ngOnDestroy() {
        document.removeEventListener('visibilitychange', this.handleVisibilizarCambios.bind(this));
    }

    descargarPDF() {
        this._esVisibleTexto = true;
        this._consecutivoDeDescarga += 1;
        
        this.actualiza();
        this.quitaBoxShadows();

        this._textoAlternativo = (<HTMLTextAreaElement>document.getElementById('textoPersonalizado')).value;
        this._consecutivo = `DOC-ENCUESTA-${this.colocaCerosAlNumeroEntero(this._consecutivoDeDescarga)}-${this._fechaGeneracion.getFullYear()}`;

        const documento: HTMLElement = <HTMLElement>document.getElementById('documento');
        const intervalo = setInterval(() => {
            if (documento) {
                clearInterval(intervalo);

                html2canvas(documento).then((canva) => {
                    const pdf = new jsPDF('portrait', 'mm', 'letter');
                    const anchoImagen: number = pdf.internal.pageSize.getWidth();
                    const alturaImagen: number = pdf.internal.pageSize.getHeight();
                    const contenido = canva.toDataURL('image/png');

                    pdf.addImage(contenido, 'PNG', 0, 0, anchoImagen, alturaImagen);

                    window.open(pdf.output('bloburl'), '_blank');
                })
            }
        }, 300)
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

    handleVisibilizarCambios() {
        if (document.visibilityState === 'visible' && this._esVisibleTexto) {
            this.restoreBoxShadows();
            this._esVisibleTexto = false;
            this.ref.detectChanges();

            const intervalo = setInterval(() => {
                if (document.getElementById('textoPersonalizado')) {
                    clearInterval(intervalo);
                    (<HTMLTextAreaElement>document.getElementById('textoPersonalizado')).value = this._textoAlternativo;
                }
            }, 150)
        } else if (document.visibilityState === 'hidden') {
            console.log('entra al else')
        }
    }

    atras() {
        this.router.navigate(['reportes/listar'])
    }

    colocaCerosAlNumeroEntero(consecutivo: number): string {
        const numeroConsecutivo: number = consecutivo;
        let numeroConFormato: string = '';

        switch (numeroConsecutivo.toString().length) {
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

    guardar() {
        const parametros: iParametrosReporteEncuesta = {
            consecutivo: this._consecutivoDeDescarga,
            textoAlternativoReporte: (<HTMLTextAreaElement>document.getElementById('textoPersonalizado')).value
        }

        this.servicioPersonalizacion.actualizaParametrosReporte(parametros).subscribe({
            next: resultado => {
                if (resultado.valor == "1") {
                    Swal.fire({
                        icon: "success",
                        title: "Actualizado"
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se puedo actualizar."
                    });
                }

            },
            error: err => console.error(err)
        })
    }

    actualiza() {
        const parametros: iParametrosReporteEncuesta = {
            consecutivo: this._consecutivoDeDescarga,
            textoAlternativoReporte: (<HTMLTextAreaElement>document.getElementById('textoPersonalizado')).value
        }

        this.servicioPersonalizacion.actualizaParametrosReporte(parametros).subscribe({
            next: resultado => console.log(resultado),
            error: err => console.error(err)
        })
    }

    contenidoDelTextArea() {
        this._desHabilitarSalvar = false;
    }

    cuandoTextAreaCambia() {
        this.contenidoDelTextArea();
    }

    ngAfterViewInit() {
        this.iniciarBusquedaDeSombras();
    }

    iniciarBusquedaDeSombras() {
        setTimeout(() => {
            this.encuentraElementosConSombra();
        }, 150);
    }

    encuentraElementosConSombra() {
        const allElements = document.querySelectorAll('*');
        this.elementosConSombra = [];
        this.sombras.clear();

        allElements.forEach(element => {
            if (element instanceof HTMLElement) {
                const styles = window.getComputedStyle(element);
                const boxShadow = styles.boxShadow;

                if (boxShadow && boxShadow !== 'none') {
                    this.elementosConSombra.push(element);
                    this.sombras.set(element, boxShadow);
                }
            }
        });
    }

    quitaBoxShadows() {
        this.elementosConSombra.forEach(element => {
            const originalShadow = this.sombras.get(element);

            if (originalShadow) {
                element.style.setProperty('box-shadow', 'none', 'important');
                element.style.setProperty('-webkit-box-shadow', 'none', 'important');
                element.style.setProperty('-moz-box-shadow', 'none', 'important');
            }
        });
    }

    restoreBoxShadows() {
        this.elementosConSombra.forEach(elemento => {
            const originalShadow = this.sombras.get(elemento);
            if (originalShadow) {
                elemento.style.removeProperty('box-shadow');
                elemento.style.removeProperty('-webkit-box-shadow');
                elemento.style.removeProperty('-moz-box-shadow');
            }
        });
    }
}