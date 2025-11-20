import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { ProyectoServicio } from "../servicio/proyecto.servicio";
import { Observable, Subject } from "rxjs";
import { iArchivoDeProyecto, iEstadoProyecto, iProyecto } from "../interfaces/iProyecto";
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { environment } from "../../../../../environments/environment";
import { CotizacionServicio } from "../../cotizaciones/servicio/cotizacion.servicio";
import { iCotizacion } from "../../cotizaciones/interfaces/iCotizacion";

interface UploadEvent {
    originalEvent: Event;
    files: File[];
}

@Component({
    selector: 'proyecto-listar',
    templateUrl: 'proyecto.listar.html',
    styleUrl: 'proyecto.listar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, PdfViewerModule],
    providers: [MessageService]
})

export class ListarProyectos implements OnInit {
    private srv = inject(ProyectoServicio);
    private servicioCotizacion = inject(CotizacionServicio);
    private _cotizaciones!: Observable<iCotizacion[]>;

    _proyecto$!: Observable<iProyecto[]>;
    
    columnas: any[] = [];
    
    _subirExpediente: boolean = false;
    _expediente: any[] = [];
    _urlDelPDF!: string;
    _vistaPrevia: boolean = false;
    _desHabilitarAplicar : boolean = true;

    private periodo! : string;
    private numeroProyecto! : number;
    private archivoConError : boolean = false;

    uploadedFiles: any[] = [];

    _esAsistenteDDC : boolean = false;

    constructor(private router: Router, private ref : ChangeDetectorRef, private servicioMensaje : MessageService) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idPerfil : number = valorSesion.idPerfil;
        if(idPerfil == 4) this._esAsistenteDDC = true;
        
        this.traeTodosProyectos(idPerfil);
        this.traeTodasCotizaciones();
    }

    onUpload(event : any) {
        for(let file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.servicioMensaje.add({severity: 'info', summary: 'File Uploaded', detail: ''});
    }

    traeTodosProyectos(idPerfil : number) {
        this.validaCantidadProyectos(idPerfil);
        this._proyecto$ = this.srv.traeTodosProyectos();

        this.columnas = [
            { campo: 'idProyecto', encabezado: 'ID' },
            { campo: 'proyecto', encabezado: 'Proyecto' },
            { campo: 'descripcionProyecto', encabezado: 'Descripción' },
            { campo: 'ubicacionGeografica', encabezado: 'Ubicación' }
        ];
    }

    validaCantidadProyectos(idPerfil : number){
        this.srv.traeTodosProyectos().subscribe({
            next : (listadoProyectos) => {
                if(listadoProyectos.length == 0) {
                    if(idPerfil == 1) {
                        this.router.navigate(['proyecto/agregar']);
                    } else {
                        this.router.navigate(['dashboard']);
                    }
                }
            }
        })
    }

    traeTodasCotizaciones() {
        this._cotizaciones = this.servicioCotizacion.traeTodasCotizaciones();
    }

    agregarProyecto() {
        this.router.navigate(['proyecto/agregar'])
    }

    editarProyecto(idProyecto: number) {
        this.router.navigate(['proyecto/editar', idProyecto])
    }

    abrirDialogoFirma(idProyecto : number) {
        Swal.fire({
            icon: "warning",
            title: "Importante",
            text: "Únicamente se puede cargar un archivo de proyecto."
        }).then(() => {
            const hoy : Date = new Date();
            this.periodo = String(hoy.getFullYear());
            this.numeroProyecto = idProyecto;
    
            this._subirExpediente = true;
            this.ref.detectChanges();
        });
    }

    cargarExpediente(evento: any, archivo: any) {
        this.archivoConError = false;
        if(evento.files[0].size <= 100000) {
            this.archivoConError = true;
            this.servicioMensaje.add({severity: 'error', summary: 'No se puede incluir este documento porque no tiene el tamaño mínimo permitido.'});
            return;
        }

        for (let archivo of evento.files) {
            this._expediente.push(archivo);
        }

        archivo.clear();

        this.srv.traeRutaDescargaProyecto(this.numeroProyecto).subscribe({
            next : (ruta) => {
                if(ruta.length == 1) {
                    this._subirExpediente = false;
                    this.ref.detectChanges();
                    Swal.fire({
                        title: "¿Este proyecto ya cuenta con un expediente, desea reemplazarlo?",
                        showDenyButton: true,
                        confirmButtonText: "Confirmo",
                        denyButtonText: "No"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.subirExpediente();
                        } else {
                            this._subirExpediente = true;
                            this.ref.detectChanges();
                        }
                    }); 
                } else {
                    this.subirExpediente();
                }
            }
        })
    }

    subirExpediente() {
        const valorSesion: iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);

        this._expediente.forEach(archivo => {
            const expediente : iArchivoDeProyecto = {
                archivo: archivo,
                proyecto: `DDC-PR-${this.colocaCerosAlNumeroEntero(this.numeroProyecto)}-${this.periodo}`,
                idProyecto : this.numeroProyecto,
                idFuncionario: valorSesion.idUsuario,
                extension: '.pdf'
            }

            this.srv.subeExpedienteProyecto(expediente).subscribe({
                next: (resultado) => {
                    if (resultado.valor == '1') {
                        this.servicioMensaje.add({severity: 'info', summary: 'Archivos cargados exitosamente.'});

                        Swal.fire({
                            title: "¡Gracias! Archivo subido exitosamente.",
                            icon: "success"
                        }).then(() => {
                            location.reload();
                        });
                    }
                },
                error: (err) => console.error(err)
            });
        })
    }

    cierraMensaje() {
        if(!this.archivoConError) {
            location.reload();
        }
    }

    cancelar() {
        this._subirExpediente = false;
    }

    vistaPreviaExpediente(idProyecto : number) {
        this.srv.traeRutaDescargaProyecto(idProyecto).subscribe({
            next : (ruta) => {
                if(ruta.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se tiene vista previa de este expediente."
                    });
                } else {
                    this._urlDelPDF = environment.docspathPreview + ruta[0].ruta;
                    this._vistaPrevia = true;
                    
                    this.ref.detectChanges();
                }
            },
            error : (err) => console.error(err)
        })
    }

    cancelarVistaPrevia() {
        this._vistaPrevia = false;
    }

    deshabilitarProyecto(idProyecto : number) {
        Swal.fire({
            title: "¿Desea inactivar este proyecto?",
            showDenyButton: true,
            confirmButtonText: "Aplicar",
            denyButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {

                const estadoProyecto : iEstadoProyecto = {
                    idFuncionario : 0,
                    idProyecto : idProyecto,
                    indicadorEstado : 'I'
                };
        
                this.srv.actualizaEstadoProyecto(estadoProyecto).subscribe({
                    next : (resultado) => {
                        if (resultado.valor == '1') {
                            Swal.fire("Inactivado", "", "success").then(() => {
                                location.reload();
                            });
                        }
                        else if (resultado.valor == '2') {
                            Swal.fire("Oops", "El proyecto tiene un inventario asignado y no se puede deshabilitar.", "error").then(() => {
                                location.reload();
                            });
                        } else {
                            console.log(resultado)
                        }
                    },
                    error : (err) => console.error(err)
                });
            }
        });        
    }

    habilitarProyecto(idProyecto: number) {
        Swal.fire({
            title: "¿Desea activar este proyecto?",
            showDenyButton: true,
            confirmButtonText: "Aplicar",
            denyButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {

                const estadoProyecto: iEstadoProyecto = {
                    idFuncionario: 0,
                    idProyecto: idProyecto,
                    indicadorEstado: 'A'
                };

                this.srv.actualizaEstadoProyecto(estadoProyecto).subscribe({
                    next: (resultado) => {
                        if (resultado.valor == '1') {
                            Swal.fire("Activado", "", "success").then(() => {
                                location.reload();
                            });
                        }
                        else console.log(resultado)
                    },
                    error: (err) => console.error(err)
                });
            }
        });
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
        }

        return numeroConFormato;
    }

}