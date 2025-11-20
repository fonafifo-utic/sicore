import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { InventarioServicio } from "../servicio/inventario.servicio";
import { iIngresaMovimiento, iInventario } from "../interfaces/iInventario";
import { iProyecto } from "../../proyecto/interfaces/iProyecto";
import { iLoginSalida } from "../../../../auth/login/ilogin";

@Component({
    selector: 'editar-inventario',
    templateUrl: 'inventario.editar.html',
    styleUrl: 'inventario.editar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditarInventario implements OnInit {

    private fb = inject(FormBuilder);
    private srv = inject(InventarioServicio);

    formInventario : FormGroup = this.fb.group({
        cantidad : ['', Validators.required],
        descripcion : ['', Validators.required]
    })

    _ubicaciones$! : Observable<iProyecto[]>;
    private idInventario! : number;
    private remanente! : number;
    private comprometido! : number;
    private idProyecto! : number;

    _validarMayorCero : boolean = false;
    _maximoPermitido : boolean = false;
    _maximoYMinimo : boolean = false;
    _guardando : boolean = false;
    _esUnicamenteNumero : boolean = false;
    _proyecto! : string;
    _cantidadNoPermitida : boolean = false;

    constructor(private router: Router, private route : ActivatedRoute, private ref : ChangeDetectorRef) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 6) && (perfil !== 9)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        this.idInventario = +this.route.snapshot.paramMap.get('id')!;
        this.traeInventarioSeleccionado();
    }
    
    traeInventarioSeleccionado() {
        this.srv.traeInventarioPorId(this.idInventario).subscribe({
            next : (inventario) => {
                (<HTMLInputElement>document.getElementById('proyecto')).value = inventario[0].proyecto;
                (<HTMLInputElement>document.getElementById('remanente')).value = inventario[0].remanente.toLocaleString('es-CR');
                
                this.remanente = Number(inventario[0].remanente);
                this.idProyecto = inventario[0].idProyecto;

                this.comprometido = this.remanente - Number(inventario[0].comprometido);
                (<HTMLInputElement>document.getElementById('comprometido')).value = this.comprometido.toLocaleString('es-CR');
            },
            error : (err) => console.error(err)
        })
    }

    OnSubmit() {
        if (this.formInventario.invalid) {
            this.formInventario.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(this.cantidadMayorAlMaximo()) return;
        if(this.validaCantidadMinimaYMaxima()) return;
        if(this.cantidadUnicamenteNumero()) return;
        if(this.cantidadNoPermitida()) return;

        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const cantidad : number = this.formInventario.controls['cantidad'].value;

        const inventario : iIngresaMovimiento = {
            idInventario : this.idInventario,
            cantidad : cantidad,
            descripcionMovimiento : this.formInventario.controls['descripcion'].value,
            idProyecto : this.idProyecto,
            idUsuario : valorSesion.idUsuario
        }

        const remanenteActual : number = Number(this.remanente) - Number(cantidad);

        Swal.fire({
            title: `Va a devolver ${this.formInventario.controls['cantidad'].value} ton CO2e`,
            text: "¿Confirma el cambio?",
            showCancelButton: true,
            confirmButtonText: "Confirmo"
        }).then((result) => {
            if (result.isConfirmed) {

                this.srv.actualizaInventario(inventario).subscribe({
                    next : (respuesta) => {
                        if(respuesta.valor == '1') {
                            Swal.fire("¡Aplicado!", `Remanente Anterior: ${this.remanente} tons CO2e, ahora: ${remanenteActual} tons CO2e`, "success").then(()=>{
                                this.router.navigate(['inventario/listar']);
                            });
                        } else {
                            if(respuesta.valor == '-1') {
                                console.log(respuesta.descripcion)
                                Swal.fire('SICORE', 'Error al ingresar el registro.', 'error');
                            } 
                        }
                    },
                    error : (err) => console.error(err)
                });
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
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value);
        if(cantidad > this.remanente) {
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

    cantidadNoPermitida() : boolean {
        console.log('entra')
        const cantidad : number = Number(this.formInventario.controls['cantidad'].value);
        console.log(this.remanente)
        console.log(this.comprometido)
        
        this.comprometido = this.remanente - this.comprometido;
        console.log(this.comprometido)

        if(this.comprometido < cantidad) {
            this._cantidadNoPermitida = true;
            return true;
        } else return false;
    }

    campoEsValido(campo: string) {
        return this.formInventario.controls[campo].errors && this.formInventario.controls[campo].touched;
    }

    validaCaracteresEspeciales(expresion : any) : boolean {
        if(expresion.keyCode == 45) return false;

        const valor : string = (<HTMLInputElement>document.getElementById('cantidad')).value;
        if(valor.length > 12) return false;

        if(expresion.charCode == 101) return false;
        else return true;
    }

    entraCampoCantidad() {
        this._validarMayorCero = false;
        this._maximoPermitido = false;
        this._esUnicamenteNumero = false;
        this._cantidadNoPermitida = false;
    }

    entraCampoComentario() {
        this._maximoYMinimo = false;
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

