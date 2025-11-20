import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProyectoServicio } from "../servicio/proyecto.servicio";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { iProyecto } from "../interfaces/iProyecto";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector : 'editar-proyecto',
    templateUrl : 'proyecto.editar.html',
    styleUrl : 'proyecto.editar.css',
    standalone : true,
    imports: [PrimeNgModule, CommonModule],
})

export class EditarProyecto implements OnInit {
    private fb = inject(FormBuilder);
    formProyecto : FormGroup = this.fb.group({
        proyecto : ['', Validators.required],
        inicioProyecto : [''],
        finProyecto : [''],
        ubicacion : ['', Validators.required],
        especie : [''],
        contratoPSA : ['']
    });

    private srv = inject(ProyectoServicio);

    idProyecto! : number;
    _guardando : boolean = false;

    private fechaInicio! : string;
    private fechaFinal! : string;

    _fechaInvalida : boolean = false;
    _desHabilitarAplicar : boolean = false;
    _maximoYMinimo : boolean = false;
    _maximoYMinimoUbicacion : boolean = false;

    constructor(private router: Router, private route : ActivatedRoute) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.idProyecto = +this.route.snapshot.paramMap.get('id')!;
        this.traeProyectoElegido();
    }

    traeProyectoElegido() {
        this.srv.traeProyectoPorId(this.idProyecto).subscribe({
            next : (proyecto) => {
                let [mes, dia, anno] = proyecto[0].periodoInicio.split(' ')[0].split('/');
                this.fechaInicio = `${anno}-${mes}-${dia}`;
                
                [mes, dia, anno] = proyecto[0].periodoFinalizacion.split(' ')[0].split('/');
                this.fechaFinal = `${anno}-${mes}-${dia}`;

                this.formProyecto.controls['proyecto'].setValue(proyecto[0].proyecto);
                this.formProyecto.controls['inicioProyecto'].setValue(this.fechaInicio);
                this.formProyecto.controls['finProyecto'].setValue(this.fechaFinal);
                this.formProyecto.controls['ubicacion'].setValue(proyecto[0].ubicacionGeografica);
                this.formProyecto.controls['especie'].setValue(proyecto[0].especieArboles);
                this.formProyecto.controls['contratoPSA'].setValue(proyecto[0].contratoPSA);

            },
            error : (err) => console.log(err)
        })
    }

    OnSubmit(){
        if (this.formProyecto.invalid) {
            this.formProyecto.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(this.validaCantidadMinimaYMaxima()) return;

        const fechaInicial = Date.parse(this.fechaInicio);
        const fechaFin = Date.parse(this.fechaFinal);

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
            idProyecto : this.idProyecto,
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

        this.srv.actualizaUnProyecto(proyecto).subscribe({
            next : (respuesta) => {
                this._guardando = false;
                if(respuesta.valor == '1') {
                    Swal.fire('SICORE','El registro se actualizó exitosamente.','success').then(()=>{
                        this.router.navigate(['proyecto/listar']);
                    });
                } else {
                    if(respuesta.valor == '-1') Swal.fire('SICORE', respuesta.descripcion,'warning');
                }
            },
            error : (err) => {
                console.error(err);
                this._guardando = false;
            }
        })
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

    seSaleFocoFechaInicio(evento : any){
        this.fechaInicio = evento.target.value;
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

    entraFocoFechaFin() {
        this._fechaInvalida = false;
    }

    entraNombreProyecto() {
        this._maximoYMinimo = false;
    }

    entraUbicacion() {
        this._maximoYMinimoUbicacion = false;
    }

    campoEsValido(campo : string) {
        return this.formProyecto.controls[campo].errors && this.formProyecto.controls[campo].touched;
    }

    salir(){
        this.router.navigate(['proyecto/listar'])
    }
}