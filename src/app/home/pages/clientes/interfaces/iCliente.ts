export interface iCliente {
    idCliente : number;
    idSector : number;
    sectorComercial : string;
    idTipoEmpresa : number;
    TipoEmpresa : string;
    idActividadComercial : number;
    actividadCormercial : string;
    nombreCliente : string;
    nombreComercial : string;
    cedulaCliente : string;
    contactoCliente : string;
    telefonoCliente : string;
    emailCliente : string;
    direccionFisica : string;
    clasificacion : string;
    idFuncionario : number;
    indicadorEstado : string;
    cotizacionesAsociadas : number;
    contactoContador : string;
    emailContador : string;
    esGestor : string;
    idAgente : number;
    ucii : string;
}

export interface iSector {
    idSectorComercial : number;
    sectorComercial : string;
}

export interface iTipoEmpresa {
    idTipoEmpresa : number;
    idSector : number;
    tipoEmpresa : string;
}

export interface iActividadComercial {
    idActividadComercial : number;
    actividadComercial : string;
}

export interface iClasificacion {
    clasificacion : string;
    descripcion : string;
}

export const clasificacion : iClasificacion [] = [
    {
        clasificacion : 'A+',
        descripcion : 'Demanda Prom. Anual =/+ 2.000'
    },
    {
        clasificacion : 'A',
        descripcion : 'Demanda Prom. Anual =/+ 1.000 a 1.999'
    },
    {
        clasificacion : 'B',
        descripcion : 'Demanda Prom. Anual =/+ 500 a 999'
    },
    {
        clasificacion : 'C',
        descripcion : 'Demanda Prom. Anual =/+ 200 a 499'
    },
    {
        clasificacion : 'D',
        descripcion : 'Demanda Prom. Anual -200'
    }
]

export interface iFuncionarios {
    idFuncionario : number;
    nombreFuncionario : string;
}

export interface iFuncionario {
    idUsuario : number;
    nombre : string;
    email : string;
    telefono : string;
}