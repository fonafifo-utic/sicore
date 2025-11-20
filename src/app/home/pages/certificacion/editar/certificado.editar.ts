import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { iPoneObservacionesAlCertificado, iVistaCertificado } from "../interfaces/iCertificacion";
import { CertificacionServicio } from "../servicio/certificacion.servicio";
import Swal from "sweetalert2";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'editar-certificado',
    templateUrl: 'certificado.editar.html',
    styleUrl: 'certificado.editar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditarCertificado implements OnInit {

    _esAsistenteDDC: boolean = false;

    _nombreRequerido: boolean = false;
    _caracteresMinimosMaximos: boolean = false;
    _cedulaRequerida: boolean = false;
    _transferenciaRequerida: boolean = false;
    _justificacionRequerida: boolean = false;

    _idCertificado!: string;
    idFuncionario!: number;

    _cedulaJuridica : string = '';
    _nombreCertificado : string = '';
    _numeroTransferencia!: string;

    _activaObservaciones: boolean = false;
    _enIngles: boolean = false;

    constructor(private srv: CertificacionServicio, private route: ActivatedRoute, private router: Router) {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        this.idFuncionario = valorSesion.idUsuario;
        const perfil: number = valorSesion.idPerfil;

        if ((perfil !== 1) && (perfil !== 2) && (perfil !== 5) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])

        if (perfil == 4) this._esAsistenteDDC = true;
    }

    ngOnInit(): void {
        if (this.srv.getTerminaEdicionCertificado() == undefined) {
            this.router.navigate(['no-encontrado']);
            return;
        } else {
            this._idCertificado = this.srv.getIdCertificado();
            this.traeCertificado();
        }
    }

    traeCertificado() {
        this.srv.obtieneCertificadoPorId(this._idCertificado).subscribe({
            next: (certificados) => {
                const certificado : iVistaCertificado[] = certificados;

                certificado.forEach(item => {
                    this.colocaElNombreCertificado(item.nombreCertificado);
                    this.colocaElNumeroCedula(item.cedulaJuridicaComprador);
                });

                (<HTMLInputElement>document.getElementById('nombreCertificado')).value = this._nombreCertificado;
                (<HTMLInputElement>document.getElementById('cedula')).value = this._cedulaJuridica;

                (<HTMLInputElement>document.getElementById('numeroTransferencia')).value = certificado[0].numeroTransferencia;

                if (certificado[0].observaciones.length > 0) {
                    (<HTMLTextAreaElement>document.getElementById('observacion')).value = certificado[0].observaciones;
                    this.srv.setLasObservaciones(certificado[0].observaciones);
                    this.srv.setMuestraObservaciones(true);
                } else {
                    (<HTMLTextAreaElement>document.getElementById('observacion')).value = '';
                    this.srv.setLasObservaciones('');
                    this.srv.setMuestraObservaciones(false);
                }

                if (certificado[0].enIngles == 'S') {
                    (<HTMLInputElement>document.getElementById('ckCotizacionEnIngles')).checked = true;
                    this.srv.setCertificadoEnIngles(true);

                } else {
                    (<HTMLInputElement>document.getElementById('ckCotizacionEnIngles')).checked = false;
                    this.srv.setCertificadoEnIngles(false);
                }
                
                if((certificado[0].cssCertificado != '') || (certificado[1].cssCertificado != '')) {
                    const pixelesDeLaFuente : string = String(certificado[0].cssCertificado.split(' ')[1].replace('px;', ''));
                    (<HTMLInputElement>document.getElementById('tituloSize')).value = pixelesDeLaFuente;
                    this.srv.setTamannoBarraTitulo(pixelesDeLaFuente);
                }

                if (certificado[0].anotaciones.length > 0) {
                    (<HTMLTextAreaElement>document.getElementById('justificacion')).value = certificado[0].justificacionEdicion;
                }

                this.srv.setTamannoBarraTitulo(certificado[0].cssCertificado);
            },
            error: (err) => console.error(err)
        })

    }

    colocaElNombreCertificado(nombre: string) {
        if(this._nombreCertificado.includes(nombre)) return;
        this._nombreCertificado = this._nombreCertificado + ', ' + nombre;
        this._nombreCertificado = this._nombreCertificado.replace(/^,/, '').trim();
    }

    colocaElNumeroCedula(cedula : string) {
        if(this._cedulaJuridica.includes(cedula)) return;
        this._cedulaJuridica = this._cedulaJuridica + ', ' + cedula;
        this._cedulaJuridica = this._cedulaJuridica.replace(/^,/, '').trim();
        
        if (this._cedulaJuridica.startsWith(',')) this._cedulaJuridica.slice(1).trim();
    }

    validaEspaciosBlancoAlInicio(expresion: any): boolean {
        const caracterDigitado: string = expresion.key;
        const palabraEscrita: string = (<HTMLInputElement>document.getElementById(expresion.target.id)).value;
        const caracterInicial: string = palabraEscrita.substring(0, 1);

        if (caracterInicial == caracterDigitado) {
            if (caracterDigitado == ' ') return false;
            else return true;
        }
        else return true;
    }

    entraNombre() {
        this._nombreRequerido = false;
        this._caracteresMinimosMaximos = false;
    }

    entraCedula() {
        this._cedulaRequerida = false;
    }

    entraNumeroTransferencia() {
        this._transferenciaRequerida = false;
    }

    entraJustificacion() {
        this._justificacionRequerida = false
    }

    esValidoElFormularioEdicion(cedula: string, nombreCertificado: string, numeroTransferencia: string, justificacionEdicion: string): boolean {
        if (nombreCertificado == '') {
            this._nombreRequerido = true;
            return false;
        }

        if (nombreCertificado.length < 3) {
            this._caracteresMinimosMaximos = true;
            return false;
        }

        if (nombreCertificado.length > 100) {
            this._caracteresMinimosMaximos = true;
            return false;
        }

        if (cedula == '') {
            this._cedulaRequerida = true;
            return false;
        }

        if (numeroTransferencia == '') {
            this._transferenciaRequerida = true;
            return false;
        }

        if (justificacionEdicion == '') {
            this._justificacionRequerida = true;
            return false;
        }
        return true;
    }

    aplicarCambiosEditar() {
        const cedula = (<HTMLInputElement>document.getElementById('cedula')).value;
        const nombreCertificado = (<HTMLInputElement>document.getElementById('nombreCertificado')).value;
        const numeroTransferencia = (<HTMLInputElement>document.getElementById('numeroTransferencia')).value;
        const justificacionEdicion = (<HTMLInputElement>document.getElementById('justificacion')).value;
        const observacion: string = (<HTMLTextAreaElement>document.getElementById('observacion')).value;

        if (!this.esValidoElFormularioEdicion(cedula, nombreCertificado, numeroTransferencia, justificacionEdicion)) return;

        const certificado: iPoneObservacionesAlCertificado = {
            observacion: observacion,
            idCertificado: this._idCertificado,
            idFuncionario: this.idFuncionario,
            cedulaJuridica: cedula,
            nombreCertificado: nombreCertificado,
            numeroTransferencia: numeroTransferencia,
            justificacionEdicion: justificacionEdicion,
            cssCertificado: this.srv.getTamannoBarraTitulo(),
            indicadorEstado: 'E',
            enIngles: this._enIngles ? 'S' : 'N'
        }

        this.srv.poneObservacionesAlCertificado(certificado).subscribe({
            next: respuesta => {
                if (respuesta.valor == '1') {
                    this.srv.setTerminaEdicionCertificado(false);
                    Swal.fire('SICORE', 'El registro se actualizó exitosamente.', 'success').then(() => {
                        location.reload();
                    })
                } else {
                    console.log(respuesta)
                }
            },
            error: err => console.error(err)
        })
    }

    selecccionaIdioma(evento: any) {
        if (evento.target.checked) {
            this.srv.setCertificadoEnIngles(true);
            this._enIngles = true;
        }
        else {
            this.srv.setCertificadoEnIngles(false);
            this._enIngles = false;
        }
    }

    cambiaTamannoTitulo(evento: any) {
        const fuente = `font-size: ${evento.target.value}px;`;
        
        this.srv.setTamannoBarraTitulo(fuente);
    }

    activaObservaciones(evento: any) {
        if (evento.target.checked) {
            this.srv.setMuestraObservaciones(true);
        }
        else {
            this.srv.setMuestraObservaciones(false);
        }
    }

    saleObservaciones() {
        const observacion: string = (<HTMLTextAreaElement>document.getElementById('observacion')).value;

        if (observacion.length > 0) {
            this.srv.setMuestraObservaciones(true);
            this.srv.setLasObservaciones(observacion);
        } else {
            this.srv.setMuestraObservaciones(false);
        };
    }
}