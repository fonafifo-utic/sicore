import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { iEncuestaEnviada, iRespuestaEncuestaEnviada } from "../../interfaces/iEncuesta";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { environment } from "../../../../../../environments/environment";
import { iLoginSalida } from "../../../../../auth/login/ilogin";
import { iOpcionesParaEnviarCertificado } from "../../../certificacion/interfaces/iCertificacion";

@Component({
    selector: 'encuesta-enviada',
    templateUrl: 'encuesta.enviada.html',
    styleUrl: 'encuesta.enviada.css',
    imports: [PrimeNgModule, CommonModule],
    standalone: true
})

export class EncuestasEnviadas implements OnInit {

    private srv = inject(EncuestaServicio);
    _enviadas$!: Observable<iEncuestaEnviada[]>
    _respuesta$!: Observable<iRespuestaEncuestaEnviada[]>
    _columnas: any[] = [];
    _columnasRespuesta: any[] = [];
    listado!: iEncuestaEnviada[];
    _cliente!: string;
    idLineaTocadaAnterior : number = 0;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.traeListado();
    }

    traeListado() {
        this._columnas = [
            { campo: 'nombreCliente', encabezado: 'Cliente' },
            { campo: 'numeroCertificado', encabezado: 'Certificado' },
            { campo: 'usuario', encabezado: 'Funcionario' },
            { campo: 'fechaHoraEnvio', encabezado: 'Fecha' },
            { campo: 'estado', encabezado: 'Estado' }
        ];

        this._enviadas$ = this.srv.obtenerListadoEnviadas();
    }

    filtroGlobal(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    filtroGlobalRespuesta(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    creaNumeroCertificado(numeroCertificado: number): string {
        const hoy: Date = new Date();
        const anno: string = hoy.getFullYear().toString();

        return `${anno}-${this.colocaCerosAlNumeroEntero(numeroCertificado)}`
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

    esRating(item: iRespuestaEncuestaEnviada): boolean {
        if (!isNaN(Number(item.respuesta))) return true;
        else return false;
    }

    verRespuesta(idCliente: number, nombreCliente: string, numeroCertificado : string) {
        if(this.idLineaTocadaAnterior != 0) {
            const lineaRegistroTocadaAnterior : HTMLElement = document.getElementById(this.idLineaTocadaAnterior.toString())!;
            lineaRegistroTocadaAnterior.classList.remove('flote');
        }
        
        const lineaRegistroTocado :  HTMLElement = document.getElementById(numeroCertificado)!;
        lineaRegistroTocado?.classList.add('flote');

        this._cliente = nombreCliente;
        this._respuesta$ = this.srv.obtieneRespuestaEncuestaPorIdCliente(idCliente);
        this.idLineaTocadaAnterior = Number(numeroCertificado);
    }

    verReenviar(estado: string) {
        return (estado == 'Pendiente')
    }

    verLaRespuesta(estado: string) {
        return (estado == 'Respondida')
    }

    muestraEstado(estado : string, fechaHoraEnvio : string, conteoEnvios : number) : any {
        const mesEnvio : number = new Date(fechaHoraEnvio).getMonth();
        const mesActual : number = new Date().getMonth();

        if(estado == 'Pendiente') {
            if (conteoEnvios > 1) {
                estado = 'Re-Enviada' 
            } else if(mesEnvio < mesActual) {
                const cantidadDiferencia : number = mesActual - mesEnvio;

                if(cantidadDiferencia >= 2) {
                    estado = 'Sin Respuesta';
                }
            }
        }
        
        return estado;
    }

    muestraColorEstado(fechaHoraEnvio : string, estado : string, conteoEnvios : number) : any {
        let colorDeEstado;

        const mesEnvio : number = new Date(fechaHoraEnvio).getMonth();
        const mesActual : number = new Date().getMonth();

        const encuestaRespondida : any = { background : '#15803D' };
        const encuestaPendienteDeContestar : any = { background : '#0378B0' };
        const encuestaReenviada : any = { background : '#D32F2F' };

        if(estado == 'Pendiente') {
            if (conteoEnvios > 1) {
                colorDeEstado = encuestaReenviada;
            } else if(mesEnvio < mesActual) {
                const cantidadDiferencia : number = mesActual - mesEnvio;
                if(cantidadDiferencia >= 2) {                    
                    colorDeEstado = encuestaReenviada;
                } else {
                    colorDeEstado = encuestaPendienteDeContestar;    
                }
            } else {
                colorDeEstado = encuestaPendienteDeContestar;
            }
        } else {
            colorDeEstado = encuestaRespondida
        }
        
        return colorDeEstado;
    }

    enviarEncuesta(encuesta : iEncuestaEnviada) {
        Swal.fire({
            title: `Va a re-enviar al cliente ${encuesta.nombreCliente} la encuesta. ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if (confirmacion.isConfirmed) {
                Swal.fire({
                    title: 'Destinatario:',
                    text: "Puede disponer de varios correos electrónicos, separados por punto y coma (;), sin espacios.",
                    input: 'text',
                    inputValue: encuesta.emailCliente.toLowerCase(),
                    showCancelButton: true,
                    inputValidator: (email) => {
                        let emailInvalido: number = 0;
                        let respuesta: boolean = true;

                        if (email.includes(';')) {
                            email.split(';').forEach(item => {
                                const esEmailValido = item.match(/^(([^<>()[\]\\.,;:/\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                                if (!esEmailValido) emailInvalido += 1
                            })
                        } else {
                            const esEmailValido = email.match(/^(([^<>()[\]\\.,;:/\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                            if (!esEmailValido) emailInvalido += 1
                        }

                        if (emailInvalido > 0) respuesta = false;

                        return !respuesta && 'Debe ser un correo electrónico válido.'
                    }
                }).then((eventoEnvio) => {
                    if (eventoEnvio.isConfirmed) {
                        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
                        const parametro: string = window.btoa(encuesta.idCliente.toString());
                        const urlDeEncuesta: string = `${environment.baseUrlEncuesta}${parametro}`;
                        const idFuncionario: number = valorSesion.idUsuario;

                        const opcionesEnvio: iOpcionesParaEnviarCertificado = {
                            asunto: '',
                            destinatario: eventoEnvio.value,
                            enlace: '',
                            enlaceEncuesta: urlDeEncuesta,
                            idCotizacion: encuesta.idCotizacion,
                            idFuncionario: idFuncionario,
                            numeroCertificado: String(encuesta.numeroCertificado),
                            enviaEncuesta : true
                        }

                        this.srv.reEnviaEncuesta(opcionesEnvio).subscribe({
                            next: (respuesta) => {

                                if (respuesta.valor == '1') {
                                    Swal.fire('SICORE', 'Encuesta enviada con exito.', 'success').then(() => {
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

    irToEncuesta() {
        this.router.navigate(['encuesta/listar']);
    }

    irToPreguntas() {
        this.router.navigate(['encuesta/preguntas/listar']);
    }

    irToDashboard() {
        this.router.navigate(['encuesta/dashboard']);
    }

}