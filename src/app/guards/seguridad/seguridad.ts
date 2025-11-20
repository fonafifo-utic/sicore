import { Injectable } from "@angular/core";
import { IPerfil, IUsuarioLogin } from "../../auth/login/ilogin";

@Injectable({
    providedIn : 'root'
})

export class Seguridad {
    private _roles = new Map();
    private _usuarioLogueado! : IUsuarioLogin;
    
    setRoles(listaRoles : IPerfil[]){
        for(const rol of listaRoles){
            this._roles.set(rol.nombre, this._flatten(rol, listaRoles))
        }
    }

    setUsuarioLogueado(usuario : IUsuarioLogin){
        this._usuarioLogueado = usuario;
    }

    estaPermitido(rol : string, usuario : IUsuarioLogin) : boolean {
        if(!usuario) {
            usuario = this._usuarioLogueado;
        }

        if(!usuario) {
            return false;
        }

        if(!this._roles.has(usuario.perfilUsuario.nombre)){
            return false;
        }

        return this._roles.get(usuario.perfilUsuario.nombre).includes(rol);
    }

    private _flatten (paraRol : IPerfil, listaRoles : IPerfil[]){
        let resultados : string [] = [paraRol.nombre];

        for(const rol of listaRoles) {
            if (paraRol.idPerfil === rol.idPerfil) {
                const rolPadre = listaRoles.find(item => item.idPerfil === paraRol.idPerfil);

                if(rolPadre){
                    resultados = [...resultados, ...this._flatten(rolPadre, listaRoles)];
                }
            }
        }

        return resultados;
    }
}