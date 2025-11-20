import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Seguridad } from "./seguridad";
import { IUsuarioLogin } from "../../auth/login/ilogin";

@Directive({
    selector : '[estaAutorizado]'
})

export class EstaAutorizadoDirectiva implements OnInit {
    
    private servicio = inject(Seguridad);
    private usuario! : IUsuarioLogin;
    private permisos! : string;
    private tempRef = inject(TemplateRef);
    private contenedorRef = inject(ViewContainerRef);

    @Input() set estaPermitido(rol : string) {
        this.permisos = rol;
    }

    @Input('estaPermitido') set estaPermitidoPara(usuario : IUsuarioLogin){
        this.usuario = usuario;
    }

    ngOnInit(): void {
        if(this.servicio.estaPermitido(this.permisos, this.usuario)){
            this.contenedorRef.clear();
            this.contenedorRef.createEmbeddedView(this.tempRef);
        }
    }
}