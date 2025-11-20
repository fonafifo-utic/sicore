import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { InventarioServicio } from "../servicio/inventario.servicio";
import { iIngresaMovimiento } from "../interfaces/iInventario";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector: 'agregar-inventario',
    templateUrl: 'inventario.agregar.html',
    styleUrl: 'inventario.agregar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AgregarInventario implements OnInit {

    private fb = inject(FormBuilder);
    private srv = inject(InventarioServicio);

    formInventario : FormGroup = this.fb.group({
        ubicacionProyecto : ['', Validators.required],
        cantidad : ['', Validators.required],
        descripcion : ['', Validators.required]
    })

    _ubicaciones$! : Observable<iProyecto[]>;
    indicadorRegistro! : number;
    agregarActivo : boolean = false;

    _validarMayorCero : boolean = false;
    _maximoPermitido : boolean = false;
    _maximoYMinimo : boolean = false;
    _guardando : boolean = false;
    _esUnicamenteNumero : boolean = false;

    _remanente! : number;

    constructor(private router: Router, private route : ActivatedRoute, private ref : ChangeDetectorRef) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 6) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.indicadorRegistro = +this.route.snapshot.paramMap.get('id')!;
        if(this.indicadorRegistro == 1) this.agregarActivo = true;
        if(this.indicadorRegistro == 2) this.agregarActivo = false;

        this._ubicaciones$ = this.srv.listadoUbicacionProyectosSinInventario();
    }

    eligeProyecto(e : any) {
        this.srv.traeCompletoInventario().subscribe({
            next : (inventarioCompleto) => {
                const inventarioPorProyecto = inventarioCompleto.filter(inventario => inventario.idProyecto == e.value);
                if(inventarioPorProyecto.length > 0) {
                    this._remanente = inventarioPorProyecto[0].remanente;
                }
            }
        })
    }

    OnSubmit() {
        if (this.formInventario.invalid) {
            this.formInventario.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(this.cantidadMenorCero()) return;
        if(this.cantidadMayorAlMaximo()) return;
        if(this.validaCantidadMinimaYMaxima()) return;
        if(this.cantidadUnicamenteNumero()) return;

        this._guardando = true;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value);

        const inventario : iIngresaMovimiento = {
            cantidad : cantidad,
            descripcionMovimiento : this.formInventario.controls['descripcion'].value,
            idProyecto : this.formInventario.controls['ubicacionProyecto'].value,
            idUsuario : valorSesion.idUsuario,
            idInventario : 0
        }

        let mensajeExitoso : string;
        if(this._remanente != undefined) {
            const remanenteActual : number = this._remanente + cantidad;
            mensajeExitoso = `Remanente Anterior: ${this._remanente} tons CO2e, ahora: ${remanenteActual} tons CO2e`
        } else {
            mensajeExitoso = `Remanente Actual: ${cantidad} tons CO2e`;
        }

        Swal.fire({
            title: `Va a incrementar el remanente a ${this.formInventario.controls['cantidad'].value} tons CO2e`,
            text: "¿Confirma el cambio?",
            showCancelButton: true,
            confirmButtonText: "Confirmo"
        }).then((result) => {
            if (result.isConfirmed) {

                this.srv.registraInventario(inventario).subscribe({
                    next : (respuesta) => {
                        this._guardando = false;
                        if(respuesta.valor == '1') {
                            Swal.fire("¡Aplicado!", mensajeExitoso, "success").then(()=>{
                                this.router.navigate(['inventario/listar']);
                            });
                        } else {
                            if(respuesta.valor == '-1') {
                                console.log(respuesta.descripcion)
                                Swal.fire('SICORE', 'Error al ingresar el registro.', 'error');
                            } 
                        }
                    },
                    error : (err) => {
                        console.error(err);
                        this._guardando = false;
                    }
                });

            } else {
                this._guardando = false;
                this.ref.detectChanges();
            }
        });

        
    }

    cantidadMenorCero() : boolean {
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value)
        if(cantidad < 1) {
            this._validarMayorCero = true;
            return true;
        } else return false;
    }

    cantidadMayorAlMaximo() : boolean {
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value)
        if(cantidad > 250000) {
            this._maximoPermitido = true;
            return true;
        } else return false;
    }

    cantidadUnicamenteNumero() : boolean {
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value);
        if(isNaN(cantidad)){
            this._esUnicamenteNumero = true;
            return true;
        } else return false;

    }

    entraCampoCantidad() {
        (<HTMLInputElement>document.getElementById('cantidad')).type = 'number';

        this._validarMayorCero = false;
        this._maximoPermitido = false;
        this._esUnicamenteNumero = false;
    }

    entraCampoComentario() {
        this._maximoYMinimo = false;
    }

    campoEsValido(campo: string) {
        return this.formInventario.controls[campo].errors && this.formInventario.controls[campo].touched;
    }

    validaCaracteresEspeciales(expresion : any) : boolean {
        const valor : string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        if(valor.length > 9) return false;

        if(expresion.charCode == 101) return false;
        else return true;
    }

    validaCantidadMinimaYMaxima() : boolean {
        const descripcion : string = (<HTMLInputElement>document.getElementById('descripcion')).value;

        if(descripcion.length < 3) {
            this._maximoYMinimo = true;
            return true;
        }

        if(descripcion.length > 100) {
            this._maximoYMinimo = true;
            return true;
        }

        return false;
    }

    salir() {
        this.router.navigate(['inventario/listar'])
    }
}

