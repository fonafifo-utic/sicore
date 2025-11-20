export interface iTipo {
    clave : string;
    tipo : string;
}

export interface iPreguntasTemporal {
    pregunta : string;
    tipo : string;
}

export interface iRespuestasTemporal {
    respuesta : string;
    valorPeso : string;
}

export interface iPregunta {
    idPregunta : number;
    idFuncionario : number;
    pregunta : string;
    tipo : string;
    respuestas : iRespuestasTemporal [];
}

export interface iPreguntas {
    idPregunta : number;
    pregunta : string;
    tipo : string;
    estado : string;
}

export interface iRespuestas {
    idRespuesta : number;
    idPregunta : number;
    pregunta : string;
    tipoPregunta : string;
    respuesta : string;
    valorRespuesta : string;
}

export interface iEncuesta
{
    idEncuesta : number;
    idPregunta : number;
    idFuncionario : number;
}

export interface iVistaEncuesta {
    idPregunta : number;
    idRespuesta : number;
    tipoPregunta : string;
    pregunta : string;
    respuestaOpcion : string;
    valorRespuesta : string;
}

export interface iListaEncuesta {
    idEncuesta : number;
    idPregunta : number;
    pregunta : string;
    tipoPregunta : string;
}

export interface iListadoPreguntas {
    idPregunta : number;
    pregunta : string;
}

export interface iRespuestasEncuesta {
    idCliente : number;
    pregunta : string;
    respuesta : string;
    valor : number;
    fechaHoraRespuesta : string;
}

export interface iRespuestasTipoRating {
    pregunta : string;
    valorRespuesta : number;
}

export interface iRespuestasTipoSeleccion {
    pregunta : string;
    opcionRespuesta : string;
}

export interface iRespuestasTipoAbierta {
    pregunta : string;
    respuesta : string;
}

export interface iDataGrafico {
    pregunta : string;
    respuesta : string;
    conteo : number;
}

export interface iRespuestasListadoMes {
    idReporte : number;
    nombreCliente : string;
    pregunta : string;
    respuesta : string;
    fecha : string;
    hora : string;
    numeroCertificado : number;
}

export interface iEncuestaEnviada
{
    idTrazaEncuesta : number;
    idCliente : number;
    emailCliente : string;
    nombreCliente : string;
    numeroCertificado : number;
    usuario : string;
    fechaHoraEnvio : string;
    estado : string;
    idCotizacion : number;
    conteoEnvios : number;
}

export interface iEncuestaPendiente
{
    idTrazaEncuesta : number;
    nombreCliente : string;
    numeroCertificado : number;
    fecha : string;
    hora : string;
}

export interface iRespuestaEncuestaEnviada
{
    idReporte : number;
    pregunta : string;
    respuesta : string;
    fecha : string;
    hora : string;
}