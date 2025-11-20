import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import { iProyecto } from "../interfaces/iProyecto";
import { ProyectoServicio } from "../servicio/proyecto.servicio";
import { Router } from "@angular/router";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector : 'agrega-proyecto',
    templateUrl : 'proyecto.agregar.html',
    styleUrl : 'proyecto.agregar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule]
})

export class AgregaProyecto implements OnInit {

    private fb = inject(FormBuilder);
    formProyecto : FormGroup = this.fb.group({
        proyecto : ['', Validators.required],
        inicioProyecto : [''],
        finProyecto : [''],
        ubicacion : ['', Validators.required],
        especie : [''],
        contratoPSA : ['']
    })
    
    private srv = inject(ProyectoServicio);

    _guardando : boolean = false;

    private fechaInicio! : string;
    private fechaFinal! : string;

    _fechaInvalida : boolean = false;
    _maximoYMinimo : boolean = false;
    _maximoYMinimoUbicacion : boolean = false;

    constructor(private router : Router){
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        const hoy : Date = new Date();        
        const dia : string = ('0' + hoy.getDate()).slice(-2);
        const mes : string = ('0' + (hoy.getMonth() + 1)).slice(-2);
        const mesFinalizacion : string = ('0' + (hoy.getMonth() + 7)).slice(-2);

        this.fechaInicio = hoy.getFullYear() + '-' + mes + '-' + dia;
        this.fechaFinal = hoy.getFullYear() + '-' + mesFinalizacion + '-' + dia;

        const intervalo = setInterval(()=>{
            if(document.getElementById('finProyecto')){
                clearInterval(intervalo);

                (<HTMLInputElement>document.getElementById('inicioProyecto')).value = this.fechaInicio;
                (<HTMLInputElement>document.getElementById('finProyecto')).value = this.fechaFinal;
            }
        },300);

        this.validaTiempoMinimoProyecto();
    }

    OnSubmit() {
        if (this.formProyecto.invalid) {
            this.formProyecto.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(this.validaCantidadMinimaYMaxima()) return;

        const fechaInicial : number = Date.parse(this.fechaInicio);
        const fechaFin : number = Date.parse(this.fechaFinal);

        if(fechaInicial >= fechaFin) {
            this._fechaInvalida = true;
            return;
        }

        if(!this.validaTiempoMinimoProyecto()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "El periodo del proyecto debe ser al menos de seis meses.",
              });

              return;
        }

        this._guardando = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        
        const proyecto : iProyecto = {
            idProyecto : 0,
            idFuncionario : valorSesion.idUsuario,
            proyecto : String(this.formProyecto.controls['proyecto'].value).trim(),
            periodoInicio : this.fechaInicio,
            periodoFinalizacion : this.fechaFinal,
            ubicacionGeografica : String(this.formProyecto.controls['ubicacion'].value).trim(),
            especieArboles : '',
            contratoPSA : '',
            descripcionProyecto : '',
            indicadorEstado : 'A',
            cotizacionesAsociadas : 0
        }

        this.srv.registraUnProyecto(proyecto).subscribe({
            next : (respuesta) => {
                this._guardando = true;

                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El registro se guardó exitosamente.','success').then(()=>{
                        this.router.navigate(['proyecto/listar']);
                    });
                }

                if(respuesta.valor == '2') {
                    Swal.fire({
                        title: 'SICORE',
                        text : 'El proyecto ya existe en la base de datos, ¿Desea actualizarlo?',
                        icon: 'warning',
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Actualizar',
                        denyButtonText: 'No actualizar'
                    }).then((respuesta) => {
                        if (respuesta.isConfirmed) {

                            this.srv.actualizaUnProyecto(proyecto).subscribe({
                                next : (seActualizoRegistro) => {
                                    if(seActualizoRegistro.valor == '1') {
                                        Swal.fire('SICORE','El registro se guardó exitosamente.','success').then(()=>{
                                            this.router.navigate(['proyecto/listar']);
                                        });
                                    }
                                },
                                error : (err) => console.error(err)
                            })

                        }
                    });
                }

                if(respuesta.valor != '1' && respuesta.valor != '2') Swal.fire('SICORE', respuesta.descripcion, 'warning');
            },
            error : (err) => {
                console.error(err)
                this._guardando = true;
            }
        });

    }

    campoEsValido(campo: string) {
        return this.formProyecto.controls[campo].errors && this.formProyecto.controls[campo].touched;
    }

    entraNombreProyecto() {
        this._maximoYMinimo = false;
    }

    entraUbicacion() {
        this._maximoYMinimoUbicacion = false;
    }

    validaEspaciosBlancoAlInicio(expresion : any) : boolean {
        const caracterDigitado : string = expresion.key;
        const palabraEscrita : string = (<HTMLInputElement>document.getElementById(expresion.target.id)).value;
        const caracterInicial : string = palabraEscrita.substring(0,1);
        
        if(caracterInicial == caracterDigitado) {
            if(caracterDigitado == ' ') return false;
            else return true;
        }
        else return true;
    }

    validaTiempoMinimoProyecto() : boolean {
        const cadenaFechaInicio : string = (<HTMLInputElement>document.getElementById('inicioProyecto')).value = this.fechaInicio;
        const cadenaFechaFinal : string = (<HTMLInputElement>document.getElementById('finProyecto')).value = this.fechaFinal;

        const fechaInicial : Date = new Date(cadenaFechaInicio);
        const fechaFinal : Date = new Date(cadenaFechaFinal);

        let meses : number = (fechaFinal.getFullYear() - fechaInicial.getFullYear()) * 12;
        meses -= fechaInicial.getMonth();
        meses += fechaFinal.getMonth();

        if(meses < 6) return false;
        else return true;
    }

    validaCantidadMinimaYMaxima() : boolean {
        const nombreProyecto : string = (<HTMLInputElement>document.getElementById('proyecto')).value;
        const ubicacionProyecto : string = (<HTMLInputElement>document.getElementById('ubicacion')).value;

        if(nombreProyecto.length < 3) {
            this._maximoYMinimo = true;
            return true;
        }

        if(nombreProyecto.length > 100) {
            this._maximoYMinimo = true;
            return true;
        }

        if(ubicacionProyecto.length < 3) {
            this._maximoYMinimoUbicacion = true;
            return true;
        }

        if(ubicacionProyecto.length > 100) {
            this._maximoYMinimoUbicacion = true;
            return true;
        }

        return false;
    }

    seSaleFocoFechaInicio(evento : any) {
        this.fechaInicio = evento.target.value;
    }

    entraFocoFechaFin() {
        this._fechaInvalida = false;
    }

    seSaleFocoFechaFin(evento : any) {
        this.fechaFinal = evento.target.value;
        if(this.fechaInicio != undefined) {
            const fechaInicial = Date.parse(this.fechaInicio);
            const fechaFin = Date.parse(this.fechaFinal);

            if(fechaInicial >= fechaFin) {
                this._fechaInvalida = true;
            }
        } else {
            return;
        }
    }

    salir() {
        this.router.navigate(['proyecto/listar'])    
    }
}