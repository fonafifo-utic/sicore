export interface iPersonalizacion {
    idPersonalizacion : number;
    idFuncionario : number;
    logoPrincipal : string;
    logoSecundario : string;
    tercerLogo : string;
    logoSistema : string;
    leyendaDescriptivaCotizacionEspannol : string;
    leyendaDescriptivaCotizacionIngles : string;
    leyendaFinalidadCotizacionEspannol : string;
    leyendaFinalidadCotizacionIngles : string;
    leyendaDescripcionCertificadoEspannol : string;
    leyendaDescripcionCertificadoIngles : string;
    correoGerenciaEjecutiva : string;
    directorEjecutivo : string;
}

export interface iDirectorEjecutivo
{
    director : string;
}

export interface iParametrosReporteEncuesta
{
    consecutivo : number;
    textoAlternativoReporte : string;
}