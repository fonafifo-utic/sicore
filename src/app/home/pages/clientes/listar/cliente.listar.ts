import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { ClienteServicio } from "../servicio/cliente.servicio";
import { iCliente, iFuncionario } from "../interfaces/iCliente";
import { iLoginSalida } from "../../../../auth/login/ilogin";
import { InventarioServicio } from "../../inventario/servicio/inventario.servicio";

@Component({
    selector : 'listar-clientes',
    templateUrl : 'cliente.listar.html',
    styleUrl : 'cliente.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListarCliente implements OnInit {

    private srv = inject(ClienteServicio);
    private servicioInventario = inject(InventarioServicio);
    _clientes$! : Observable<iCliente[]>;
    _esAsistenteDDC : boolean = false;
    private idUsuario : number;
    private funcionarios! : iFuncionario[];

    columnas : any[] = [];
    
    constructor (private router : Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        this.idUsuario = valorSesion.idUsuario;
        const perfil : number = valorSesion.idPerfil;

        if(perfil == 4) this._esAsistenteDDC = true;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.traeTodosClientes();
        this.traeTodosLosFuncionarios();
    }

    agregarCliente(){
        this.router.navigate(['cliente/agregar']);
    }

    irACotizaciones() {
        this.router.navigate(['cotizacion/listar']);
    }

    traeTodosClientes() {
        this.validaCantidadDeInventario();

        this.columnas = [
            { campo :  'nombreCliente', encabezado : 'Cliente' },
            { campo :  'sectorComercial', encabezado : 'Sector Comercial' },
            { campo :  'contactoCliente', encabezado : 'Contacto' },
            { campo :  'telefonoCliente', encabezado : 'Télefono' },
            { campo :  'emailCliente', encabezado : 'Correo Electrónico' }
        ];

        this._clientes$ = this.srv.traeTodosClientes();
        //this._clientes$ = this.srv.traeTodosClientesPorAgente(this.idUsuario);
    }

    traeTodosLosFuncionarios() {
        this.srv.traeFuncionarios().subscribe({
            next : funcionarios => {
                this.funcionarios = funcionarios;
            },
            error : err => console.error(err)
        })
    }

    tomaAgenteDeLaCuenta(idAgente : number) : string {
        const funcionarios = this.funcionarios.filter(item => item.idUsuario === idAgente);
        if(funcionarios.length == 0) return 'Desconocido';
        else {
            return funcionarios[0].nombre;
        }

    }

    validaCantidadDeInventario(){
        this.srv.traeTodosClientes().subscribe({
            next : (listadoClientes) => {
                if(listadoClientes.length == 0) {
                    this.router.navigate(['cliente/agregar']);
                }
            }
        })
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    editarInventario(id : number){
        this.router.navigate(['inventario/editar/', id])
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

    irAEditarCliente(idCliente : number) {
        this.router.navigate(['cliente/editar/', idCliente])
    }

    cambiarDeEstado(idCliente : number, estado : string) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario : number = valorSesion.idUsuario;

        const cliente : iCliente = {
            cedulaCliente : '',
            contactoCliente : '',
            direccionFisica : '',
            emailCliente : '',
            idSector : 0,
            nombreCliente : '',
            telefonoCliente : '',
            sectorComercial : '',
            idCliente : idCliente,
            actividadCormercial : '',
            clasificacion : '',
            idActividadComercial : 0,
            idTipoEmpresa : 0,
            nombreComercial : '',
            TipoEmpresa : '',
            idFuncionario : idFuncionario,
            indicadorEstado : estado,
            cotizacionesAsociadas : 0,
            contactoContador : '',
            emailContador : '',
            esGestor : '',
            idAgente : 0,
            ucii : ''
        }

        this.srv.actualizaEstadoCliente(cliente).subscribe({
            next : (respuesta) => {
                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El estado fue cambiado exitosamente.','success').then(()=>{
                        location.reload();
                    });
                } else {
                    if(respuesta.valor == '-1') console.log(respuesta.descripcion);
                }
            },
            error : (err) => console.error(err)
        })
    }

    deshabilitarCliente(idCliente : number) {
        Swal.fire({
            title: "¿Va a deshabilitar este cliente, desea continuar?",
            showCancelButton: true,
            confirmButtonText: "Continuar",
        }).then((confirmacion) => {
            if (confirmacion.isConfirmed) this.cambiarDeEstado(idCliente, 'I');
        });
    }

    habilitarCliente(idCliente : number) {
        Swal.fire({
            title: "¿Va a habilitar este cliente, desea continuar?",
            showCancelButton: true,
            confirmButtonText: "Continuar",
        }).then((confirmacion) => {
            if (confirmacion.isConfirmed) this.cambiarDeEstado(idCliente, 'A');
        });
    }
    paraVerDeshabilitar(cliente : iCliente) : boolean {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;

        if(perfil == 4) return false;

        return (
            (cliente.indicadorEstado == 'Activo') &&
            (cliente.cotizacionesAsociadas == 0));
    }

}