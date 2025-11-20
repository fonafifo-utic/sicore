import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PrimeNgModule } from "../../../shared/prime-ng.module";


@Component({
    selector : 'no-encontrado',
    templateUrl : 'noEncontrado.html',
    styleUrl : 'noEncontrado.css',
    imports : [PrimeNgModule, PdfViewerModule],
    standalone : true
})

export class NoEncontrado {

    _mostrarManual : boolean = false;
    _urlDelPDF! : string;

    constructor(private router : Router) {}

    vaManualUsuario() {
        this._mostrarManual = true;
        this._urlDelPDF = environment.enlaceParaManual;
        //window.open(environment.enlaceParaManual, '_blank');
    }


}