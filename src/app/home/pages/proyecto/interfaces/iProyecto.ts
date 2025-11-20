export interface iProyecto {
    idProyecto : number
    idFuncionario : number
	proyecto : string;
	descripcionProyecto : string;
	ubicacionGeografica : string;
	periodoInicio : string;
	periodoFinalizacion : string;
	especieArboles : string;
	contratoPSA : string;
	indicadorEstado : string;
	cotizacionesAsociadas : number;
}

export interface iArchivoDeProyecto {
	idProyecto : number;
	idFuncionario : number;
	extension : string;
	archivo : any;
	proyecto : string;
}

export interface iRutaExpediente {
    ruta : string;
}

export interface iEstadoProyecto {
	idProyecto : number;
	idFuncionario : number;
	indicadorEstado : string;
}