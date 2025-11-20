import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { IPerfil, iUsuarioElegidoParaRegistrar, iUsuarioVista } from "../interfaces/iusuario";
import { UsuarioServicio } from "../servicio/usuario.servicio";
import { Observable } from "rxjs";
import { Table } from "primeng/table";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector : 'listar-usuarios',
    templateUrl : 'usuario.listar.html',
    styleUrl : 'usuario.listar.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListarUsuarios implements OnInit {

    private srv = inject(UsuarioServicio);
    _usuarios$! : Observable<iUsuarioVista[]>;

    usuarios : iUsuarioVista [] = [];
    columnas : any[] = [];

    _muestraDatosUsuario : boolean = false;
    _haySoloUnUsuario : boolean = true;

    perfiles : string[] = [];
    todosPerfiles! : IPerfil [];

    constructor (private router : Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.traeTodosUsuarios();
        this.traeTodosPerfiles();
    }

    agregarUsuario() {
        this.router.navigate(['usuarios/agregar']);
    }

    traeTodosUsuarios() {
        this._usuarios$ = this.srv.traeTodosUsuarios();
        this._usuarios$.subscribe({
            next : listadoUsuario => {
                this.usuarios = listadoUsuario;
            }
        })

        this.columnas = [
            { campo : 'idUsuario', encabezado : 'ID' },
            { campo : 'documentoID', encabezado : 'Cédula' },
            { campo : 'usuario', encabezado : 'Usuario' },
            { campo : 'nombre', encabezado : 'Nombre' },
            { campo : 'primerApellido', encabezado : 'Primer Apellido' },
            { campo : 'segundoApellido', encabezado : 'Segundo Apellido' },
            { campo : 'fechaVenceClave', encabezado : 'Vencimiento Clave' },
            { campo : 'indicadorEstado', encabezado : 'Estado' }
        ];
   
    }

    hayMasDeUnUsuario(cantidadUsuarios : number) : boolean {
        if(cantidadUsuarios > 1) {
            this._haySoloUnUsuario = true;
            return true;
        } else {
            this._haySoloUnUsuario = false;
            return false;
        }
    }

    traeTodosPerfiles() {
        this.srv.traeTodosPerfiles().subscribe({
            next : (perfiles) => {
                this.todosPerfiles = perfiles;
                perfiles.forEach(perfil => {
                    this.perfiles.push(perfil.nombre)
                })
            },
            error : (err) => console.error(err)
        })
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    editarUsuario(id : number){
        this.router.navigate(['usuarios/editar/', id])
    }

    deshabilitarUsuario(idUsuario : number) {
        
        if(!this.revisaPerfiles(idUsuario)) return;

        Swal.fire({
            title: "¿Desea excluir este usuario?",
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
          }).then((resultado) => {
            if (resultado.isConfirmed) {
                const usuario : iUsuarioElegidoParaRegistrar = {
                    idPerfil : 0,
                    idUsuario : idUsuario
                }
        
                this.srv.cambiaEstadoUsuario(usuario).subscribe({
                    next : (resultado) => {
                        if(resultado.valor == "1"){
                            Swal.fire("Cambio confirmado", "", "success").then(()=>{
                                location.reload();
                            })
                        }
                        else {
                            Swal.fire(resultado.descripcion, "", "error")
                        }
                    },
                    error : (err) => console.log(err)
                })
            }
        });
    }

    daFormatoNombre(cadena : string) {
        let cadenaConFormato : string = '';

        cadena = cadena.toLowerCase();
        let arreglo : string[] = cadena.split(' ');

        if(arreglo.length > 1) {
            arreglo.forEach(item => {
                cadenaConFormato = cadenaConFormato + ' ' + item.charAt(0).toUpperCase() + item.slice(1)
            });

            return cadenaConFormato;
        } else {
            return cadena.charAt(0).toUpperCase() + cadena.slice(1);
        }
        
    }

    cambiarPerfil(idUsuario : number) {
        
        if(!this.revisaPerfiles(idUsuario)) return;

        Swal.fire({
            title: 'Selección de Roles del Sistema',
            input: 'select',
            inputOptions : this.perfiles,
            inputPlaceholder: 'Seleccione un Rol',
            showCancelButton: true
          }).then((rol)=>{
            if(rol.isConfirmed) {
                let idPerfilElegido : number = this.todosPerfiles.filter(perfil => perfil.nombre == this.perfiles[rol.value])[0].idPerfil;
                const usuarioToRegistrar : iUsuarioElegidoParaRegistrar = {
                    idPerfil : idPerfilElegido,
                    idUsuario : idUsuario
                }

                this.srv.cambiaPerfilUsuario(usuarioToRegistrar).subscribe({
                    next : (resultado) => {
                        if(resultado.valor == '1') {
                            Swal.fire('SICORE','El se cambió exitosamente.','success').then(()=>{
                                location.reload();
                            })
                        }
    
                    },
                    error : (err) => console.error(err)
                })
            }
        })
    }

    revisaPerfiles(idUsuario : number) : boolean {
        const usuarioElegido = this.usuarios.filter(usuario => usuario.idUsuario == idUsuario)[0];
        const perfiles = this.usuarios.filter(usuario => usuario.idPerfil == 1);
        let validacion : boolean = true;

        if(usuarioElegido.idPerfil == 1) {
            if(perfiles.length == 1) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se puede editar usuario, porque al menos debe existir un usuario administrador.",
                });

                validacion = false;

                return validacion;
            } else {
                return validacion;
            }
        } else {
            return validacion;
        }
    }
}