export interface iListadoMensualCertificado {
    idCertificado : number;
    numeroCertificado : string;
    consecutivo : string;
    sectorComercial : string;
    nombreCertificado : string;
    nombreCotizante : string;
    fechaEmisionCertificado : string;
    fechaEmisionDelCertificado : string;
    cedulaJuridicaComprador : string;
    montoTransferencia : number;
    montoDeTransferencia : string;
    numeroTransferencia : string;
    fechaTransferencia : string;
    fechaDeTransferencia : string;
    annoInventarioGEI : string;
    anotaciones : string;
    usuario : string;
}

export interface iAnnos
{
    anno : number;
}

export interface iMeses
{
    valor : number;
    mes : string;
}

export interface iParametros
{
    anno : number;
    meses : string;
}

export interface iListadoCotizacionesMensual {
    idCotizacion : number;
    sectorComercial : string;
    nombreCliente : string;
    proyecto : string;
    usuario : string;
    fechaHora : string;
    fechaYHora : string;
    cantidad : number;
    precioUnitario : number;
    montoTotalDolares : number;
    consecutivo : number;
    indicadorEstado : string;
    funcionario : string;
    rangoDeFechas : string;
}

export interface iReporteListadoFormalizacionMensual {
    idFormalizacion : number;
    consecutivo : number;
    sectorComercial : string;
    nombreCliente : string;
    fechaHora : string;
    montoDolares : number;
    numeroTransferencia : string;
    numeroFacturaFonafifo : string;
    tipoCompra : string;
    creditoDebito : string;
    justificacionCompra : string;
    cuentaPago : string;
    usuario : string;
}

export interface iReporteListadoVentas {
    nombreCliente : string;
    sectorComercial : string;
    fecha : string;
    cantidad : number;
    montoColones : number;
    montoDolares : number;
    cuenta : string;
    descuento : string;
}

export interface iRangoFechaBusqueda {
    fechaInicio : string;
    fechaFin : string;
    funcionario : number;
    sector : number[];
}

export interface iRutaDeDescargaDelPDF {
    nombreArchivo : string;
    resultado : string;
    mensaje : string;
}

export interface iSectoresComerciales {
    idSectorComercial : number;
    sectorComercial : string;
}

export interface iReporteListadoCotizacionesExcel
{
    sector_comercial : string;
    nombre_cliente : string;
    proyecto : string;
    funcionario : string;
    fecha_hora : string;
    cantidad : string;
    precio_unitario : string;
    monto_dólares : string;
    consecutivo : string;
    estado : string;
}

export interface iReporteListadoFormalizacionesExcel
{
    consecutivo : string;
    sector_comercial : string;
    nombre_cliente : string;
    fecha_hora : string;
    monto_dolares : string;
    numero_transferencia : string;
    numero_facturaFonafifo : string;
    tipo_compra : string;
    credito_debito : string;
    usuario : string;
}

export interface iReporteEsfuerzoAnualColaborador
{
    idFuncionario : number;
    agente : string;
    cantidad : number;
    monto : number;
    ultimaVenta : string;
}

export interface iDesgloseEsfuerzoColaborador
{
    certificado : string;
    cliente : string;
    fecha : string;
    cantidad : number;
    monto : number;
}

export interface iListadoEncuesta {
    pregunta : string;
	respuesta : string;
	personasQueContestaron : string;
	totalEncuestados : string;
	porcentaje : string;
}