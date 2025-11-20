import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { PrimeNgModule } from "../../../../shared/prime-ng.module";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import Swal from "sweetalert2";
import { ClienteServicio } from "../servicio/cliente.servicio";
import { iActividadComercial, iClasificacion, iCliente, iFuncionario, iFuncionarios, iSector, iTipoEmpresa } from "../interfaces/iCliente";
import { iLoginSalida } from "../../../../auth/login/ilogin";

interface ilistaEmailsCedulas {
    cedula : string;
    email : string;
}

@Component({
    selector: 'editar-cliente',
    templateUrl: 'cliente.editar.html',
    styleUrl: 'cliente.editar.css',
    standalone: true,
    imports: [PrimeNgModule, CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditarCliente implements OnInit {

    private fb = inject(FormBuilder);
    private srv = inject(ClienteServicio);
    private clientes! : Observable<iCliente[]>;
    private listaEmailsCedulas : ilistaEmailsCedulas[] = [];

    formCliente : FormGroup = this.fb.group({
        idSector : ['', Validators.required],
        idTipoEmpresa : [''],
        nombreCliente : ['', Validators.required],
        nombreComercial : ['', Validators.required],
        cedulaCliente : ['', Validators.required],
        contactoCliente : ['', Validators.required],
        telefonoCliente : [''],
        emailCliente : ['', Validators.email],
        direccionFisica : ['', Validators.required],
        clasificacion : [''],
        telefonoClienteDo : [''],
        contactoContador : [''],
        emailContador : [''],
        idAgente : [''],
        ucii : ['', Validators.required]
    })

    _sectores$! : Observable<iSector[]>;
    _actividades$! : Observable<iActividadComercial[]>;
    _tipos$! : Observable<iTipoEmpresa[]>;
    _clasificacion$! : Observable<iClasificacion[]>;
    _funcionarios$! : Observable<iFuncionario[]>;

    idCliente! : number;

    clasificacionElegida! : iClasificacion;
    _validaEmail : boolean = false;
    _guardando : boolean = false;
    _habilitarAplicar : boolean = true;
    _longitudIncorrecta : boolean = false;
    _longitudIncorrectaDo : boolean = false;
    _numeroInicialIncorrecto : boolean = false;
    _numeroInicialIncorrectoDo : boolean = false;
    _caracteresMinimosMaximos : boolean = false;
    _caracteresMinimosMaximosComercial : boolean = false;
    _caracteresMinimosMaximosDireccion : boolean = false;
    _caracteresMinimosMaximosContacto : boolean = false;
    _longitudIncorrectaCedula : boolean = false;
    _cedulaExiste : boolean = false;
    _esExtranjero : boolean = false;
    _maximoPermitidoCedula : number = 10;
    _validaEmailContador : boolean = false;
    _esCIIUExtranjero : boolean = false;

    private regexValido = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

    _vieneDesdeCotizacion : boolean = false;

    private esGestor : boolean = false;

    _esRequeridoComprobante : boolean = false;
    _esFormatoIncorrecto : boolean = false;

    constructor(private router: Router, private route : ActivatedRoute) {
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const perfil : number = valorSesion.idPerfil;
        
        if((perfil !== 1) && (perfil !== 2) && (perfil !== 4) && (perfil !== 6) && (perfil !== 7)) this.router.navigate(['no-encontrado'])
    }

    ngOnInit(): void {
        if(this.route.snapshot.component?.name === '_EditarCotizacion') {
            this.idCliente = this.srv.getIdCliente()!
            this._vieneDesdeCotizacion = true;
            this.condicionesIniciales();
        } else {
            if(this.route.snapshot.paramMap.get('id') != null) {
                this.idCliente = Number(this.route.snapshot.paramMap.get('id')!);
                this._vieneDesdeCotizacion = false;
                this.condicionesIniciales();        
            } else {
                if(this.srv.getIdCliente() == null) {
                    return;
                } else {
                    this.idCliente = this.srv.getIdCliente()!
                    this._vieneDesdeCotizacion = true;
                    this.condicionesIniciales();
                }
            }
        }
    }

    condicionesIniciales() {
        this.traeTodosSectores();
        this.traeClasificacion();
        this.traeTodosLosClientes();
        this.traeTodosLosFuncionarios();

        this.traeClienteElegido();
        this._habilitarAplicar = false;
    }

    traeClienteElegido(){
        this.srv.traeClientePorId(this.idCliente).subscribe({
            next : (clienteElegido) => {
                const cliente : iCliente = clienteElegido[0];

                const telefonoPrincipal : string = cliente.telefonoCliente.split(';')[0];
                const telefonoSecundario : string = cliente.telefonoCliente.split(';')[1];

                if(isNaN(Number(cliente.cedulaCliente))) {
                    this._esExtranjero = true;
                    this._maximoPermitidoCedula = 25;
                    (<HTMLInputElement>document.getElementById('cedulaCliente')).type = 'text';
                    (<HTMLInputElement>document.getElementById('ckExtranjero')).checked = true;
                }

                this.formCliente.controls['cedulaCliente'].setValue(cliente.cedulaCliente);
                this.formCliente.controls['contactoCliente'].setValue(cliente.contactoCliente);
                this.formCliente.controls['direccionFisica'].setValue(cliente.direccionFisica);
                this.formCliente.controls['emailCliente'].setValue(cliente.emailCliente);
                this.formCliente.controls['idSector'].setValue(cliente.idSector);
                this.formCliente.controls['nombreCliente'].setValue(cliente.nombreCliente);
                this.formCliente.controls['telefonoCliente'].setValue(telefonoPrincipal);
                this.formCliente.controls['telefonoClienteDo'].setValue(telefonoSecundario);
                this.formCliente.controls['nombreComercial'].setValue(cliente.nombreComercial);
                this.formCliente.controls['clasificacion'].setValue(cliente.clasificacion.trim());
                this.formCliente.controls['idTipoEmpresa'].setValue(cliente.idTipoEmpresa);
                this.formCliente.controls['contactoContador'].setValue(cliente.contactoContador);
                this.formCliente.controls['emailContador'].setValue(cliente.emailContador);
                this.formCliente.controls['idAgente'].setValue(cliente.idAgente);
                
                if(cliente.ucii == 'EXT')  {
                    this._esCIIUExtranjero = true;
                    this.formCliente.get('ucii')?.disable();
                    this.formCliente.controls['ucii'].setValue(cliente.ucii);
                    (<HTMLInputElement>document.getElementById('ckCIIUExtranjero')).checked = true;
                } else {
                    this._esCIIUExtranjero = false;
                    this.formCliente.get('ucii')?.enable();
                    this.formCliente.controls['ucii'].setValue(cliente.ucii);
                    (<HTMLInputElement>document.getElementById('ckCIIUExtranjero')).checked = false;
                }
        
                this.esGestor = cliente.esGestor == 'S' ? true : false;
                (<HTMLInputElement>document.getElementById('ckGestor')).checked = this.esGestor;
                
                this.saleFocoCedula();
                this.saleFocoTelefono();
                //this.saleFocoTelefonoDo();
            }
        })
    }

    traeTodosSectores(){
        this._sectores$ = this.srv.traeTodosSectoresCompleto();
    }

    traeTodosTipos(){
        this._tipos$ = this.srv.traeTodosTiposEmpresa();
    }

    seleccionaSectorComercial(evento : any) {
        this._tipos$ = this.srv.traeTiposEmpresaPorId(evento.value);
    }

    traeClasificacion(){
        this._clasificacion$ = this.srv.traeClasificacionCliente();
    }

    traeTodosLosClientes() {
        this.clientes = this.srv.traeTodosClientes();
        this.clientes.subscribe({
            next : (clientes) => {
                clientes.forEach(item => {
                    const cliente : ilistaEmailsCedulas = {
                        cedula : item.cedulaCliente,
                        email : item.emailCliente
                    };

                    this.listaEmailsCedulas.push(cliente);
                })
            }
        })
    }

    traeTodosLosFuncionarios() {
        this._funcionarios$ = this.srv.traeFuncionarios();
    }

    OnSubmit() {
        if (this.formCliente.invalid) {
            this._habilitarAplicar = true;
            this.formCliente.markAllAsTouched();
            Swal.fire('SICORE', 'ATENCIÓN: Estimado usuario, favor ingresar todos los datos solicitados.', 'warning');
            return;
        }

        if(this.validacionMaximoMinimo()) return;

        if(this._validaEmail) return;
        if(this._longitudIncorrecta) return;
        if(this._longitudIncorrectaDo) return;

        let telefonoCliente = this.formCliente.controls['telefonoCliente'].value;
        if(telefonoCliente != '') telefonoCliente = this.daFormato(telefonoCliente);

        const cedulaCliente = this.daFormato(this.formCliente.controls['cedulaCliente'].value);
        //const doTelefonoCliente = this.daFormato(this.formCliente.controls['telefonoClienteDo'].value);
        const valorSesion : iLoginSalida = JSON.parse(sessionStorage.getItem('token')!);
        const idFuncionario : number = valorSesion.idUsuario;
        const email = this.formCliente.controls['emailCliente'].value;
        let idAgente : number = Number(this.formCliente.controls['idAgente'].value);

        if(this.numerosValidosAlInicio(telefonoCliente)) {
            this._numeroInicialIncorrecto = true;
            return;
        }

        // if(doTelefonoCliente != '') {
        //     if(this.numerosValidosAlInicio(doTelefonoCliente)) {
        //         this._numeroInicialIncorrectoDo = true;
        //         return;
        //     }
        // }

        this._guardando = true;
        
        const cliente : iCliente = {
            cedulaCliente : cedulaCliente,
            contactoCliente : this.formCliente.controls['contactoCliente'].value,
            direccionFisica : this.formCliente.controls['direccionFisica'].value,
            emailCliente : email,
            idSector : this.formCliente.controls['idSector'].value,
            nombreCliente : this.formCliente.controls['nombreCliente'].value,
            telefonoCliente : telefonoCliente,
            sectorComercial : '',
            idCliente : this.idCliente,
            actividadCormercial : '',
            clasificacion : this.formCliente.controls['clasificacion'].value,
            idActividadComercial : 0,
            idTipoEmpresa : 0,
            nombreComercial : this.formCliente.controls['nombreComercial'].value,
            TipoEmpresa : '',
            idFuncionario : idFuncionario,
            indicadorEstado : 'A',
            cotizacionesAsociadas : 0,
            contactoContador : this.formCliente.controls['contactoContador'].value,
            emailContador : this.formCliente.controls['emailContador'].value,
            esGestor : this.esGestor == true ? 'S' : 'N',
            idAgente : idAgente == 0 ? idFuncionario : idAgente,
            ucii : this.formCliente.controls['ucii'].value
        }

        this.srv.actualizarUnCliente(cliente).subscribe({
            next : (respuesta) => {
                this._guardando = false;
                if(respuesta.valor == '1') {
                    this.srv.setTerminaEdicionCotizacion(false);
                    Swal.fire('SICORE','El registro se guardó exitosamente','success').then(()=>{
                        if(!this._vieneDesdeCotizacion) this.router.navigate(['cliente/listar']);
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

    validacionMaximoMinimo() : boolean {
        const nombreCliente = (<HTMLInputElement>document.getElementById('nombreCliente')).value;
        const nombreComercial = (<HTMLInputElement>document.getElementById('nombreComercial')).value;
        const contactoCliente = (<HTMLInputElement>document.getElementById('contactoCliente')).value;
        const direccionFisica = (<HTMLInputElement>document.getElementById('direccionFisica')).value;
        
        if(nombreCliente.length < 3) {
            this._caracteresMinimosMaximos = true;
            return true;
        }

        if(nombreCliente.length > 100) {
            this._caracteresMinimosMaximos = true;
            return true;
        }

        if(nombreComercial.length < 3) {
            this._caracteresMinimosMaximosComercial = true;
            return true;
        }

        if(nombreComercial.length > 100) {
            this._caracteresMinimosMaximosComercial = true;
            return true;
        }

        if(contactoCliente.length < 3) {
            this._caracteresMinimosMaximosContacto = true;
            return true;
        }

        if(contactoCliente.length > 100) {
            this._caracteresMinimosMaximosContacto = true;
            return true;
        }

        if(direccionFisica.length < 3) {
            this._caracteresMinimosMaximosDireccion = true;
            return true;
        }

        if(direccionFisica.length > 100) {
            this._caracteresMinimosMaximosDireccion = true;
            return true;
        }

        return false;
    }

    entraNombreEmpresa() {
        this._caracteresMinimosMaximos = false;
    }

    entraNombreComercial() {
        this._caracteresMinimosMaximosComercial = false;
    }

    entraNombreContacto() {
        this._caracteresMinimosMaximosContacto = false;
    }

    entraDireccion() {
        this._caracteresMinimosMaximosDireccion = false;    
    }

    entraComprobante() {
        this._esRequeridoComprobante = false;
        this._esFormatoIncorrecto = false;
    }

    validaComprobantes() {
        if(!document.getElementById('codigoCIUU')) return;

        const codigo : string = (<HTMLInputElement>document.getElementById('codigoCIUU')).value;

        if(codigo == '') {
            this._esRequeridoComprobante = true;
            return;
        }

        if (!codigo.includes('.')) {
            this._esFormatoIncorrecto = true;
            return;
        }

        for (let i = 0; i < codigo.length; i++) {
            const caracter = codigo[i];
            if (!(/[a-zA-Z0-9]/.test(caracter)) && caracter !== '.') {
                this._esFormatoIncorrecto = true;
                return;
            }
        }

    }

    daFormato(valorString : string) : string {
        while (valorString.includes('-')){
            valorString = valorString.replace('-','');
        }

        return valorString;
    }

    campoEsValido(campo: string) {
        return this.formCliente.controls[campo].errors && this.formCliente.controls[campo].touched;
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

    numerosValidosAlInicio(valorIngresado : string)  : boolean {
        const numerosInvalidos : number [] = [0, 1, 9];

        return numerosInvalidos.some(item => item == Number(valorIngresado.substring(0,1)));
    }

    poneFocoCedula(){        
        this._longitudIncorrectaCedula = false;

        if(!this._esExtranjero) {
            let valorCedula : string = (<HTMLInputElement>document.getElementById('cedulaCliente')).value;
            (<HTMLInputElement>document.getElementById('cedulaCliente')).type = 'number';

            while (valorCedula.includes('-')){
                valorCedula = valorCedula.replace('-','');
            }
    
            (<HTMLInputElement>document.getElementById('cedulaCliente')).value = valorCedula;
        }
    }

    seleccionaExtranjero(e : any) {
        this._esExtranjero = e.target.checked;
        this._maximoPermitidoCedula = 25;
        (<HTMLInputElement>document.getElementById('cedulaCliente')).type = 'text';
    }

    seleccionaCIIUExtranjero(e : any) {
        this._esCIIUExtranjero = e.target.checked;

        if(this._esCIIUExtranjero) {
            this.formCliente.get('ucii')?.disable();
            (<HTMLInputElement>document.getElementById('ckCIIUExtranjero')).checked = true;
        } else {
            this.formCliente.get('ucii')?.enable();
            (<HTMLInputElement>document.getElementById('ckCIIUExtranjero')).checked = false;
        }
    }
    
    saleFocoCedula() {
        if(!this._esExtranjero) {
            (<HTMLInputElement>document.getElementById('cedulaCliente')).type = 'text';
            
            let valorCedula : string = (<HTMLInputElement>document.getElementById('cedulaCliente')).value;
            
            if(valorCedula.length < 10) {
                this._longitudIncorrectaCedula = true;
                return;
            }
    
            let nuevoValorCedula : string = '';
            
            nuevoValorCedula = valorCedula.substring(1,0) + '-' + valorCedula.substring(1,4) + '-' + valorCedula.substring(4,valorCedula.length);
    
            (<HTMLInputElement>document.getElementById('cedulaCliente')).value = nuevoValorCedula;
        }
    }

    poneFocoTelefono() {
        let valorTelefono : string = (<HTMLInputElement>document.getElementById('telefonoCliente')).value;
        (<HTMLInputElement>document.getElementById('telefonoCliente')).type = 'number';

        this._longitudIncorrecta = false;
        this._numeroInicialIncorrecto = false;
        
        while (valorTelefono.includes('-')){
            valorTelefono = valorTelefono.replace('-','');
        }

        (<HTMLInputElement>document.getElementById('telefonoCliente')).value = valorTelefono;
    }

    poneFocoTelefonoDo() {
        let telefonoClienteDo : string = (<HTMLInputElement>document.getElementById('telefonoClienteDo')).value;
        (<HTMLInputElement>document.getElementById('telefonoClienteDo')).type = 'number';

        this._longitudIncorrectaDo = false;
        this._numeroInicialIncorrectoDo = false;
        
        while (telefonoClienteDo.includes('-')){
            telefonoClienteDo = telefonoClienteDo.replace('-','');
        }

        (<HTMLInputElement>document.getElementById('telefonoClienteDo')).value = telefonoClienteDo;
    }

    saleFocoTelefono() {
        (<HTMLInputElement>document.getElementById('telefonoCliente')).type = 'text';

        const telefonoCliente : string = (<HTMLInputElement>document.getElementById('telefonoCliente')).value;

        if(telefonoCliente == '') return;
        
        if(!this.validaCantidadDigitos(telefonoCliente)) {
            this._longitudIncorrecta = true;
            return;
        }

        if(this.numerosValidosAlInicio(telefonoCliente)) {
            this._numeroInicialIncorrecto = true;
            return;
        }

        let nuevoValortelefonoCliente : string = '';
        
        nuevoValortelefonoCliente = telefonoCliente.substring(0,4) + '-' + telefonoCliente.substring(4, telefonoCliente.length);

        (<HTMLInputElement>document.getElementById('telefonoCliente')).value = nuevoValortelefonoCliente;
    }

    saleFocoTelefonoDo() {
        (<HTMLInputElement>document.getElementById('telefonoClienteDo')).type = 'text';

        let telefonoClienteDo : string = (<HTMLInputElement>document.getElementById('telefonoClienteDo')).value;
        
        if(telefonoClienteDo == '') return;

        if(!this.validaCantidadDigitos(telefonoClienteDo)) {
            this._longitudIncorrectaDo = true;
            return;
        }

        if(this.numerosValidosAlInicio(telefonoClienteDo)) {
            this._numeroInicialIncorrectoDo = true;
            return;
        }

        let nuevoValortelefonoClienteDo : string = '';
        
        nuevoValortelefonoClienteDo = telefonoClienteDo.substring(0,4) + '-' + telefonoClienteDo.substring(4, telefonoClienteDo.length);

        (<HTMLInputElement>document.getElementById('telefonoClienteDo')).value = nuevoValortelefonoClienteDo;
    }

    validaCantidadDigitos(telefono : string) : boolean {
        telefono = telefono.replace('-','');
        
        if(telefono.length < 8) return false;
        else return true;
    }

    validaCedulaOrEmailRepetidos(dato : string) : boolean {
        let coincidencia = this.listaEmailsCedulas.filter(item => item.email === dato);
        if(coincidencia.length > 0) return true;

        coincidencia = this.listaEmailsCedulas.filter(item => item.cedula === dato);
        if(coincidencia.length > 0) return true;

        return false;
    }

    saleFocoEmailContador() {
        let valorEmail : string = (<HTMLInputElement>document.getElementById('emailContador')).value;

        if(this.regexValido.test(valorEmail)) this._validaEmailContador = false;
        else this._validaEmailContador = true;

        if(this._validaEmailContador) this._habilitarAplicar = true;
        else this._habilitarAplicar = false;
    }

    entraFocoEmailContador() {
        this._validaEmail = false;
    }

    entraFocoEmail() {
        this._validaEmail = false;
    }

    saleFocoEmail() {
        let valorEmail : string = (<HTMLInputElement>document.getElementById('emailCliente')).value;

        if(this.regexValido.test(valorEmail)) this._validaEmail = false;
        else this._validaEmail = true;

        if(this._validaEmail) this._habilitarAplicar = true;
        else this._habilitarAplicar = false;
    }

    saleDelFocoDireccion() {
        this._habilitarAplicar = false;
    }

    salir() {
        this.router.navigate(['cliente/listar'])
    }

    seleccionaGestor(e : any) {
        this.esGestor = e.target.checked;
    }
}