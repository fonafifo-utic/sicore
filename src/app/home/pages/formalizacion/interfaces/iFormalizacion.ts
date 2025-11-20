export interface iFormalizacion {
    idFormalizacion : string;
    idCotizacion : string;
    idCliente : string;
    cedulaCliente : string;
    nombreCliente : string;
    nombreComercial : string;
    fechaHora : string;
    montoDolares : number;
    montoColones : number;
    consecutivo : number;
    numeroFacturaFonafifo : string;
    numeroTransferencia : string;
	numeroComprobante : string;
    indicadorEstado : string;
    creditoDebito : string;
    idUsuario : string;
    usuario : string;
	tieneFacturas : string;
	tipoCambio : number;
	ucii : string;
}

export interface iFormalizacionParaSalvar {
    idCotizacion : number;
	idFuncionario : number;
	fechaHora : string;
	montoDolares : number;
	montoColones : number;
	consecutivo : number;
	numeroFacturaFonafifo : string;
	numeroTransferencia : string;
	numeroComprobante : string;
	justificacionCompra : string;
	indicadorEstado : string;
	creditoDebito : string;
	numeroCIIU : string;
}

export interface iAnulaFactura {

}

export interface iExportacionArchivoFactura {

}

export interface iOpcionesParaAccion {
    opcion : string;
    claveOpcion : string;
}

export interface iActualizaFormalizacion {
    idFormalizacion : string;
    idUsuario : number;
    indicadorEstado : string;
    tieneFacturas : string;
    numeroTransferencia : string;
	numeroFactura : string;
	consecutivo : number;
	numeroComprobante : string;
	justificacionActivacion : string;
}

export interface iVerUnaFormalizacion {
    idFormalizacion : number;
	idCotizacion : number;
	idProyecto : number;
	idCliente : number;
	idFuncionario : number;
	proyecto : string;
	consecutivo : number;
	creditoDebito : string;
	fechaHora : string;
	fechaHoraFormalizacion : string;
	numeroFacturaFonafifo : string;
	numeroTransferencia : string;
	indicadorEstado : string;
	cantidad : number;
	montoTotalDolares : number;
	precioUnitario : number;
	subTotal : number;
	anotaciones : string;
	cedulaCliente : string;
	contactoCliente : string;
	direccionFisica : string;
	emailCliente : string;
	nombreCliente : string;
	nombreComercial : string;
	telefonoCliente : string;
	emailContador : string;
	contactoContador : string;
	justificacionActivacion : string;
	numeroCIIU : string;
}

export interface iArchivoFacturaFormalizacion {
	idFormalizacion : string;
	idFuncionario : number;
	cotizacion : string;
	archivo : any;
}

export interface iRutaFacturaFormalizacion {
	ruta : string;
}

export interface iFacturasYComprobantes
{
	numeroFacturaFonafifo : string;
	numeroTransferencia : string;
	numeroComprobante : string;
}

export interface iPeticionActivarFormalizacion {
	idFormalizacion : string;
	justificacion : string;
	idFuncionario : number;
}