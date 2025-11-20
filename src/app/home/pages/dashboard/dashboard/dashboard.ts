import { CommonModule } from "@angular/common";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { iLoginSalida, IUsuarioLogin } from "../../../../auth/login/ilogin";
import { DashboardServicio } from "../servicio/dashboard.servicio";
import { iProyectosDashboard, iResumenVentasDashboard, iResumenVentasPorMes } from "../interfaces/iDashboard";
import { Router } from "@angular/router";
import { ChartModule } from "primeng/chart";

@Component({
    templateUrl: 'dashboard.html',
    selector : 'dashboard',
    standalone : true,
    imports : [PrimeNgModule, CommonModule, ChartModule],
    styleUrl : 'dashboard.css'
})

export class Dashboard implements OnInit {
    nombreUsuario! : string;
    _proyectos! : iProyectosDashboard[];

    resumenInventarioPorProyecto$ = inject(DashboardServicio).traeResumenInventarioPorProyecto();
    proyectos$ = inject(DashboardServicio).traeProyectosActivos();
    resumenVentas$ = inject(DashboardServicio).traeResumenVentas();
    resumenCotizaciones$ = inject(DashboardServicio).traeResumenCotizaciones();
    resumenVentasPorProyecto$ = inject(DashboardServicio).traeResumenVentasPorProyecto();
    ventasPorMes$ = inject(DashboardServicio).obtenerVentasPorMesParaGrafico();
    
    fecha_actual : Date = new Date;

    graficoDona : any;

    opcionesGraficoDona : any;

    totalVenta : number = 0;

    _bienvenido : string = 'Bienvenido'

    _tieneDatosParaMostrar  : boolean = true;

    datosGraficoVentas : any;
    opcionesGraficoBarras : any;

    constructor(private srv : DashboardServicio, private router : Router, private ref : ChangeDetectorRef){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        const valorSesion : IUsuarioLogin = JSON.parse(sessionStorage.getItem('token')!);
        this.nombreUsuario = valorSesion.nombreCompleto;

        this.traeProyectosActivos();

        this.opcionesGraficoDona = {
            plugins: {
                legend: {
                    display: false,
                }
            },
            responsive: true,
            cutout: 60
        };

        this.graficoDeVentas();
    }

    graficoDeVentas() {
        this.ventasPorMes$.subscribe({
            next : ventas => {
                
                this.datosGraficoVentas = {
                    labels: this.etiquetaMeses(ventas),
                    datasets: [
                        {
                            label: 'Ventas en Dólares',
                            data: this.ventasPorMes(ventas),
                            fill: false,
                            borderColor: '#90cd93',
                            tension: 0.4
                        }
                    ]
                };
        
                this.opcionesGraficoBarras = this.opcionesDelGraficoVentas();
            }
        })
    }

    opcionesDelGraficoVentas () : any {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--p-text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
        const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

        const opcionesGraficoBarras = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        return opcionesGraficoBarras;
    }

    traeProyectosActivos(){
        this.srv.traeProyectosActivos().subscribe({
            next : (proyectos) => {
                if(proyectos.length > 0) {
                    this._proyectos = proyectos;
                } else {
                    this._tieneDatosParaMostrar = false;
                }
            },
            error : (err) => console.error(err)
        })
    }

    construyeDonaParaMostrar(proyecto : iResumenVentasDashboard) : any {
        const documentStyle = getComputedStyle(document.documentElement);

        this.graficoDona = {
            labels : ['Vendido','Cotizado','Remante'],
            datasets : [{
                data : [proyecto.vendido, proyecto.comprometido, proyecto.remanente],
                backgroundColor: [
                    documentStyle.getPropertyValue('--indigo-500'), 
                    documentStyle.getPropertyValue('--teal-500'), 
                    documentStyle.getPropertyValue('--purple-500')
                ],
                borderWidth: 0
            }]
        }

        return this.graficoDona;
    }

    muestraVentaProyecto(proyecto : string) : number {
        
        this.resumenVentas$.subscribe({
            next : (resumen) => {
                const resumenProyecto = resumen.filter(item => item.proyecto == proyecto)[0];
                this.totalVenta = resumenProyecto.vendido;
            }
        })

        return this.totalVenta;
    }

    // porcentajeVentas(proyectoElegido : string) : string {
    //     if(this._proyectos == undefined) return '';

    //     let porcentaje : number = 0;
    //     porcentaje = this._proyectos.filter(proyecto => proyecto.proyecto == proyectoElegido)[0].porcentaje;
        
    //     return `width:${porcentaje}%`;
    // }

    stiloPorcentajeCotizacion(remanente : number, cotizado : number) : string {
        let porcentaje : number = cotizado / remanente;
        
        if(remanente == 0 && cotizado == 0) {
            porcentaje = 0;
        } else {
            porcentaje = cotizado / remanente;
            porcentaje = porcentaje * 100;
        }

        return `width:${porcentaje}%`;
    }

    stiloPorcentajeVentas(remanente : number, venta : number) : string {
        let porcentaje : number = venta / remanente;
        
        if(remanente == 0 && venta == 0) {
            porcentaje = 0;
        } else {
            porcentaje = venta / remanente;
            porcentaje = porcentaje * 100;
        }

        return `width:${porcentaje}%`;
    }

    porcentajeCotizacion(remanente : number, cotizado : number) : number {
        if(remanente == 0 && cotizado == 0) return 0;

        let porcentaje : number = cotizado / remanente;

        return porcentaje;
    }

    porcentajeVenta(remanente : number, venta : number) : number {
        if(remanente == 0 && venta == 0) return 0;

        let porcentaje : number = venta / remanente;

        return porcentaje;
    }

    etiquetaMeses(ventas : iResumenVentasPorMes[]) : string[] {
        let etiquetas : string [] = [];

        ventas.forEach(item => {
            etiquetas.push(this.nombreDelMes(item.mes))
        });

        return etiquetas;
    }

    nombreDelMes(mes : number) : string {
        let nombreMes : string = '';

        switch(mes) {
            case 1:
                nombreMes = 'enero';
                break;

            case 2:
                nombreMes = 'febrero';
                break;

            case 3:
                nombreMes = 'marzo';
                break;

            case 4:
                nombreMes = 'abril';
                break;

            case 5:
                nombreMes = 'mayo';
                break;

            case 6:
                nombreMes = 'junio';
                break;

            case 7:
                nombreMes = 'julio';
                break;

            case 8:
                nombreMes = 'agosto';
                break;

            case 9:
                nombreMes = 'setiembre';
                break;

            case 10:
                nombreMes = 'octubre';
                break;

            case 11:
                nombreMes = 'noviembre';
                break;

            case 12:
                nombreMes = 'diciembre';
                break;
        }

        return nombreMes;
    }

    ventasPorMes(ventas : iResumenVentasPorMes[]) : number[] {
        let montoVentas : number [] = [];

        ventas.forEach(item => {
            montoVentas.push(item.montoTransferencia)
        });

        return montoVentas;
    }

}