import { Routes } from '@angular/router';
import InicioComponent from './home/inicio';
import { Login } from './auth/login/login';
import { ListarUsuarios } from './home/pages/usuarios/listar/usuario.listar';
import { AgregarUsuario } from './home/pages/usuarios/agregar/usuario.agregar';
import { EditarUsuario } from './home/pages/usuarios/editar/usuario.editar';
import { ListarInventario } from './home/pages/inventario/listar/inventario.listar';
import { AgregarInventario } from './home/pages/inventario/agregar/inventario.agregar';
import { EditarInventario } from './home/pages/inventario/editar/inventario.editar';
import { CanActivate } from './guards/can-active/canActive';
import { AgregaProyecto } from './home/pages/proyecto/agregar/proyecto.agregar';
import { ListarProyectos } from './home/pages/proyecto/listar/proyecto.listar';
import { EditarProyecto } from './home/pages/proyecto/editar/proyecto.editar';
import { Dashboard } from './home/pages/dashboard/dashboard/dashboard';
import { ListarCotizacion } from './home/pages/cotizaciones/listar/cotizacion.listar';
import { ListarCliente } from './home/pages/clientes/listar/cliente.listar';
import { AgregarCliente } from './home/pages/clientes/agregar/cliente.agregar';
import { AgregarCotizacion } from './home/pages/cotizaciones/agregar/cotizacion.agregar';
import { EditarCliente } from './home/pages/clientes/editar/cliente.editar';
import { EditarCotizacion } from './home/pages/cotizaciones/editar/cotizacion.editar';
import { VerCotizacion } from './home/pages/cotizaciones/ver/cotizacion.ver';
import { ListarFormalizacion } from './home/pages/formalizacion/listar/formalizacion.listar';
import { VerFormalizacion } from './home/pages/formalizacion/ver/formalizacion.ver';
import { ListarCertificados } from './home/pages/certificacion/listar/certificacion.listar';
import { VerCertificado } from './home/pages/certificacion/ver/certificado.ver';
import { ListarPersonalizacion } from './home/pages/personalizacion/listar/personalizacion.listar';
import { AgregaPregunta } from './home/pages/encuesta/agregar/pregunta/pregunta.agregar';
import { ListarPreguntas } from './home/pages/encuesta/listar/pregunta/pregunta.listar';
import { ListaEncuesta } from './home/pages/encuesta/listar/encuesta/encuesta.listar';
import { EditarPregunta } from './home/pages/encuesta/editar/pregunta/pregunta.editar';
import { VerEncuesta } from './home/pages/encuesta/ver/encuesta.ver';
import { DashboardEncuesta } from './home/pages/encuesta/dashboard/encuesta.dashboard';
import { EditarInventarioAumento } from './home/pages/inventario/editar.aumento/inventario.editar.aumento';
import { NoEncontrado } from './home/pages/noEncontrado/noEncontrado';
import { ListarReportes } from './home/pages/reportes/listar/reportes.listar';
import { ListadoMensualCertificado } from './home/pages/reportes/reportes/certificados/listado-mensual/certificado.listado.mensual';
import { ListadoGeneralEncuesta } from './home/pages/encuesta/reportes/listado/listado.reporte.encuesta';
import { EncuestasEnviadas } from './home/pages/encuesta/listar/enviadas/encuesta.enviada';
import { ListadoMensualCotizacion } from './home/pages/reportes/reportes/cotizaciones/listado-mensual/cotizacion.listado.mensual';
import { ListadoMensualFormalizacion } from './home/pages/reportes/reportes/formalizacion/listado-mensual/formalizacion.listado.mensual';
import { EditarCertificado } from './home/pages/certificacion/editar/certificado.editar';
import { ActivaFormalizacion } from './home/pages/formalizacion/activar/formalizacion.activar';
import { ListadoMensualVentas } from './home/pages/reportes/reportes/ventas/listado-mensual/ventas.listado.mensual';
import { ListadoAnualEsfuerzoColaborador } from './home/pages/reportes/reportes/esfuerzo/listado-anual/esfuerzo.listado.anual';
import { AgruparCotizacion } from './home/pages/cotizaciones/agrupar/cotizacion.agrupar';
import { ListadoEncuestas } from './home/pages/reportes/reportes/encuesta/listado/encuesta.listado';
import { EncuestaRespuestasPorAnno } from './home/pages/reportes/reportes/encuesta/respuestasPorAnno/encuesta.respuestas.poranno';

export const routes: Routes = [
    {
        path : '',
        pathMatch : 'full',
        redirectTo : 'login'
    },
    {
        path : 'login',
        component : Login
    },
    {
        path : 'activar-formalizacion/:id',
        component : ActivaFormalizacion
    },
    {
        path : '',
        component : InicioComponent,
        children : [
            {
                path : 'dashboard',
                component : Dashboard,
                data : { breadcrumb : 'Dashboard' }
            },
            {
                path : 'no-encontrado',
                component : NoEncontrado,
                data : { breadcrumb : 'Página No Encontrada' }
            },
            {
                path : 'usuarios/listar',
                component : ListarUsuarios,
                data : { breadcrumb : 'Lista Usuarios' }
            },
            {
                path : 'usuarios/agregar',
                component : AgregarUsuario,
                data : { breadcrumb : 'Registro Usuarios' }
            },
            {
                path : 'usuarios/editar/:id',
                component : EditarUsuario,
                data : { breadcrumb : 'Editar Usuarios' }
            },
            {
                path : 'proyecto/listar',
                component : ListarProyectos,
                data : { breadcrumb : 'Lista Proyectos' }
            },
            {
                path : 'proyecto/agregar',
                component : AgregaProyecto,
                data : { breadcrumb : 'Registro Proyectos' }
            },
            {
                path : 'proyecto/editar/:id',
                component : EditarProyecto,
                data : { breadcrumb : 'Editar Proyectos' }
            },
            {
                path : 'inventario/listar',
                component : ListarInventario,
                data : { breadcrumb : 'Lista Inventario' }
            },
            {
                path : 'inventario/agregar',
                component : AgregarInventario,
                data : { breadcrumb : 'Agregar RE' }
            },
            {
                path : 'inventario/editar/:id',
                component : EditarInventario,
                data : { breadcrumb : 'Disminuir RE' }
            },
            {
                path : 'inventario/aumentar/:id',
                component : EditarInventarioAumento,
                data : { breadcrumb : 'Aumentar RE' }
            },
            {
                path : 'clientes/listar',
                component : ListarCliente,
                data : { breadcrumb : 'Lista Clientes' }
            },
            {
                path : 'cotizacion/listar',
                component : ListarCotizacion,
                data : { breadcrumb : 'Lista Cotizaciones' }
            },
            {
                path : 'cotizacion/agregar',
                component : AgregarCotizacion,
                data : { breadcrumb : 'Agregar Cotización' }
            },
            {
                path : 'cotizacion/editar/:id',
                component : EditarCotizacion,
                data : { breadcrumb : 'Editar Cotización' }
            },
            {
                path : 'cotizacion/ver/:id',
                component : VerCotizacion,
                data : { breadcrumb : 'Ver Cotización' }
            },
            {
                path : 'cotizacion/agrupar',
                component : AgruparCotizacion,
                data : { breadcrumb : 'Agrupar Cotizaciones' }
            },
            {
                path : 'cliente/listar',
                component : ListarCliente,
                data : { breadcrumb : 'Lista Clientes' }
            },
            {
                path : 'cliente/agregar',
                component : AgregarCliente,
                data : { breadcrumb : 'Agregar Clientes' }
            },
            {
                path : 'cliente/editar/:id',
                component : EditarCliente,
                data : { breadcrumb : 'Editar Clientes' }
            },
            {
                path : 'formalizacion/listar',
                component : ListarFormalizacion,
                data : { breadcrumb : 'Formalizar Venta' }
            },
            {
                path : 'formalizacion/ver/:id',
                component : VerFormalizacion,
                data : { breadcrumb : 'Formalización' }
            },
            {
                path : 'certificados/listar',
                component : ListarCertificados,
                data : { breadcrumb : 'Certificados' }
            },
            {
                path : 'certificados/ver/:id',
                component : VerCertificado,
                data : { breadcrumb : 'Certificado' }
            },
            {
                path : 'certificados/editar',
                component : EditarCertificado,
                data : { breadcrumb : 'Editar Certificado' }
            },
            {
                path : 'personalizacion/listar',
                component : ListarPersonalizacion,
                data : { breadcrumb : 'Personalización' }
            },
            {
                path : 'encuesta/preguntas/listar',
                component : ListarPreguntas,
                data : { breadcrumb : 'Encuesta / Listar Preguntas' }
            },
            {
                path : 'encuesta/preguntas/agregar',
                component : AgregaPregunta,
                data : { breadcrumb : 'Encuesta / Agregar una Pregunta' }
            },
            {
                path : 'encuesta/listar',
                component : ListaEncuesta,
                data : { breadcrumb : 'Encuestas' }
            },
            {
                path : 'encuesta/preguntas/editar/:id',
                component : EditarPregunta,
                data : { breadcrumb : 'Encuesta / Editar una Pregunta' }
            },
            {
                path : 'encuesta/ver',
                component : VerEncuesta,
                data : { breadcrumb : 'Ver Encuesta' }
            },
            {
                path : 'encuesta/dashboard',
                component : DashboardEncuesta,
                data : { breadcrumb : 'Dashboard Encuesta' }
            },
            {
                path : 'encuesta/listadoMensual',
                component : ListadoGeneralEncuesta,
                data : { breadcrumb : 'Encuesta / Listado Mensual' }
            },
            {
                path : 'encuesta/encuesta-enviada',
                component : EncuestasEnviadas,
                data : { breadcrumb : 'Encuesta / Listado Encuestas Enviadas' }
            },
            {
                path : 'reportes/listar',
                component : ListarReportes,
                data : { breadcrumb : 'Listar Reportes' }
            },
            {
                path : 'reportes/certificado/listado-mensual',
                component : ListadoMensualCertificado,
                data : { breadcrumb : 'Reportes / Certificados / Listado de Certificados' }
            },
            {
                path : 'reportes/cotizacion/listado-mensual',
                component : ListadoMensualCotizacion,
                data : { breadcrumb : 'Reportes / Cotización / Listado de Cotizaciones' }
            },
            {
                path : 'reportes/formalizacion/listado-mensual',
                component : ListadoMensualFormalizacion,
                data : { breadcrumb : 'Reportes / Formalización / Listado de Formalizaciones' }
            },
            {
                path : 'reportes/ventas/listado-mensual',
                component : ListadoMensualVentas,
                data : { breadcrumb : 'Reportes / Ventas / Listado de Ventas' }
            },
            {
                path : 'reportes/ventas/listado-esfuerzo',
                component : ListadoAnualEsfuerzoColaborador,
                data : { breadcrumb : 'Reportes / Ventas / Listado de Esfuerzo' }
            },
            {
                path : 'reportes/encuesta/encuesta-listado',
                component : ListadoEncuestas,
                data : { breadcrumb : 'Reportes / Encuesta / Listado de Respuestas' }
            },
            {
                path : 'reportes/encuesta/encuesta-respuestas-poranno',
                component : EncuestaRespuestasPorAnno,
                data : { breadcrumb : 'Reportes / Encuesta / Gráfico Respuestas Por Año' }
            },

        ],
        canActivate : [CanActivate]
    }
];
