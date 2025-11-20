export interface iProyectosDashboard
{
    proyecto : string;
    vendido : number;
    comprometido : number;
}

export interface iResumenVentasDashboard
{
    proyecto : string;
    remanente : number;
    vendido : number;
    comprometido : number;
}

export interface iResumenCotizaciones
{
    idProyecto : number;
    proyecto : string;
    cotizado : number;
    remanente : number;
}

export interface iResumenVentas
{
    idProyecto : number;
    proyecto : string;
    vendido : number;
    remanente : number;
}

export interface iResumenInventario
{
    proyecto : string;
    utilizado : number;
    remanente : number;
    montoDolares : number;
}

export interface iResumenVentasPorMes
{
    mes : number;
    montoTransferencia : number;
}
