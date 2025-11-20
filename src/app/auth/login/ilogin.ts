export interface iUsuarioConfiguradoDFM
{
    mfa : iMfa;
    sms : iSms;
    correo : iCorreo;
}

export interface iEstaUsuarioConfiguradoDFM
{
    claveSecretaMFA : string;
}

export interface iMfa {
    habilitado : boolean;
    configurado : boolean;
}

export interface iSms {
    habilitado : boolean;
    configurado : boolean;
    celular : string;
}

export interface iCorreo {
    habilitado : boolean;
    configurado : boolean;
    correo : string;
}

export interface iConfigurarDFM {
    idUsuario : string;
    correoUsuario : string;
}

export interface iDesactivarDMF {
    idUsuario : string;
    nombreSistema : string;
}

export interface iRespuestaConfigurarDFM {
    success : string;
    mensaje : string;
    claveSecreta : string;
    qrUri : string;
}

export interface iActivaDFM {
    idUsuario : string;
    claveSecreta : string;
    codigoOTP : string;
}

export interface iRespuestaActivacionDFM {
    success : boolean;
    mensaje : string;
}

export interface iVerificaCodigoOTP {
    idUsuario : string;
    codigoOTP : string;
}

export interface iLoginIngreso
{
    correoCedula : string;
    clave : string;
}

export interface iLoginSalida
{
    nombreCompleto : string;
    idPersona : number;
    idUsuario : number;
    correoUsuario : string;
    correoNotificaciones : string;
    requiereActualizar : string;
    telefonoMovil : string;
    telefonoFijoTrabajo : string;
    idPerfil : number;
    perfil : string;
    token : string;
    menu : string;
}

//-------------//

export interface IUsuarioLogin{
    idUsuario:string,
    idPersona:string,
    nombreCompleto:string,
    tipoUsuario:string,
    idOficinaRegional:string,
    nombreOficinaRegional:string,    
    token:string,
    correo:string
    requiereactualizar:string,
    essuperusuario:string,
    telefonoMovil:string,
    nombre:string,
    primerApeliido:string,
    segundoApellido:string,
    documentoId:string,
    correoUsuario:string,
    clave:string,
    perfilUsuario:IPerfil,
    requiereCambiarUsuario:string,
    numeroCarne:string,
    poliza:string,
    fechaPoliza:string,
    colegiaturaVigente:string,
    aceptaSMS:string,
    dobleFactorOff:string
}

export interface IPerfil {
    idPerfil : number;
    nombre : string;
    descripcion : string;
    doCRUDUsuarios : string;
}

export interface IParamLogin_ClienteTask {
    correoCedula : string;
    clave : string;
    tipoLogin : string;
    documentoId : string;
    idUsuario : string;
    idPerfil : string;
    idPersona : string;
    telefonoMovil : string;
    claveActual : string;
}

export interface ILogin {
    correoCedula : string;
    clave : string;
    tipologin : string;
    documentoId : string;
    idUsuario : string;
    idPerfil : string;
    idPersona : string;
    telefonoMovil : string;
    claveActual : string;
}
