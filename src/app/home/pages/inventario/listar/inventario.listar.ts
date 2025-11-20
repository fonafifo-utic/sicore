import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import { iInventario, iMovimiento } from "../interfaces/iInventario";
import { InventarioServicio } from "../servicio/inventario.servicio";
import Swal from "sweetalert2";
import { CotizacionServicio } from "../../cotizaciones/servicio/cotizacion.servicio";
import { ProyectoServicio } from "../../proyecto/servicio/proyecto.servicio";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector : 'listar-inventario',
    templateUrl : 'inventario.listar.html',
    styleUrl : 'inventario.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListarInventario implements OnInit {

    private srv = inject(InventarioServicio);
    private servicioProyectos = inject(ProyectoServicio);
    private servicioCotizacion = inject(CotizacionServicio);

    _inventario$! : Observable<iInventario[]>;
    _movimiento$! : Observable<iMovimiento[]>;

    inventarios : iInventario [] = [];
    columnas : any[] = [];
    columnasMovimiento : any[] = [];
    
    _muestraDatosUsuario : boolean = false
    muestraMovimientosDelProyecto : boolean = false;
    proyectoElegido : string = '';

    idLineaTocadaAnterior : number = 0;

    _perfilAutorizado : boolean = true;

    constructor (private router : Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idPerfil : number = valorSesion.idPerfil;
        
        if(idPerfil == 1) this._perfilAutorizado = false;
        if(idPerfil == 6) this._perfilAutorizado = false;
        if(idPerfil == 9) this._perfilAutorizado = false;

        this.traeInventarioCompleto();
    }

    agregarInventario() {
        this.router.navigate(['inventario/agregar'])
    }

    // sacarInventario() {
    //     this.router.navigate(['inventario/agregar', 2])
    // }

    traeInventarioCompleto() {
        this.validaCantidadProyectos();

        this._inventario$ = this.srv.traeCompletoInventario();

        this.columnas = [
            { campo : 'idInventario', encabezado : 'ID' },
            { campo : 'ubicacionProyecto', encabezado : 'Ubicación Proyecto' },
            { campo : 'remanente', encabezado : 'Remanentes' },
            { campo : 'vendidas', encabezado : 'Vendidas' },
            { campo : 'indicadorEstado', encabezado : 'Estado' }
        ];
    }

    validaCantidadProyectos(){
        this.servicioProyectos.traeTodosProyectos().subscribe({
            next : (listadoProyectos) => {

                if(listadoProyectos.length == 0) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se puede registrar inventario sin un proyecto."
                    }).then(()=>{
                        this.router.navigate(['proyecto/agregar']);
                    })
                } else {
                    const proyectosActivos : number = listadoProyectos.filter(item => item.indicadorEstado == 'Activo').length;
                    if(proyectosActivos == 0) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No se puede registrar inventario sin un proyecto activo."
                        }).then(()=>{
                            this.router.navigate(['proyecto/listar']);
                        })
                    } else {
                        this.validaCantidadInventario();
                    }
                }

            }
        })
    }

    validaCantidadInventario(){
        this.srv.traeCompletoInventario().subscribe({
            next : (listadoInventario) => {
                if(listadoInventario.length == 0) this.router.navigate(['inventario/agregar']);
                else this.router.navigate(['inventario/listar']);
            }
        })
    }

    traeMovimientosInventario(idProyecto : number) {
        this._movimiento$ = this.srv.traeMovimientosInventario(idProyecto);

        this.columnasMovimiento = [
            { campo : 'idMovimiento', encabezado : 'ID' },
            { campo : 'proyecto', encabezado : 'Proyecto' },
            { campo : 'ubicacionGeografica', encabezado : 'Ubicación' },
            { campo : 'usuario', encabezado : 'Usuario' },
            { campo : 'saldoInicial', encabezado : 'Inicial' },
            { campo : 'fechaMovimiento', encabezado : 'Fecha' },
            { campo : 'cantidad', encabezado : 'Cantidad' },
            { campo : 'tipoMovimiento', encabezado : 'Movimiento' },
            { campo : 'descripcionMovimiento', encabezado : 'Descripción' },
            { campo : 'remanente', encabezado : 'Remanente' },
            { campo : 'remanenteReal', encabezado : 'Remanente Real' }
        ];

        this._movimiento$.subscribe({
            next : (movimiento) => {
                if(movimiento.length > 0) {
                    this.proyectoElegido = movimiento[0].proyecto;
                }
            },
        })

        if(this.idLineaTocadaAnterior != 0) {
            const lineaRegistroTocadaAnterior : HTMLElement = document.getElementById(this.idLineaTocadaAnterior.toString())!;
            lineaRegistroTocadaAnterior.classList.remove('flote');
        }
        
        const lineaRegistroTocado :  HTMLElement = document.getElementById(idProyecto.toString())!;
        lineaRegistroTocado?.classList.add('flote');
        this.idLineaTocadaAnterior = idProyecto;
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    aumentarInventario(idInventario : number){
        this.router.navigate(['inventario/aumentar/', idInventario])
    }

    disminuirInventario(idInventario : number){
        this.router.navigate(['inventario/editar/', idInventario])
    }

    deshabilitarInventario(id : number) {
        Swal.fire({
            title: "Va a cambiar el estado del ítem ¿Desea continuar?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
          }).then((resultado) => {
            if (resultado.isConfirmed) {

                this._inventario$.subscribe({
                    next : (elementos) => {
                        const inventarioToActualizar : iInventario = elementos.filter(item => item.idInventario == id)[0];
                        this.srv.cambiaEstadoInventario(inventarioToActualizar).subscribe({
                            next : (respuesta) => {
                                if(respuesta.valor == "1"){
                                    Swal.fire("Cambio confirmado", "", "success").then(()=>{
                                        location.reload();
                                    })
                                }
                                else {
                                    Swal.fire(respuesta.descripcion, "", "success")
                                }
                            },
                            error : (err_actualizacion) => console.error(err_actualizacion)
                        })
                    },
                    error : (err) => console.log(err)
                })

            }
        });

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

    irAVerCotizacion(descripcionMovimiento : string){
        const numeroCotizacion : string = descripcionMovimiento.split(' ')[2];
        const consecutivoCadena : string = numeroCotizacion.split('-')[2];
        const consecutivo : number = Number(consecutivoCadena);

        this.servicioCotizacion.traeTodasCotizaciones().subscribe({
            next : (cotizaciones) => {
                const idCotizacion = cotizaciones.filter(item => item.consecutivo == consecutivo)[0].idCotizacion;
                const cadenaParametroInterno : string = String(idCotizacion) + '1';
                const parametroInterno : number = Number(cadenaParametroInterno);
                
                this.router.navigate(['cotizacion/ver/' + parametroInterno]);
            },
            error : (err) => console.error(err)
        })
    }

    validaRemanenteCero(remanente : number) : boolean {
        return (remanente > 0);
    }
}