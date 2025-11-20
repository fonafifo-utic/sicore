import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

@Injectable({
  providedIn: 'root',
})
export class PdfOcrServicio {
  constructor() {
    //(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = 'http://scgi.fonafifo.com/sicore/assets/pdfjs/pdf.worker.min.js';
  }

  async extraeTextoConOcr(base64: string): Promise<string> {
    const cadenaBinaria = atob(base64);
    const uint8Array = new Uint8Array(cadenaBinaria.length);
    for (let i = 0; i < cadenaBinaria.length; i++) {
      uint8Array[i] = cadenaBinaria.charCodeAt(i);
    }

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let textoCompleto = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const imageData = canvas.toDataURL();

        textoCompleto += await this.applyOcr(imageData);
      } else {
        console.error('Error al obtener el contexto del canvas');
      }
    }

    return textoCompleto;
  }

  applyOcr(imageData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => m,
        }
      ).then(({ data: { text } }) => {
        resolve(text);
      }).catch((err) => reject(err));
    });
  }
}
