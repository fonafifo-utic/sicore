import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { MenuItem } from "primeng/api";
import { PanelMenuModule } from 'primeng/panelmenu';
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector: 'reportes-listar',
    templateUrl: 'reportes.listar.html',
    styleUrl: 'reportes.listar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule, PanelMenuModule],
})

export class ListarReportes implements OnInit {

    panelMenuItems: MenuItem[] = [];
    _mostrarReporte : boolean = false;
    _mostrarReportePorPermisoEspecial : boolean = false;
    private perfilesQueNoTienenPermiso : number[] = [3,4,5];

    constructor(private router: Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        if ((perfil !== 1) &&
            (perfil !== 2) &&
            (perfil !== 3) &&
            (perfil !== 4) &&
            (perfil !== 5) &&
            (perfil !== 6) &&
            (perfil !== 7) &&
            (perfil !== 8) &&
            (perfil !== 9) &&
            (perfil !== 10))
            this.router.navigate(['no-encontrado']);

        const tienePermisosParaReportes : boolean = (this.perfilesQueNoTienenPermiso.includes(perfil))
        if(!tienePermisosParaReportes) {
            this._mostrarReporte = true;
            if(perfil == 2) {
                this._mostrarReporte = false;
                if(valorSesion.idUsuario == 77383) this._mostrarReportePorPermisoEspecial = true;
            }
        }
    }

    ngOnInit(): void {
        this.panelMenuItems = [
            {
                label: 'Cotizaciones',
                items: [
                    {
                        label: 'Listado de Cotizaciones',
                        icon: 'pi pi-fw pi-list-check',
                        command: () => {
                            this.router.navigate(['reportes/cotizacion/listado-mensual'])
                        }
                    }
                ]
            },
            {
                label: 'Certificados',
                items: [
                    {
                        label: 'Listado de Certificados',
                        icon: 'pi pi-fw pi-list-check',
                        command: () => {
                            this.router.navigate(['reportes/certificado/listado-mensual'])
                        }
                    }
                ]
            },
            {
                label: 'Formalizaciones',
                items: [
                    {
                        label: 'Listado de Formalizaciones',
                        icon: 'pi pi-fw pi-list-check',
                        command: () => {
                            this.router.navigate(['reportes/formalizacion/listado-mensual'])
                        }
                    }
                ]
            },
            {
                label: 'Ventas',
                items: [
                    {
                        label: 'Listado de Ventas',
                        icon: 'pi pi-fw pi-list-check',
                        command: () => {
                            this.router.navigate(['reportes/ventas/listado-mensual'])
                        }
                    }
                ]
            }
        ];
    }

    generarReporteCotizaciones() {
        this.router.navigate(['reportes/cotizacion/listado-mensual'])
    }

    generarReporteFormalizaciones() {
        this.router.navigate(['reportes/formalizacion/listado-mensual'])
    }

    generarReporteCertificados() {
        this.router.navigate(['reportes/certificado/listado-mensual'])
    }

    generarReporteVentas() {
        this.router.navigate(['reportes/ventas/listado-mensual'])
    }

    generarReporteEsfuerzo() {
        this.router.navigate(['reportes/ventas/listado-esfuerzo'])
    }

    generarReporteEncuesta() {
        this.router.navigate(['reportes/encuesta/encuesta-listado'])
    }

    generarReporteEncuestaRespuestasPorAnno() {
        this.router.navigate(['reportes/encuesta/encuesta-respuestas-poranno'])
    }

    
}