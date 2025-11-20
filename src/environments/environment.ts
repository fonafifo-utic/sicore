export const environment = {
  production: true,
  
  //baseUrl: 'http://scgi.fonafifo.com/sicore/api/',
  // docspathPreview: 'http://scgi.fonafifo.com/sicore/docsuploads/',
  // enlaceQueVerificaOTP : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/verificar-dobleFactor',
  // enlaceParaGenerarQR : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/codigo-qr-microsoft?uri=',
  // enlaceParaActivarDFM : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/activar-dobleFactor-microsoft',
  // enlaceParaVerificarConfiguracion : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/obtener-metodos-2fa/',
  // enlaceParaConfigurarDFM : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/configurar-dobleFactor-microsoft',
  // enlaceParaDesactivarElDFM : 'http://scgi.fonafifo.com/API_SCGI_MFA/api/Autenticacion/deshabilitar-dobleFactor-microsoft'

  baseUrl: 'http://localhost:52588/api/',
  docspathPreview: 'http://localhost:52588/docsuploads/',
  enlaceQueVerificaOTP : 'http://192.168.200.195/API_SCGI_MFA/api/Autenticacion/verificar-dobleFactor',
  enlaceParaGenerarQR : 'http://192.168.200.195/API_SCGI_MFA/api/Autenticacion/codigo-qr-microsoft?uri=',
  enlaceParaActivarDFM : 'http://192.168.200.195/API_SCGI_MFA/api/Autenticacion/activar-dobleFactor-microsoft',
  enlaceParaConfigurarDFM : 'http://192.168.200.195/API_SCGI_MFA/api/Autenticacion/configurar-dobleFactor-microsoft',
  enlaceParaVerificarConfiguracion : 'http://predesa.fonafifo.com/API_SCGI_MFA/api/Autenticacion/obtener-metodos-2fa/',
  enlaceParaDesactivarElDFM : 'http://192.168.200.195/API_SCGI_MFA/api/Autenticacion/deshabilitar-dobleFactor-microsoft'

  //baseUrl: 'http://predesa.fonafifo.com/sicore/api/',
  //baseUrl: 'http://desa.fonafifo.com/sicore/api/',

  ,appUrl: 'http://localhost:4200/index.html',
  hrefimgs:'http://desa.fonafifo.com/presonline/',
  docspath: 'http://localhost/descargaExpediente/Presonline/',
  
  //docspathPreview: 'http://predesa.fonafifo.com/sicore/docsuploads/',
  //docspathPreview: 'http://desa.fonafifo.com/sicore/docsuploads/',

  baseFonafifoUrl:'http://scgi.fonafifo.com/presonline/api/',

  //baseUrlEncuesta : 'http://localhost:4201/#/encuesta/',
  baseUrlEncuesta : 'http://scgi.fonafifo.com/sicore_encuesta/#/encuesta/',
  //baseUrlEncuesta : 'http://predesa.fonafifo.com/sicore_encuesta/#/encuesta/',

  //enlaceParaManual : 'assets/DG-UTIC-M-04-2024v1.4.pdf'
  //enlaceParaManual : 'http://predesa.fonafifo.com/descargaExpediente/sicore/DG-UTIC-M-04-2024v1.4.pdf'
  enlaceParaManual : 'http://scgi.fonafifo.com/ExpedienteSICORE/DG-UTIC-M-04-2024v1.4.pdf',

};