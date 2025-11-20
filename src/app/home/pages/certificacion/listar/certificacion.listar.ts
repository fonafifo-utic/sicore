import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FileUploadModule } from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { Observable } from "rxjs";
import { iCertificado, iOpcionesParaAccion, iOpcionesParaEnviarCertificado, iSubirCertificadoFirmado } from "../interfaces/iCertificacion";
import { CertificacionServicio } from "../servicio/certificacion.servicio";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import { CotizacionServicio } from "../../cotizaciones/servicio/cotizacion.servicio";
import { environment } from "../../../../../environments/environment";
import { MessageService } from "primeng/api";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import Swal from "sweetalert2";
import { ClienteServicio } from "../../clientes/servicio/cliente.servicio";
import { FormalizacionServicio } from "../../formalizacion/servicio/formalizacion.servicio";
import { PdfOcrServicio } from "../servicio/pdf-ocr-servicio";
import { PDFDocument } from 'pdf-lib';


@Component({
    selector : 'listar-certificado',
    templateUrl : 'certificacion.listar.html',
    styleUrl : 'certificacion.listar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule, FileUploadModule, ToastModule, PdfViewerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})

export class ListarCertificados implements OnInit {

    private srv = inject(CertificacionServicio);
    private servicioCotizacion = inject(CotizacionServicio);
    private servicioFormalizacion = inject(FormalizacionServicio);
    private servicioCliente = inject(ClienteServicio);

    _cetificados$! : Observable<iCertificado[]>;
    _columnas : any[] = [];
    _opciones! : iOpcionesParaAccion[];
    _subirCertificado : boolean = false;
    _certificadoFirmado : any [] = [];
    _consecutivo! : number;
    _consecutivoDelCertificado! : number;
    _idCertificado! : number;
    _urlDelPDF! : string;
    _vistaPreviaCertificado : boolean = false;
    idCotizacion : number = 0;
    idCliente : number = 0;
    _anno : number = 0;
    _verMensajeNoCertificados : boolean = false;
    _esAsistenteDDC : boolean = false;
    textoExtraido! : string;
    numeroIdentificacionUnico! : string;
    
    private idPerfil! : number;

    constructor (private router : Router, private ref : ChangeDetectorRef, private servicioMensaje : MessageService, private servicioPdfOcr: PdfOcrServicio) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        this.idPerfil = perfil;

        if(perfil == 4) this._esAsistenteDDC = true;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 5) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado']);
    }

    ngOnInit(): void {
        this.traeFormalizaciones(this.idPerfil);
    }

    traeFormalizaciones(idPerfil : number) {
        this.servicioFormalizacion.obtenerListadoFormalizacion().subscribe({
            next : formalizaciones => {
                if(formalizaciones.length === 0) {
                    if(idPerfil === 5) {
                        this._verMensajeNoCertificados = true;
                        this.ref.detectChanges();
                    } else {
                        Swal.fire('SICORE','No se puede mostrar los certificados sin formalizaciones previas.','warning').then(()=>{
                            this.router.navigate(['formalizacion/listar'])
                        });
                    }
                } else {
                    this.condicionesIniciales();
                }
            }
        })
    }

    condicionesIniciales() {
        const hoy : Date = new Date();
        this._anno = hoy.getFullYear();

        this.traeCertificados();

        this._opciones = [
            { claveOpcion : '1', opcion : 'Ver' },
            { claveOpcion : '2', opcion : 'Editar' }
        ];
    }

    traeCertificados(){
        if(this.idPerfil == 5) this._cetificados$ = this.srv.listarCertificadosAprobados();
        else this._cetificados$ = this.srv.listarCertificado();

        this.ref.detectChanges();
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    creaNumeroCertificado(numeroCertificado : number, annoInventarioGEI : number) : string {
        return `${annoInventarioGEI.toString()}-${this.colocaCerosAlNumeroEntero(numeroCertificado)}` 
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

    _colocaCerosAlNumeroEntero(numero: number, idCertificado : string): string {
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

        if(!idCertificado.toString().includes(',')) nomenclatura = prefijoCotizacion + numeroConFormato + this._anno;
        else nomenclatura = prefijoAgrupacion + numeroConFormato + this._anno;

        return nomenclatura;
    }

    esParaVerCertificado() {
        if(this._esAsistenteDDC) return false;
        else return true;
    }

    irToVer(idCertificado : string) {
        const cadenaParametroInterno : string = String(idCertificado) + '0';

        this.router.navigate(['certificados/ver', cadenaParametroInterno])
    }

    enviarEncuesta(idCotizacion : number) {
        this.servicioCotizacion.traeCotizacionPorId(idCotizacion).subscribe({
            next : (cotizacion) => {
                const idCliente : string = cotizacion[0].idCliente.toString();
                const parametro : string = window.btoa(idCliente);
                const urlDeEncuesta : string = environment.baseUrlEncuesta + parametro;
            },
            error : (err) => console.error(err)
        })
    }

    abrirDialogoFirma(consecutivo : number, idCertificado : number, numeroCertificado : number, numeroIdentificacionUnico : string) {
        console.log(numeroIdentificacionUnico)

        this._consecutivo = consecutivo;
        this._consecutivoDelCertificado = numeroCertificado;
        this._idCertificado = idCertificado;
        this._subirCertificado = true;

        this.numeroIdentificacionUnico = numeroIdentificacionUnico;
    }

    esParaVerSubirFirmado(certificado : iCertificado) {
        if(this._esAsistenteDDC) return;

        if(certificado.indicadorEstado == 'Pendiente Validación') return;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        if(valorSesion.idPerfil == 2) return;

        return (certificado.nombreArchivo.length == 0)
    }

    subirFirmado(evento : any, archivo : any) {
        archivo.clear()
        this.leerCertificado(evento.files[0]);
    }

    leerCertificado(file : any) {
        if (file) {

            this._subirCertificado = false;

            Swal.fire('Validando Certificado');
            Swal.showLoading();

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64DelPDF = (reader.result as string).split(',')[1];
                this.textoExtraido = await this.servicioPdfOcr.extraeTextoConOcr(base64DelPDF);

                const porcentajeDeSimilitud = this.sacaElPorcentajeDeSimilitud(this.textoExtraido.toString().slice(-37), this.numeroIdentificacionUnico);

                if(porcentajeDeSimilitud >= 85) this.subirCertificadoFirmado(file);
                else {
                    Swal.hideLoading();
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Parece que el certificado no tiene la numeración válida.",
                    });
                }
                
            };
        }
    }

    sacaElPorcentajeDeSimilitud(textoExtraido : string, numeroIdentificacionUnico : string): number {

        const distanciaEntreElementos = this.matrizParaDeterminarDistancia(textoExtraido, numeroIdentificacionUnico);
        const longitudMaxima = Math.max(textoExtraido.length, numeroIdentificacionUnico.length);

        const porcentajeDeSimilitud = (1 - distanciaEntreElementos / longitudMaxima) * 100;

        return Math.max(0, porcentajeDeSimilitud);
    }

    matrizParaDeterminarDistancia(textoExtraido : string, numeroIdentificacionUnico : string) {
        console.log(textoExtraido)
        console.log(numeroIdentificacionUnico)

        const matrizCompleta : number [][] = [];
        const longitudTextoExtraido : number = textoExtraido.length;
        const longitudNumIdUnico : number = numeroIdentificacionUnico.length;

        for(let iNumIdUnico = 0; iNumIdUnico <= numeroIdentificacionUnico.length; iNumIdUnico++) {
            matrizCompleta [iNumIdUnico] = [iNumIdUnico];
        }

        for(let iNumTextExt = 0; iNumTextExt <= textoExtraido.length; iNumTextExt++) {
            matrizCompleta [0][iNumTextExt] = iNumTextExt;
        }

        for(let ejeX = 1; ejeX <= numeroIdentificacionUnico.length; ejeX++) {
            for(let ejeY = 1; ejeY <= textoExtraido.length; ejeY++) {
                if(numeroIdentificacionUnico.charAt(ejeX - 1) === textoExtraido.charAt(ejeY - 1)) {
                    matrizCompleta[ejeX][ejeY] = matrizCompleta[ejeX - 1][ejeY - 1];
                } else {
                    matrizCompleta[ejeX][ejeY] = Math.min(matrizCompleta[ejeX - 1][ejeY - 1] + 1, matrizCompleta[ejeX][ejeY - 1] + 1, matrizCompleta[ejeX - 1][ejeY] + 1)
                }
            }
        }

        return matrizCompleta[longitudNumIdUnico][longitudTextoExtraido];
    }

    subirCertificadoFirmado(certificado : any) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();
        
        const expediente : iSubirCertificadoFirmado = {
            archivo : certificado,
            cotizacion : this.creaNumeroCertificado(this._consecutivoDelCertificado, anno),
            idCertificado : this._idCertificado,
            idFuncionario : valorSesion.idUsuario,
            extension : 'pdf'
        }

        this.srv.subeCertificadoFirmado(expediente).subscribe({
            next : (resultado) => {
                if (resultado.valor == '1') {
                    Swal.hideLoading();
                    if (resultado.valor == '1') {
                        this._subirCertificado = false;
                        this.servicioMensaje.add({severity: 'info', summary: 'Certificado cargado exitosamente.'});

                        Swal.fire({
                            title: "¡Gracias! El Certificado ha sido subido exitosamente.",
                            icon: "success"}).then(() => {
                                location.reload();
                        });

                    } else {
                        console.log(resultado);
                    }
                } else if (resultado.valor == '-3') {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Parece que el certificado no está firmado.",
                    });
                }
            },
            error : (err) => console.error(err)
        });
    }

    enviarCertificado(idCertificado : number, idCotizacion : number, consecutivo : number, idCliente : number, consecutivoCertificado : number) {
        this.srv.traeRutaDescargaCertificado(idCertificado).subscribe({
            next : (ruta) => {
                if(ruta.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se tiene vista previa de este Certificado."
                    });
                } else {
                    this._urlDelPDF = environment.docspathPreview + ruta[0].ruta;
                    this.idCotizacion = idCotizacion;
                    this.idCliente = idCliente;
                    this._consecutivo = consecutivo;
                    this._consecutivoDelCertificado = consecutivoCertificado; 
                    this._vistaPreviaCertificado = true;
    
                    this.ref.detectChanges();
                }
            },
            error : (err) => console.error(err)
        })
    }

    enviarCertificadoFirmado() {
        const hoy : Date = new Date();
        const anno : number = hoy.getFullYear();

        const numeroCertificado : string = `${anno}-${this.colocaCerosAlNumeroEntero(this._consecutivoDelCertificado)}`;
        let emailClienteElegido : string = '';
        
        this.servicioCliente.traeClientePorId(this.idCliente).subscribe({
            next : (cliente) => {
                emailClienteElegido = cliente[0].emailCliente;
            }
        })

        this._vistaPreviaCertificado = false;

        Swal.fire({
            title: `Va a enviar por correo el certificado número: ${numeroCertificado} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
        }).then((confirmacion) => {
            if (confirmacion.isConfirmed) {
                Swal.fire({
                    title: 'Destinatario:',
                    text: "Puede disponer de varios correos electrónicos, separados por punto y coma (;), sin espacios.",
                    input: 'text',
                    inputValue : emailClienteElegido,
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

                        Swal.fire({
                            title: 'Encuesta:',
                            text: "¿Desea enviar también la encuesta de satisfacción?",
                            showCancelButton: true,
                            cancelButtonText : 'NO'
                        }).then((eventoEnvioEncuesta) => {
                            let enviarTambienEncuesta : boolean = false;

                            if(eventoEnvioEncuesta.isConfirmed) {
                                enviarTambienEncuesta = true;
                            }

                            const parametro : string = window.btoa(this.idCliente.toString());
                            const urlDeEncuesta : string = `${environment.baseUrlEncuesta}${parametro}`;
                            const idFuncionario : number = valorSesion.idUsuario;

                            console.log(urlDeEncuesta)

                            const opcionesEnvio : iOpcionesParaEnviarCertificado = {    
                                asunto : '',
                                destinatario : eventoEnvio.value,
                                enlace : '',
                                enlaceEncuesta : urlDeEncuesta,
                                idCotizacion : this.idCotizacion,
                                idFuncionario : idFuncionario,
                                numeroCertificado : numeroCertificado,
                                enviaEncuesta : enviarTambienEncuesta
                            }

                            // this.srv.enviaUnCertificadoFirmado(opcionesEnvio).subscribe({
                            //     next : (respuesta) => {

                            //         if(respuesta.valor == '1') {
                            //             Swal.fire('SICORE', 'El Certificado fue enviado con exito.', 'success').then(()=>{
                            //                 location.reload();
                            //             });
                            //         } else {
                            //             console.log(respuesta.descripcion);
                            //         }

                            //     },
                            //     error : (err) => console.error(err)
                            // });
                        })

                    }
                })
            }
        });

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
       
    }

    cancelar() {
        this._subirCertificado = false;
    }

    cierraMensaje() {
        location.reload();
    }

    cancelarVistaPrevia() {
        this._vistaPreviaCertificado = false;
    }

    descargarCertificadoFirmado(idCertificado : number) {
        this.srv.traeRutaDescargaCertificado(idCertificado).subscribe({
            next : (ruta) => {
                if(ruta.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se tiene vista previa de este Certificado."
                    });
                } else {
                    this._urlDelPDF = environment.docspathPreview + ruta[0].ruta;
                    window.open(this._urlDelPDF, '_blank');
                }
            },
            error : (err) => console.error(err)
        })
    }

    esParaVerEnviar(certificado : iCertificado) {
        if(this._esAsistenteDDC) return;

        return (certificado.nombreArchivo.length > 0)
    }

    esParaVerDescargar(certificado : iCertificado) : boolean {
        if(this._esAsistenteDDC) return true;
        else return (certificado.nombreArchivo.length > 0)
    }

    determinaColorDeEstado(indicadorEstado : string) : any {
        let colorDeEstado : any;

        switch(indicadorEstado){
            case 'Activo':
                colorDeEstado = { background : '#15803D' };
                break;

            case 'Enviado':
                colorDeEstado = { background : '#61AFFE' };
                break;

            case 'Pendiente Validación':
                colorDeEstado = { background : '#0378B0' };
                break;
        }

        return colorDeEstado;
    }
}