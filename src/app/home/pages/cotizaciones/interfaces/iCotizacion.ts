export interface iCotizacion
{
    idCotizacion : number;
    idCliente : number;
    nombreCliente : string;
    cedulaCliente : string;
    contactoCliente : string;
    telefonoCliente : string;
    emailCliente : string;
    direccionFisica : string;
    sectorComercial : string;
    idUsuario : number;
    nombreCorto : string;
    idProyecto : number;
    proyecto : string;
    fechaHora : string;
    fechaExpiracion : string;
    cantidad : number;
    precioUnitario : number;
    subTotal : number;
    montoTotalColones : number;
    montoTotalDolares : number;
    consecutivo : number;
    anotaciones : string;
    indicadorEstado : string;
    cuentaConvenio : string;
    cotizacionEnIngles : number;
    tipoCambio : number;
    cantidadDiasEnviado : number;
    tipoCompra : string;
    justificacionCompra : string;
    observacionDeAprobacion : string;
    agenteCuenta : string;
    ucii : string;

}

export interface iCotizacionParaSalvar {
    idCotizacion : number;
    idCliente : number;
    idFuncionario : number;
    idProyecto : number;
    cantidad : number;
    precioUnitario : number;
    subTotal : number;
    montoTotalColones : number;
    montoTotalDolares : number;
    consecutivo : number;
    anotaciones : string;
    fechaExpiracion : string;
    cuentaConvenio : string;
    cotizacionEnIngles : number;
    tipoCompra : string;
    justificacionCompra : string;
}

export interface iAnulaCotizacion
{
    idCotizacion : number;
    idUsuario : number;
    descripcion : string;
}

export interface iValidaCotizacion
{
    idCotizacion : number;
    idUsuario : number;
    observacion : string;
}

export interface iExportacionArchivoCotizacion {
    idCotizacion : number;
    idFuncionario : number;
    idCliente : number;
    destinatario : string;
    consecutivo : string;
    archivo : any;
}

export interface iOpcionesParaAccion {
    opcion : string;
    claveOpcion : string;
}

export interface iTipoCompra {
    tipoCompra : string;
}

export interface iJustificaciones {
    justificacion : string;
}

export interface iCotizacionAgrupada {
    idAgrupacion : number;
    idCotizacion : number;
    idCliente : number;
    consecutivo : number;
    idFuncionario : number;
    fechaHora : string;
    indicadorEstado : string;
}

export interface iListaCotizacionesAgrupadas {
    consecutivo : number;
	nombreCorto : string;
	fechaHora : string;
	montoDolares : number;
	cantidad : number;
	cotizaciones : string;
    indicadorEstado : string;
}

export interface iActualizaIncadorEstadoAgrupacion {
    indicadorEstado : string;
    justificacion : string;
    idFuncionario : number;
    consecutivo : number;
}