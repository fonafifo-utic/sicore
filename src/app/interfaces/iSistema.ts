export interface ILogin{
    correoCedula:string,
    clave:string,
    idPersona:string,
    tipologin:string
}

export interface IResultadoMetodo{
    valor:string,
    descripcion:string,
}

export interface ModeloCorreo{
    asunto:string,
    cuerpoCorreo:string,
    correo:string,
    idPersonaEnvia:number,
}

export interface IEvento {
    idTraza : string;
    idUsuario : string;
    modulo : string;
    operacion : string;
    fechaTraza : string;
}