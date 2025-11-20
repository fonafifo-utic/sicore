import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
    providedIn : 'root'
})

export class CanActivate implements CanActivate {
    
    constructor(private router : Router, private servicio : AuthService) {}

    canActivate (route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> {
        return this.servicio.VerificaAutenticacion().pipe(tap(estAutenticado=>{
            if(!estAutenticado) this.router.navigate(['login']);
        }))
    }

    // export const adminGuard: CanActivateFn = (route, state) => {
    //     return inject(RbacService).isGranted(Roles.ADMINISTRATOR);
    //   };

}