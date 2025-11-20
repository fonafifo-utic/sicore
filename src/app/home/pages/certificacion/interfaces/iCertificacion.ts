export interface iCertificado
{
    idCertificado : string;
    idFormalizacion : string;
    idCotizacion : string;
    idFuncionario : string;
    idCliente : string;
    usuario : string;
    numeroCertificado : number;
    nombreCertificado : string;
    fechaEmisionCertificado : string;
    cedulaJuridicaComprador : string;
    montoTransferencia : string;
    numeroTransferencia : string;
    fechaTransferencia : string;
    annoInventarioGEI : number;
    consecutivo : string;
    nombreArchivo : string;
    anotaciones : string;
    numeroIdentificacionUnico : string; //
    indicadorEstado : string;
}

export interface iOpcionesParaAccion {
    opcion : string;
    claveOpcion : string;
}

export interface iVistaCertificado {
    usuario : string;
    emailUsuario : string;
    numeroCertificado : string;
    nombreCertificado : string;
    fechaEmisionCertificado : string;
    cedulaJuridicaComprador : string;
    montoTransferencia : number;
    numeroTransferencia : string;
    fechaTransferencia : string;
    annoInventarioGEI : string;
    cantidad : number;
    cuentaConvenio : string;
    proyecto : string;
    periodo : number;
    anotaciones : string;
    directorEjecutivo : string;
    observaciones : string;
    numeroIdentificacionUnico : string;
    cssCertificado : string;
    enIngles : string;
    indicadorEstado : string;
    justificacionEdicion : string;
    numeroCertificadoUnico : string;
}

export interface iSubirCertificadoFirmado {
	idCertificado : number;
	idFuncionario : number;
	cotizacion : string;
	extension : string;
	archivo : any;
}

export interface iSubirArchivoAlExpediente {
	idFuncionario : number;
	nombreArchivo : string;
	extension : string;
	archivo : any;
}

export interface iRutaCertificado {
    ruta : string;
}

export interface iOpcionesParaEnviarCertificado {
    asunto : string;
    destinatario : string;
    enlace : string;
    enlaceEncuesta : string;
    numeroCertificado : string;
    idFuncionario : number;
    idCotizacion : number;
    enviaEncuesta : boolean;
}

export interface iPoneObservacionesAlCertificado
{
    idFuncionario : number;
    idCertificado : string;
    observacion : string;
    nombreCertificado : string;
    cedulaJuridica : string;
    numeroTransferencia : string;
    justificacionEdicion : string;
    cssCertificado : string;
    indicadorEstado : string;
    enIngles : string;
}

export interface iListadoRespuestasPorAnno
{
    formulariosRespondidos : number;
    formulariosEnviados : number;
}