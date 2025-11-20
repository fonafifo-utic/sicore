export interface iUsuarioParaRegistro {
    idUsuario : number;
	usuario : string;
	documentoID : string;
	nombre : string;
	primerApellido : string;
	segundoApellido : string;
}

export interface iUsuarioElegidoParaRegistrar {
    idUsuario : number;
    idPerfil : number;
}

export interface iUsuarioVista {
    idUsuario : number;
    idPerfil : number;
    perfil : string;
	descripcionPerfil : string;
    idPersona : number;
    usuario : string;
    indicadorEstado : string;
    fechaVenceClave : string;
    documentoID : string;
    nombre : string;
    primerApellido : string;
    segundoApellido : string;
    indicadorGenero : string;
    cantidadUsuarios : number;
    telefonoFijoTrabajo : string;
}

export interface iParamAdminUsuario {
    idPerfil : string;
    usuario : string;
    documentoId : string;
    idUsuario : string;
    idUsuarioLogin : string;
    correo : string;
    telefonoMovil : string;
    idPersonaFun : string;
}

export interface iUsuarioSugerido {
    nombre : string;
    correo : string;
    telefonoMovil : string;
    idPerfil : number;
}

export interface IPerfil
{
    idPerfil : number;
    nombre : string;
    descripcion : string;
}