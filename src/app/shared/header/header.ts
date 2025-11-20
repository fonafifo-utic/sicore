import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { LayoutService } from "../../home/inicio.temp.service2";
import { MenuItem } from "primeng/api";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { PrimeNgModule } from "../prime-ng.module";
import { AuthService } from "../../services/auth.service";
import { iLoginSalida } from "../../auth/login/ilogin";
import { iMenuInicio } from "../menu/imenu";
import { ButtonModule } from 'primeng/button';
import { MenuModule } from "primeng/menu";
import { environment } from "../../../environments/environment";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import Swal from "sweetalert2";

interface isubMenu {
    label : string;
    icon : string;
    routerLink : any;
}

@Component({
    selector: 'header',
    templateUrl: 'header.html',
    styleUrl: 'encabezado.css',
    standalone: true,
    imports: [CommonModule, RouterModule, PrimeNgModule, ButtonModule, MenuModule, PdfViewerModule]
})

export class Header implements OnInit {

    menu: MenuItem[] = [];
    items: MenuItem[] | undefined;

    @ViewChild('searchinput') searchInput!: ElementRef;
    @ViewChild('menubutton') menuButton!: ElementRef;

    searchActive: boolean = false;

    nombreUsuario!: string;
    tipoUsuario!: string;
    idUsuario! : number;

    _mostrarManual : boolean = false;
    _urlDelPDF! : string;

    _desActivadoDFM : boolean = true;

    constructor(public layoutService: LayoutService, private servicio: AuthService, private route: Router) { }

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        this.nombreUsuario = this.daFormatoNombre(valorSesion.nombreCompleto);
        this.tipoUsuario = valorSesion.perfil;
        this.idUsuario = valorSesion.idUsuario;

        const token : string = sessionStorage.getItem('token')!;
        const opcionesInicio : iLoginSalida = JSON.parse(token);
        const menuCompleto : iMenuInicio [] = JSON.parse(opcionesInicio.menu.toString());
        let subMenu : isubMenu [] = [];

        menuCompleto.forEach(item => {
            subMenu.push({
                icon : item.icono,
                label : item.titulo,
                routerLink : item.rutaEnlace
            })
        })

        this.items = [
            {
                label: 'Menú',
                items: subMenu
            },
            {
                separator: true
            },
            {
                label: 'Perfil',
                items: [
                    {
                        label: 'Manual',
                        icon: 'pi pi-book',
                        command : () => this.descargarManual()
                    },
                    {
                        label: 'Salir',
                        icon: 'pi pi-power-off',
                        command : () => this.Logout()
                    }
                ]
            }
        ];

        this.obtieneSiEstaActivadoElDFM();
    }

    obtieneSiEstaActivadoElDFM() {
        this.servicio.obtenerConfirmacionDeActivacionDelDFM(this.idUsuario).subscribe({
            next : configurado => {
                if(configurado[0].claveSecretaMFA == 'null' || configurado[0].claveSecretaMFA == null) {
                    this._desActivadoDFM = false
                }
            },
            error : err => console.error(err)
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

    Logout() {
        this.servicio.DoLogout();
        this.route.navigate(['login']);
    }

    descargarManual() {
        this._mostrarManual = true;
        this._urlDelPDF = environment.enlaceParaManual;
        //window.open(environment.enlaceParaManual, '_blank');
    }

    desActivarDMF() {
        Swal.fire({
            title: "¿Desea desactivar el doble factor de autenticación?",
            showDenyButton: true,
            confirmButtonText: "Confirmo",
            denyButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {

                this.servicio.desactivarElDFM(this.idUsuario).subscribe({
                    next : respuesta => {
                        if(respuesta.success) {
                            this._desActivadoDFM = false;
                            Swal.fire(respuesta.mensaje, '', 'success').then(()=>{
                                location.reload();
                            })
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "No se pudo desactivar el doble factor de autenticación.",
                            });
                        }
                    },
                    error : err => console.error(err)
                });

            }
        });
    }

    itemClick(event: MouseEvent) {
        event.preventDefault();
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    removeTab(event: MouseEvent, item: MenuItem, index: number) {
        this.layoutService.onTabClose(item, index);
        event.preventDefault();
    }

    enrutaUsuario() {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        switch(perfil) {
            case 3:
                this.route.navigate(['formalizacion/listar']);
                break;

            case 5:
                this.route.navigate(['certificados/listar']);
                break;

            default:
                this.route.navigate(['dashboard']);
                break;
        }
        
    }

    //#region Desconocida

        activateSearch() {
            this.searchActive = true;
            setTimeout(() => {
                this.searchInput.nativeElement.focus();
            }, 100);
        }

        deactivateSearch() {
            this.searchActive = false;
        }

        get layoutTheme(): string {
            return this.layoutService.config().layoutTheme;
        }

        get colorScheme(): string {
            return this.layoutService.config().colorScheme;
        }

        get logo(): string {
            const path = 'assets/img/img_login.png';
            return path;
        }

        get tabs(): MenuItem[] {
            return this.layoutService.tabs;
        }
    //#endregion

}