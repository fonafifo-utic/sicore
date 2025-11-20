import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsuarioServicio } from "../servicio/usuario.servicio";
import { iParamAdminUsuario, IPerfil, iUsuarioElegidoParaRegistrar, iUsuarioParaRegistro, iUsuarioSugerido } from "../interfaces/iusuario";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { Table } from "primeng/table";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector: 'agregar-usuarios',
    templateUrl: 'usuario.agregar.html',
    styleUrl: 'usuario.agregar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AgregarUsuario implements OnInit {

    private fb = inject(FormBuilder);
    private srv = inject(UsuarioServicio);

    perfiles : string[] = [];
    _usuarios$! : Observable<iUsuarioParaRegistro[]>;

    columnas : any[] = [];

    perfilElegido!: IPerfil;
    posibleUsuarioSugerido!: iUsuarioSugerido[];
    posibleNombreUsuario!: string;
    encuentraUsuario : boolean = false;

    formUsuario: FormGroup = this.fb.group({
        idUsuario: [''],
        idUsuarioLogin: [],
        idPersonaFun: [],
        usuario: [],
        idPerfil: ['', Validators.required],
        documentoId: ['', Validators.required],
        correo: ['', Validators.required],
        telefonoMovil: ['', Validators.required],
    })

    constructor(private router: Router) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.traeTodosPerfiles();
        this.traeUsuariosParaRegistrar();
    }

    traeTodosPerfiles() {
        this.srv.traeTodosPerfiles().subscribe({
            next : (perfiles) => {
                perfiles.forEach(perfil => {
                    this.perfiles.push(perfil.nombre);
                })

            }
        })
    }

    traeUsuariosParaRegistrar() {
        this._usuarios$ = this.srv.traeUsuariosParaRegistrar();
    }

    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

    registrar(idUsuario : number, nombreFuncionario : string, apellidoFuncionario : string) {
        const funcionarioConFormato : string = this.daFormatoNombre(nombreFuncionario) + ' ' + this.daFormatoNombre(apellidoFuncionario);

        Swal.fire({
            title: `Se va a registrar al funcionario ${funcionarioConFormato} ¿Desea continuar?`,
            showDenyButton: true,
            confirmButtonText: "Confirmar",
            denyButtonText: "Cancelar"
          }).then((resultado) => {
            if (resultado.isConfirmed) {
                Swal.fire({
                    title: 'Selección de Roles del Sistema',
                    input: 'select',
                    inputOptions : this.perfiles,
                    inputPlaceholder: 'Seleccione un Rol',
                    showCancelButton: true,
                    inputValidator: (validacion) => {
                        return !validacion && 'Debe escoger un perfil de usuario.'
                    }
                  }).then((rol)=>{
                    if(rol.isConfirmed) {
                        const idPerfil : number = +rol.value + 1;
                        const usuarioToRegistrar : iUsuarioElegidoParaRegistrar = {
                            idPerfil : idPerfil,
                            idUsuario : idUsuario
                        }

                        this.srv.registraUsuario(usuarioToRegistrar).subscribe({
                            next : (resultado) => {
                                if(resultado.valor == '1') {
                                    Swal.fire('SICORE','El usuario se registró exitosamente.','success').then(()=>{
                                        this.router.navigate(['usuarios/listar']);
                                    })
                                }
                            },
                            error : (err) => console.error(err)
                        })
                    }

                })
            }
        });
    }

    campoEsValido(campo: string) {
        return this.formUsuario.controls[campo].errors && this.formUsuario.controls[campo].touched;
    }

    salir() {
        this.router.navigate(['usuarios/listar'])
    }
}

