import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsuarioServicio } from "../servicio/usuario.servicio";
import { iParamAdminUsuario, IPerfil, iUsuarioSugerido } from "../interfaces/iusuario";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { ILogin, iLoginSalida } from "../../../../auth/login/ilogin";
import { AuthService } from "../../../../services/auth.service";

@Component({
    selector: 'editar-usuarios',
    templateUrl: 'usuario.editar.html',
    styleUrl: 'usuario.editar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditarUsuario implements OnInit {

    private fb = inject(FormBuilder);
    private srv = inject(UsuarioServicio);

    _perfiles$!: Observable<IPerfil[]>;
    perfilElegido!: IPerfil;
    posibleNombreUsuario!: string;
    usuarioElegido! : iUsuarioSugerido[];

    formUsuario: FormGroup = this.fb.group({
        idUsuario: [''],
        idUsuarioLogin: [],
        idPersonaFun: [],
        usuario: [],
        idPerfil: ['', Validators.required],
        documentoId: [],
        correo: ['', Validators.required],
        telefonoMovil: ['', Validators.required],
    })

    idUsuario! : number;

    cambiarPassword : boolean = false;
    campoRequeridoPassword : boolean = false;
    campoRequeridoConfirma : boolean = false;

    constructor(private router: Router, private route : ActivatedRoute, private servicioLogin : AuthService) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.idUsuario = +this.route.snapshot.paramMap.get('id')!;
        // this.srv.traeUsuarioPorId(this.idUsuario).subscribe({
        //     next : (usuario) => {
        //         this.usuarioElegido = usuario;
        //         this.formUsuario.controls['correo'].setValue(usuario[0].correo);
        //         this.formUsuario.controls['telefonoMovil'].setValue(usuario[0].telefonoMovil);
        //         this.formUsuario.controls['idPerfil'].setValue(usuario[0].idPerfil);
                
        //         this.traeTodosPerfiles();
        //     }
        // });
        
    }

    traeTodosPerfiles() {
        this._perfiles$ = this.srv.traeTodosPerfiles();
    }

    OnSubmit() {
        if (this.formUsuario.invalid) {
            this.formUsuario.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        const perfil : IPerfil = this.formUsuario.controls['idPerfil'].value;
        const usuario : iParamAdminUsuario = {
            correo : this.formUsuario.controls['correo'].value,
            documentoId : '',
            idPerfil : String(perfil),
            idPersonaFun : '',
            idUsuario : this.idUsuario.toString(),
            idUsuarioLogin : '',
            telefonoMovil : this.formUsuario.controls['telefonoMovil'].value,
            usuario : ''
        }

        this.srv.actualizaUsuario(usuario).subscribe({
            next : (respuesta) => {
                if(respuesta.valor == '1') {

                    if(this.cambiarPassword) this.CambiarClaveUsuario();
                    else {
                        Swal.fire('SICORE','Su información de contacto se guardó exitosamente','success').then(()=>{
                            this.router.navigate(['usuarios/listar']);
                        });
                    }

                } else {
                    if(respuesta.valor == '-1')
                        Swal.fire('SICORE','El correo electrónico digitado, ya existe en base de datos.','warning');
                    if(respuesta.valor == '-2')
                        Swal.fire('SICORE','El número de cédula digitada, ya existe en base de datos.','warning');
                }
            },
            error : (err) => console.error(err)
        })
    }

    campoEsValido(campo: string) {
        return this.formUsuario.controls[campo].errors && this.formUsuario.controls[campo].touched;
    }

    salir() {
        this.router.navigate(['usuarios/listar'])
    }

    aplicarCambioPassword(){

    }

    CambiarClaveUsuario() {
        const nuevaClave : string = (<HTMLInputElement>document.getElementById('password')).value;
        const confirmaNuevaClave : string = (<HTMLInputElement>document.getElementById('confirma')).value;

        if((nuevaClave != '') && (confirmaNuevaClave != '')){
            if (nuevaClave == confirmaNuevaClave) {//Se cumple la comparación de las contraseñas
                if (nuevaClave.length >= 8) {//Se cumple el largo mínimo de la contraseña
                    if (this.Validarquecontengaletrasynumeros(nuevaClave)) {//Se cumple que contenga letras y numeros
                        if (this.Validarqueletrasynumerosnoserepiten(nuevaClave)) { //Se cumple que las letras y los números no se repitan
                            if (this.Validarqnocontengapalabrafona(nuevaClave)) {//Se cumple que no contenga la palabra fona o fonafifo
    
                                const objU : ILogin = {
                                    correoCedula : this.usuarioElegido[0].correo,
                                    clave : nuevaClave, 
                                    idPersona : this.idUsuario.toString(),
                                    tipologin : '',
                                    claveActual : '',
                                    documentoId : this.usuarioElegido[0].telefonoMovil,
                                    idPerfil : this.usuarioElegido[0].idPerfil.toString(),
                                    idUsuario : this.idUsuario.toString(),
                                    telefonoMovil : this.usuarioElegido[0].telefonoMovil
                                }

                                this.servicioLogin.usuarioActualizarClave(objU).subscribe({
                                    next: (r) => {
                                        if (r.valor == "1") { //La contraseña se actualizó exitosamente
                                            //Swal.fire('SICORE', r.descripcion, 'success');
                                            Swal.fire('SICORE','Su información de contacto se guardó exitosamente','success').then(()=>{
                                                this.router.navigate(['usuarios/listar']);
                                            });
                                        }
                                        else {
                                            if (r.valor == "-1") {//La contraseña digitada ya fue utilizada en las últimas 6
                                                Swal.fire('SICORE', r.descripcion, 'warning');
                                            }
                                            else {
                                                if (r.valor == "2") {//No se puede utilizar la contraseña temporal
                                                    Swal.fire('SICORE', r.descripcion, 'warning');
                                                }
                                                else {
                                                    Swal.fire('SICORE', r.descripcion, 'error');
                                                }

                                            }
                                        }
                                    }
                                })
                            }
                            else {
                                this.poneClaseAdvertencia();
                                Swal.fire('SICORE', 'ATENCIÓN: La contraseña no debe contener la palabra "fona" o "Fonafifo".', 'warning');
                            }
                        }
                        else {
                            this.poneClaseAdvertencia();
                            Swal.fire('SICORE', 'ATENCIÓN: No puede repetir letras ni números.', 'warning');
                        }
                    }
                    else {
                        this.poneClaseAdvertencia();
                        Swal.fire('SICORE', 'ATENCIÓN: La contraseña debe contener letras y números.', 'warning');
                    }
                }
                else {
                    this.poneClaseAdvertencia();
                    Swal.fire('SICORE', 'ATENCIÓN: La contraseña debe ser mayor o igual a 8 caracteres.', 'warning');
                }
            }
            else {
                this.poneClaseAdvertencia();
                Swal.fire('SICORE', 'ATENCIÓN: Las contraseñas digitadas no son iguales.', 'warning');
            }
        } else {
            this.poneClaseAdvertencia();
            Swal.fire('SICORE', 'ATENCIÓN: Los campos son requeridos.', 'warning');
        }
    }

    poneClaseAdvertencia(){
        document.getElementById('password')?.classList.add('ng-invalid')
        document.getElementById('password')?.classList.add('ng-dirty')
        document.getElementById('confirma')?.classList.add('ng-invalid')
        document.getElementById('confirma')?.classList.add('ng-dirty')
    }

    quitaClaseAdvertencia(){
        document.getElementById('password')?.classList.remove('ng-invalid')
        document.getElementById('password')?.classList.remove('ng-dirty')
        document.getElementById('confirma')?.classList.remove('ng-invalid')
        document.getElementById('confirma')?.classList.remove('ng-dirty')
    }

    Validarquecontengaletrasynumeros(texto: string): boolean {
        let respuesta : boolean = false;

        if (/[a-zA-Z]/.test(texto)) {
            if (/[0-9]/.test(texto)) {
                respuesta = true;
            }
        }

        return respuesta;
    }

    Validarqueletrasynumerosnoserepiten(texto: string): boolean {
        let r: boolean = true;

        r = !/(.).*\1/.test(texto);

        return r;
    }

    Validarqnocontengapalabrafona(texto: string): boolean {
        var r: boolean = false;
        if (texto.indexOf('fona') == -1 && texto.indexOf('FONA') == -1 && texto.indexOf('fonafifo') == -1 && texto.indexOf('FONAFIFO') == -1) {
            r = true;
        }
        return r;
    }
}

