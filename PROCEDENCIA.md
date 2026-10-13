# Recursos OCR incluidos

Tesseract.js 5.1.1 y tesseract.js-core 5.1.1, licencia Apache-2.0.
Los avisos de dependencias de los archivos de distribución están en `licenses/`.

Origen de las bibliotecas:
- https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/
- https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/

Origen de los datos de idioma:
- https://tessdata.projectnaptha.com/4.0.0/spa.traineddata.gz
- https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz
- Repositorio de referencia: https://github.com/tesseract-ocr/tessdata

## Modificación para Study Hub

Los datos originales completos incluyen componentes de varios motores.
`descargar_ocr.py` elimina los componentes LSTM del traineddata (slots 17–22)
y recalcula offsets y gzip, conservando diccionarios, clasificadores clásicos
(slots 0–16) y la cadena original de versión (slot 23).
La aplicación solicita únicamente OEM 0 con legacyCore y legacyLang activos.
No se ejecuta el motor neuronal LSTM; los archivos de idioma entregados no
incluyen sus componentes. El core completo de la biblioteca tiene código
para otros modos, pero Study Hub no los selecciona.

La transformación no crea vocabulario ni cambia respuestas de OCR.
La prueba verifica ausencia de esos componentes y reconocimiento real de
texto impreso en español e inglés. Las sumas de los archivos entregados
figuran en `SHA256SUMS.txt`.

Estas bibliotecas gratuitas son recursos estáticos de reconocimiento local.
No son un servidor OCR y no suben fotos. Apertium y MyMemory son servicios
externos configurados separadamente; no se distribuyen sus servidores aquí.
