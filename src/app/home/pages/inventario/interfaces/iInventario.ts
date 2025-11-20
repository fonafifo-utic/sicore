export interface iInventario {
    idInventario : number;
    idProyecto : number;
    proyecto : string;
    ubicacionGeografica : string;
    remanente : number;
    vendido : number;
    comprometido : number;
}

export interface iIngresaMovimiento {
    idInventario : number;
    idProyecto : number;
	idUsuario : number;
	cantidad : number;
	descripcionMovimiento : string;
}

export interface iMovimiento {
    idMovimiento : number;
    idProyecto : number;
    proyecto : string;
    ubicacionGeografica : string;
    idUsuario : number;
    usuario : string;
    saldoInicial : number;
    fechaMovimiento : string;
    cantidad : number;
    tipoMovimiento : string;
    descripcionMovimiento : string;
    comprometido : number;
    remanente : number;
    remanenteReal : number;
}







		
		
		
		