# Pruebas de Study Hub 1.1.0

**Resultado: 155 comprobaciones correctas, 0 fallidas.**

- Registro: 2026-10-12T23:36:27.854Z (UTC).
- Chromium 148 mediante Puppeteer 24.43.1; zona horaria Europe/Madrid.
- Viewport táctil Android emulado: 390 × 844. También 360, 768 y 1280 px.
- Cámara y micrófono: dispositivos **emulados** del navegador. Se produjo un Blob de audio real, se guardó, pausó/reanudó, reprodujo y renombró.
- OCR: motor Tesseract real, OEM 0, con datos clásicos reales. Leyó «STUDY HUB 2026», «12 + 7 = 19» y «La energía y los átomos.» de imágenes de prueba.
- Traductor: solicitudes reales a Apertium por reglas y MyMemory con `mt=0`; no respuestas prefabricadas en el test.
- Sin conexión: se bloqueó la red de página y service worker mediante CDP. La recarga llegó del service worker; cálculo, datos locales y OCR preparado siguieron funcionando.
- Voz: el entorno headless expuso SpeechSynthesis pero **no tenía voces del sistema**. Se verificó el aviso y el estado desactivado, la división de textos y los controles; no se certifica reproducción audible ni calidad de pronunciación en un Android físico.
- Portapapeles: escritura y lectura reales, con permiso concedido explícitamente al navegador de pruebas.
- Las notas, eventos y archivos de este banco son **fixtures de prueba**. No se precargan en la aplicación que recibe el usuario.

## Casos comprobados

- ✅ JavaScript válido; no llamadas a eval ni new Function
- ✅ Sin URLs de servicios de IA/traducción neuronal
- ✅ Datos spa sin componentes LSTM
- ✅ Datos eng sin componentes LSTM
- ✅ PWA: manifest, worker e iconos existen
- ✅ Arranque en Inicio con IndexedDB
- ✅ No envía solicitudes externas al abrir
- ✅ Sin datos de ejemplo inventados
- ✅ Orden de las 11 herramientas
- ✅ Navegación sin recarga: calculator
- ✅ Navegación sin recarga: notes
- ✅ Navegación sin recarga: calendar
- ✅ Navegación sin recarga: files
- ✅ Navegación sin recarga: recorder
- ✅ Navegación sin recarga: tts
- ✅ Navegación sin recarga: scanner
- ✅ Navegación sin recarga: translator
- ✅ Navegación sin recarga: search
- ✅ Navegación sin recarga: settings
- ✅ Navegación sin recarga: home
- ✅ Arrastrar rayita abre el menú completamente
- ✅ La rayita sigue visible en el menú abierto
- ✅ Arrastrar la misma rayita al borde cierra el menú
- ✅ Toque fuera del menú lo cierra
- ✅ Herramienta seleccionada señalada y menú cerrado
- ✅ Cancelar prompt por Escape resuelve su promesa
- ✅ Cálculo 1+2*3
- ✅ Cálculo (1+2)*3
- ✅ Cálculo -5+3
- ✅ Cálculo -2^2
- ✅ Cálculo 2^3^2
- ✅ Cálculo 2*-3
- ✅ Cálculo 0.1+0.2
- ✅ Cálculo 3,5+1,5
- ✅ Cálculo 3(4)
- ✅ Cálculo 2pi
- ✅ Cálculo sqrt(16)
- ✅ Cálculo sin(30)
- ✅ Cálculo log(1000)
- ✅ Cálculo ln(e)
- ✅ Cálculo 5!
- ✅ Cálculo 200+10%
- ✅ Cálculo 200-10%
- ✅ Cálculo 200*10%
- ✅ Cálculo 25%
- ✅ Cálculo 1/2+1/3
- ✅ Cálculo 1e-5*10
- ✅ Rechaza entrada inválida 1/0
- ✅ Rechaza entrada inválida sqrt(-4)
- ✅ Rechaza entrada inválida 1+
- ✅ Rechaza entrada inválida (2+3
- ✅ Rechaza entrada inválida 1.2.3
- ✅ Rechaza entrada inválida 1 2
- ✅ Rechaza entrada inválida 2+*3
- ✅ Rechaza entrada inválida alert(1)
- ✅ Rechaza entrada inválida document.cookie
- ✅ Rechaza entrada inválida tan(90)
- ✅ Rechaza entrada inválida 50%20
- ✅ Fracción exacta 0,75 = 3/4
- ✅ Cambio de signo de operando sin concatenar dígitos
- ✅ Modo fracciones: 1/2+1/3=5/6
- ✅ Encadenar un resultado fraccionario conserva su valor
- ✅ Tecla sin y autocierre de paréntesis
- ✅ Modo RAD
- ✅ Historial conserva resultado numérico
- ✅ Botón de historial real abre diálogo
- ✅ Guardar al cerrar inmediatamente, con asignatura, etiquetas y color
- ✅ La nota no ejecuta el HTML escrito
- ✅ Buscar por etiqueta
- ✅ Autoguardado confirmado en IndexedDB
- ✅ Nota eliminada recuperable en papelera
- ✅ Recuperación real de nota
- ✅ Enviar nota al lector conserva el texto
- ✅ Error de cuota no crea una nota falsamente guardada
- ✅ Evento real creado con asignatura
- ✅ Vista mensual de 42 días
- ✅ Vista semanal de 7 días
- ✅ Vista diaria
- ✅ Calendario correcto al cambiar la hora en octubre
- ✅ Inicio incluye tareas antiguas aún pendientes
- ✅ Completar tarea actualiza el Inicio
- ✅ Archivo importado con datos y metadatos
- ✅ Carpeta virtual persistida en IndexedDB
- ✅ Favorito de archivo
- ✅ Lee texto real del archivo
- ✅ Archivo enviado al lector sin perder contenido
- ✅ Mover archivo a carpeta virtual
- ✅ Archivo en papelera
- ✅ Recuperar archivo con binario intacto
- ✅ Cámara por getUserMedia (dispositivo emulado)
- ✅ Captura una foto real del stream y libera la cámara
- ✅ Cámara denegada: mensaje y app operativa
- ✅ Extrae operaciones con programación convencional
- ✅ Operación enviada a la calculadora
- ✅ Pausar congela el tiempo de grabación
- ✅ Audio real guardado y pausa excluida
- ✅ Micrófono liberado al detener
- ✅ Reproducción del audio guardado
- ✅ Renombrar grabación persistente
- ✅ Disponibilidad de voces tratada sin inventarlas
- ✅ Texto largo se divide en tramos cortos sin pérdida
- ✅ Velocidad y ajustes de voz guardados
- ✅ Aviso si falta una voz en el idioma elegido
- ✅ Copiar resultado al portapapeles real
- ✅ Siete idiomas y opción de origen automático
- ✅ Apertium devuelve una traducción REAL por reglas
- ✅ Traducción en favoritos e historial
- ✅ No inventa traducción para pareja no instalada
- ✅ Memoria humana con traducción automática desactivada
- ✅ Sin segmento humano exacto, no inventa resultado
- ✅ No solicita proveedores neuronales como alternativa
- ✅ Abre URL real del motor, sin resultados inventados
- ✅ Enlace de búsqueda visible e historial
- ✅ Tesseract ejecutado en OEM 0 sin LSTM
- ✅ OCR reconoce texto REAL de la imagen
- ✅ Texto OCR guardado como nota real
- ✅ OCR español e inglés con los datos clásicos incluidos
- ✅ Almacenamiento y permisos con estados reales
- ✅ Tema oscuro aplicado
- ✅ Tamaño de texto cambia también rem
- ✅ Menú e interfaz en inglés
- ✅ Copia completa contiene audio y archivos binarios
- ✅ Importación inválida se rechaza antes de borrar datos
- ✅ Transacción fallida revierte todo el reemplazo
- ✅ Restauración real: notas, eventos, archivos y audio
- ✅ Exportación TXT en un ZIP local
- ✅ Datos y binarios persisten tras recargar
- ✅ Recarga atendida por el service worker con red bloqueada
- ✅ PWA abre sin conexión y recupera datos locales
- ✅ Calculadora funciona sin conexión
- ✅ Calendario funciona sin conexión
- ✅ Sin red, el traductor avisa y no promete traducción
- ✅ OCR clásico funciona offline después de preparar sus recursos
- ✅ Sin desbordamiento 360px · home
- ✅ Sin desbordamiento 360px · calendar
- ✅ Sin desbordamiento 360px · settings
- ✅ Sin desbordamiento 360px · notes
- ✅ Sin desbordamiento 360px · scanner
- ✅ Sin desbordamiento 360px · tts
- ✅ Sin desbordamiento 768px · home
- ✅ Sin desbordamiento 768px · calendar
- ✅ Sin desbordamiento 768px · settings
- ✅ Sin desbordamiento 768px · notes
- ✅ Sin desbordamiento 768px · scanner
- ✅ Sin desbordamiento 768px · tts
- ✅ Sin desbordamiento 1280px · home
- ✅ Sin desbordamiento 1280px · calendar
- ✅ Sin desbordamiento 1280px · settings
- ✅ Sin desbordamiento 1280px · notes
- ✅ Sin desbordamiento 1280px · scanner
- ✅ Sin desbordamiento 1280px · tts
- ✅ Texto legible en notas con color bajo tema oscuro
- ✅ Menú deslizable funciona también con ratón
- ✅ Cerrar menú con clic externo de ratón
- ✅ Sin excepciones JavaScript durante las pruebas

## Reproducir

Node.js solo es necesario para probar, no para usar Study Hub.

1. Desde la carpeta de la app, inicia `python3 servidor.py 8123`.
2. En otra terminal:

```bash
cd tests
npm install
npm test
```

Puppeteer descarga Chromium y puede necesitar bibliotecas del sistema según el ordenador. El banco requiere Internet para las comprobaciones del traductor y aplica bloqueo de red durante su sección offline. El detalle de la última ejecución está en `tests/resultados.json`.

**SHA-256 del index.html verificado:** `f77e163fc1789347e5251a711c1712da6fbaea72790c634704d9762818e49feb`.

## Pendiente de verificar en tu móvil físico

- Concesión/revocación de cámara y micrófono desde Android y desde los permisos del sitio.
- Orientación y nitidez de la cámara real.
- Voces del sistema, pausa/reanudación y pronunciación audible de los idiomas que tu dispositivo tenga instalados.
- Instalación PWA desde el menú real del navegador y apertura posterior en modo avión.
- PDF y formatos de audio que admita el navegador concreto.
- Comportamiento de recordatorios en segundo plano: **no se promete fiabilidad con la app cerrada**.
- Si el gesto del borde lo captura Android, usa un toque en la rayita o el botón ☰: una web no puede anular los gestos del sistema.

No se usó un simulador de traducciones u OCR para declarar esos casos como correctos. Los dispositivos de medios emulados y la ausencia de voces se indican expresamente para no confundir estas pruebas con validación de hardware real.
