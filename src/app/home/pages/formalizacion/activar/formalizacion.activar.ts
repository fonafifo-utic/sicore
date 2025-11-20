import { Component, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { ActivatedRoute } from "@angular/router";
import { FormalizacionServicio } from "../servicio/formalizacion.servicio";
import { iActualizaFormalizacion } from "../interfaces/iFormalizacion";
import Swal from "sweetalert2";


@Component({
    selector : 'activar-formalizacion',
    templateUrl : 'formalizacion.activar.html',
    styleUrl : 'formalizacion.activar.css',
    imports : [PrimeNgModule],
    standalone : true
})

export class ActivaFormalizacion implements OnInit {
    constructor(private ruta : ActivatedRoute, private sevicioFormalizacion : FormalizacionServicio) {}

    _numeroCotizacion! : string;

    ngOnInit(): void {
        this.activarFormalizacion();
    }

    activarFormalizacion() {
        this._numeroCotizacion = this.ruta.snapshot.paramMap.get('id')!;
        const consecutivo : number = Number(this._numeroCotizacion.split('-')[2])

        const activaFormalizacion : iActualizaFormalizacion = {
            consecutivo : consecutivo,
            idFormalizacion : '0',
            idUsuario : 0,
            indicadorEstado : '',
            numeroComprobante : '',
            numeroFactura : '',
            numeroTransferencia : '',
            tieneFacturas : '',
            justificacionActivacion : ''
        }

        this.sevicioFormalizacion.activaRevisionDeFormalizacion(activaFormalizacion).subscribe({
            next : respuesta => {
                console.log(respuesta)
                if(respuesta.valor == '1') {
                    Swal.fire(`Solicitud activada`, ``, "success");
                }
            },
            error : err => console.log(err)
        })
    }
}