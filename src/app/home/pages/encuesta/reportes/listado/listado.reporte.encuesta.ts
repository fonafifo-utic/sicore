import { Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { EncuestaServicio } from "../../servicio/encuesta.servicio";
import { Observable } from "rxjs";
import { iRespuestasListadoMes } from "../../interfaces/iEncuesta";
import { Table } from "primeng/table";

@Component({
    selector : 'listado-general-encuesta',
    templateUrl : 'listado.reporte.encuesta.html',
    styleUrl : 'listado.reporte.encuesta.css',
    standalone : true,
    imports : [PrimeNgModule, CommonModule]
})

export class ListadoGeneralEncuesta implements OnInit {

    private srv = inject(EncuestaServicio);
    _listadoPorMes$! : Observable<iRespuestasListadoMes[]>
    _columnas : any[] = [];

    listadoRespuestas! : iRespuestasListadoMes[];

    constructor () {}

    ngOnInit(): void {
        this.traeReporte();
    }

    traeReporte() {
        this._columnas = [
            { campo :  'nombreCliente', encabezado : 'Cliente' },
            { campo :  'pregunta', encabezado : 'Pregunta' },
            { campo :  'respuesta', encabezado : 'Respuesta' },
            { campo :  'fecha', encabezado : 'Fecha' },
            { campo :  'hora', encabezado : 'Hora' }
        ];

        this._listadoPorMes$ = this.srv.obtenerListadoRespuestasEnviadasMes();
            this._listadoPorMes$.subscribe({
                next : (listado) => {
                    this.listadoRespuestas = listado;
                }
            })

    }
    
    filtroGlobal(table : Table, event : Event){
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    esRating(idReporte : number) : boolean {
        const respuesta = this.listadoRespuestas.filter(item => item.idReporte == idReporte)[0];

        if(!isNaN(Number(respuesta.respuesta))) return true;
        else return false;
    }

    creaNumeroCertificado(numeroCertificado : number) : string {
        const hoy : Date = new Date();
        const anno : string = hoy.getFullYear().toString();
        
        return `${anno}-${this.colocaCerosAlNumeroEntero(numeroCertificado)}` 
    }

    colocaCerosAlNumeroEntero(numero : number) : string {
        let numeroConFormato : string = '';
        switch(numero.toString().length) {
            case 1:
                numeroConFormato = '00' + numero.toString();
                break;
            case 2:
                numeroConFormato = '0' + numero.toString();
                break;
        }

        return numeroConFormato;
    }
}