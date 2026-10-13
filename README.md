# Study Hub

**Aplicación escolar funcional · HTML, CSS y JavaScript · versión 1.1.0**

Calculadora, OCR, traductor, notas, calendario, archivos, grabadora, buscador, lector de voz y ajustes en una única aplicación. No contiene cuentas, claves secretas, anuncios, servicios generativos ni sincronización en la nube. El código principal está en `index.html`; las herramientas comparten navegación y almacenamiento, pero tienen interfaces propias.

## Empezar

### En esta conversación

Abre la **vista en vivo «Study Hub»**. La rayita morada del borde izquierdo se arrastra hacia dentro para abrir el menú y vuelve hacia el borde para cerrarlo. También puedes tocarla, usar el botón ☰ o tocar fuera del menú. Sirve con dedo y ratón.

El visor de archivos de Arena es un iframe restringido: puede impedir almacenamiento, cámara, micrófono, descargas y carga de recursos. Para utilizar esas funciones, usa la vista en vivo o abre la aplicación directamente en una pestaña del navegador.

### Paquete completo, recomendado

1. Descomprime `Study-Hub.zip` **conservando las carpetas**.
2. Publica la carpeta `study-hub` en un alojamiento web estático con **HTTPS**. No necesitas un servidor de datos ni una API propia.
3. En Android, ábrela con Chrome u otro navegador compatible. Para instalarla: **Ajustes → Instalar**, o el menú del navegador → **Instalar aplicación / Añadir a pantalla de inicio**.
4. Abre la app una vez con conexión. Para preparar OCR offline, reconoce una imagen con cada idioma que vayas a usar; espera a que termine.

El paquete incluye el motor OCR y datos clásicos de **español e inglés**. La app prioriza estos recursos locales, sin solicitar OCR a un servidor. La instalación PWA permite abrir el núcleo de la aplicación sin conexión una vez guardado por el navegador; el OCR requiere que también estén disponibles sus bibliotecas y datos. La caché puede ser eliminada por el usuario o por el navegador.

### En tu ordenador

Con Python 3 instalado:

```bash
cd study-hub
python3 servidor.py 8123
```

Abre `http://localhost:8123` **en ese mismo ordenador**. Es un servidor exclusivamente estático: no guarda ni recibe tus notas, archivos ni grabaciones.

Para revocar cámara o micrófono, utiliza los permisos del sitio en los ajustes del navegador: una web no puede revocarse a sí misma un permiso ya concedido.

**Importante:** en un móvil, una dirección como `http://192.168.…:8123` no es un contexto seguro. Para cámara, micrófono, instalación PWA y otras funciones protegidas necesitas **HTTPS**. No es suficiente estar conectado a la misma Wi-Fi.

### Solo `index.html`

Incluye todo el HTML, CSS y JavaScript de la interfaz y la lógica. Puedes copiarlo, guardarlo y abrirlo en un navegador. Calculadora, notas, calendario, edición de texto y otras funciones locales no necesitan paquetes de npm.

Sin las carpetas del paquete **no se incluyen las bibliotecas OCR**. Para usar OCR, conserva `assets/ocr` o desactiva **«Recursos OCR locales»** en el escáner para intentar descargar la biblioteca y datos por Internet. No se garantiza la instalación PWA, los permisos o la persistencia en `file://`: dependen del navegador. La versión servida por HTTPS es la recomendada.

## Herramientas y conexión

| Herramienta | Funciones reales | Requisitos |
|---|---|---|
| Calculadora | Básica, científica, fracciones, potencias, raíces, signos, paréntesis, prioridad, DEG/RAD, historial, fórmulas editables y copia. Analizador propio; no usa evaluación de código. | Local. Precisión numérica de JavaScript. |
| Escáner | Cámara o galería, captura, OCR, edición manual, buscar palabras, copiar, guardar nota y enviar al traductor, al lector o a la calculadora. | WebAssembly y recursos OCR. Cámara con permiso y contexto seguro. |
| Traductor | Idiomas, intercambio, detección heurística local, traducción real, copia, historial, favoritos y pronunciación cuando hay voz compatible. | Internet y servicio disponible. Apertium por reglas o memoria humana MyMemory con `mt=0`. |
| Notas | Crear, editar, autosalvar, títulos, asignaturas, etiquetas, colores, fijar, buscar, papelera y recuperación, copia y exportación TXT/ZIP. | IndexedDB; borrador local de recuperación. |
| Calendario | Mes, semana, día; exámenes, deberes, trabajos; fecha, hora, asignatura, descripción, editar, borrar y completar. Inicio se actualiza. | IndexedDB. Recordatorios solo con la app abierta. |
| Archivos | Importación, metadatos, búsqueda, ordenación, carpetas virtuales, favoritos, mover, texto editable, imágenes, audio, vídeo, PDF compatible, descarga y papelera. | IndexedDB. Máximo 25 MB por archivo importado. |
| Grabadora | Grabar, pausar, reanudar, detener, tiempo sin contar pausas, medidor real del micrófono, reproducción, renombrar, descargar y borrar. | MediaRecorder, micrófono, permiso y HTTPS. |
| Buscador | Motor elegido, consultas reales, historial y enlace externo. | Internet. Los resultados se abren en el navegador; no se simulan ni se incrustan sitios bloqueados. |
| Texto a voz | Texto, idiomas y voces disponibles, velocidad, tono, pausa, reanudar, detener, repetición y resaltar frases. Recibe notas, archivos y traducciones. | SpeechSynthesis del navegador. Las voces dependen del dispositivo. |
| Ajustes | Claro, oscuro, automático; tamaño de texto, idioma, espacio utilizado, permisos, PWA, pantalla completa y copias completas. | Capacidades del navegador. Las opciones no disponibles se explican. |

### Convenciones de cálculo

- `200 + 10% = 220`; `200 − 10% = 180`: porcentaje relativo a la cantidad de la izquierda.
- `200 × 10% = 20`; `25% = 0,25`.
- Potencias antes del signo: `−2^2 = −4`; `2^3^2 = 512`.
- En el modo fracciones, `1/2 + 1/3 = 5/6`. Se conserva el valor numérico al encadenar operaciones.
- Las funciones científicas usan un argumento entre paréntesis; al pulsar `=` se cierran paréntesis pendientes cuando ese es el único problema. `tan(90)` en grados, división por cero y otras entradas inválidas muestran un error.
- El historial y el cuadro de resultado son reales, no respuestas predefinidas. No es un sistema de álgebra simbólica ni una calculadora de precisión arbitraria.

## Sin IA integrada

- **Cálculo:** un parser matemático escrito en JavaScript; ninguna expresión del usuario se ejecuta como código.
- **OCR:** Tesseract.js 5.1.1 con **OEM 0**, `legacyCore: true` y `legacyLang: true`. Se utiliza el motor **clásico**, no el motor neuronal LSTM. Los archivos de idioma incluidos se derivan de tessdata 4.0.0; se han retirado sus componentes LSTM, conservando clasificadores y diccionarios clásicos. El script de descarga hace la misma transformación para otros idiomas.
- **Traducción:** **Apertium** usa reglas lingüísticas; no se integra traducción neuronal. La alternativa MyMemory se consulta con **`mt=0`**, que desactiva traducción automática: solo se acepta un segmento humano que coincida con el original, no una traducción aproximada de otro texto. Si no existe, se muestra un aviso.
- **Voz:** se invoca la capacidad nativa **SpeechSynthesis** solicitada para esta app. Study Hub no instala modelos de voz ni utiliza una API de generación. No puede controlar la implementación interna de las voces del sistema operativo. Se priorizan voces locales; las voces que el navegador identifica como de red piden confirmación antes de usarse.
- No hay transcripción automática, resumen de notas, modelos de lenguaje, API de IA, servidor de IA ni requisito de pago.

### Límites del traductor

Los selectores incluyen **español, catalán, inglés, francés, alemán, italiano y chino**, pero esto **no significa que haya un motor para todas sus parejas**. El servidor público de Apertium no instala todas las combinaciones, especialmente alemán/chino. Una pareja no disponible produce un aviso, no una respuesta inventada.

La memoria humana puede resolver segmentos existentes en esos idiomas, pero **no traduce libremente cualquier párrafo nuevo**. Puedes configurar otro servidor **Apertium APy por reglas**, con `/listPairs`, `/translate` y CORS habilitado, en **Traductor → Configurar**. El botón de comprobación consulta la lista real del servidor sin enviar texto de tus notas. No existe un motor de traducción local en este paquete y no se promete traducción general offline.

Servicios externos gratuitos pueden tener límites, interrupciones o cambios de condiciones. No hay cambio silencioso a un proveedor de IA. Si falla el servicio, las otras herramientas siguen funcionando.

## Privacidad, almacenamiento y copias

- Notas, calendario, archivos, audio, carpetas e historiales se guardan en **este navegador y este origen web**. Cambiar de dominio, navegador o perfil no migra esos datos.
- No hay subida automática de notas, fotos, archivos o audio. El OCR recibe la imagen en un worker local. Solo se envía el texto que eliges al pulsar **Traducir**, y la consulta que eliges al pulsar **Buscar**; el proveedor externo puede registrar esos datos conforme a sus condiciones.
- Si IndexedDB no está disponible, aparece un aviso permanente: los datos son **de sesión**, no persistentes. Exporta antes de salir. Los errores de cuota se muestran y no se anuncian falsamente como «Guardado».
- Borrar los datos del navegador o usar navegación privada puede eliminar el contenido. Solicitar almacenamiento persistente ayuda cuando el navegador lo concede, pero **no sustituye una copia**.
- **Ajustes → Exportar copia completa** descarga un JSON que incluye notas, eventos, ajustes, carpetas, archivos y grabaciones binarias, y también la papelera. No omite el audio ni los archivos para aligerarla. La copia no está cifrada: guárdala en un lugar privado.
- La importación valida y decodifica todo **antes** de reemplazar los datos. El reemplazo de IndexedDB es una única transacción: si falla, conserva la base anterior.
- Límite de copia completa: **250 MB**. Se advierte si el contenido sería demasiado grande; descarga individualmente los archivos grandes y libera su espacio antes de exportar. Los archivos en la papelera siguen ocupando espacio.
- Exportar todas las notas crea un **ZIP local con archivos TXT**, sin pedir una biblioteca a Internet. Cada nota también puede descargarse como TXT o guardarse en Archivos.
- Borrar todo pide confirmación y escribir **BORRAR** (o DELETE en interfaz inglesa). Limpia también texto e imágenes transitorias; los recursos OCR y el núcleo PWA no contienen datos personales.

## Añadir datos de otros idiomas al OCR

El paquete ya contiene `spa` y `eng`. Para catalán, francés, alemán o italiano, con Python 3 y conexión durante la preparación:

```bash
python3 descargar_ocr.py cat fra deu ita
```

El script guarda datos clásicos en `assets/ocr/langs`, sin componentes LSTM. No necesitas Python en el móvil: ejecuta el script en el ordenador donde preparas/publicas la carpeta. Después el móvil solo utiliza los archivos estáticos. Para funcionamiento offline en la PWA, abre cada idioma y realiza un reconocimiento para preparar su caché. Si faltan recursos o el navegador los elimina, se muestra un error y puedes escribir o corregir el texto a mano.

El OCR está orientado a **texto impreso nítido**. No se garantiza reconocimiento de escritura a mano ni de fotografías borrosas.

## Notificaciones, audio y compatibilidad

- Los recordatorios se programan mientras la app está abierta. **No hay push ni avisos fiables con la app cerrada**, y el navegador puede suspenderlos en segundo plano.
- Mantén la app abierta mientras grabas. Detén y comprueba el audio antes de salir; no se garantiza guardar un clip si el sistema termina el navegador abruptamente. El indicador rojo permite volver a la grabadora desde otra herramienta.
- Android moderno suele grabar WebM/Opus; otros navegadores pueden escoger otro formato admitido. La app elige un MIME soportado y usa su extensión al descargar.
- PDF utiliza el visor nativo si existe; si no, descarga el archivo para abrirlo con una aplicación compatible.
- No se prometen voces o idiomas que tu dispositivo no ofrezca. Instala paquetes de voz desde los ajustes del sistema cuando sea necesario. Si no hay voz compatible, el botón se desactiva y aparece un aviso.

## Pruebas y organización

El informe `PRUEBAS.md` y el JSON de resultados documentan **155 comprobaciones correctas, 0 fallidas** en Chromium 148. Incluyen traducción real, OCR clásico real en español/inglés y offline tras preparar recursos, persistencia, portapapeles, audio y recuperación de copias.

Cámara y micrófono se probaron con **dispositivos emulados**, no con un móvil físico. El entorno headless no ofrece voces del sistema: se verificó la detección y el aviso de ausencia, no una escucha humana de pronunciación. Prueba los permisos y las voces de tu Android real antes de usarla en clase.

```text
study-hub/
├── index.html            # HTML + CSS + JavaScript de toda la app
├── manifest.webmanifest  # Instalación PWA opcional
├── sw.js                 # Caché de núcleo y recursos OCR, sin datos de usuario
├── icons/                # Iconos de instalación dibujados, sin IA
├── assets/ocr/           # Tesseract clásico + español/inglés + licencias
├── descargar_ocr.py      # Preparar otros datos OCR clásicos
├── servidor.py           # Servidor estático de desarrollo
├── README.md
├── PRUEBAS.md
└── tests/                # Banco de aceptación reproducible
```

No hace falta Node.js para usar la aplicación. Solo se usa en el banco de pruebas. No se incluyen sus dependencias en el paquete.

### Referencias de implementación

- Tesseract.js: https://github.com/naptha/tesseract.js
- Datos de Tesseract: https://github.com/tesseract-ocr/tessdata
- Apertium APy: https://wiki.apertium.org/wiki/Apertium-apy
- MyMemory, parámetro `mt=0`, límites y condiciones: https://mymemory.translated.net/doc/spec.php

Las licencias y atribuciones de las bibliotecas redistribuidas están en `assets/ocr/licenses`.
