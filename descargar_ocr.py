#!/usr/bin/env python3
"""Recursos OCR clásicos, sin paquetes de Python externos.
Uso: python3 descargar_ocr.py [spa eng cat fra deu ita]
Descarga archivos oficiales gratuitos y elimina los componentes LSTM del traineddata.
No llama a servicios de reconocimiento; el motor seleccionado por Study Hub es OEM 0.
El paquete entregado ya incluye español e inglés. Este script añade otros idiomas.
"""
from pathlib import Path
import gzip
import struct
import sys
import urllib.request

ROOT=Path(__file__).resolve().parent / 'assets' / 'ocr'
BASE_JS='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/'
BASE_CORE='https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/'
LANG_BASE='https://tessdata.projectnaptha.com/4.0.0/'

def legacy_only(data):
    """Formato oficial Tessdata: uint32 cantidad + int64 offsets + componentes.
    Conserva clasificadores y diccionarios clásicos; elimina slots LSTM 17..22.
    Mantiene el componente de versión (23) y todos los componentes clásicos.
    No cambia ningún carácter ni genera datos lingüísticos.
    """
    n=struct.unpack_from('<I',data,0)[0]
    if not 1<=n<=64 or len(data)<4+8*n:
        raise ValueError('Cabecera traineddata no válida')
    old=struct.unpack_from('<'+'q'*n,data,4)
    active=[x for x in old if x>=0]
    if active!=sorted(active) or any(x<4+8*n or x>=len(data) for x in active):
        raise ValueError('Offsets traineddata no válidos')
    if n<=17 or all(old[i]<0 for i in range(17,min(n,23))):
        return data
    header_size=4+8*n
    output=bytearray(header_size)
    offsets=[-1]*n
    for i,start in enumerate(old):
        if start<0 or 17<=i<=22:
            continue
        following=[x for x in old[i+1:] if x>=0]
        end=following[0] if following else len(data)
        offsets[i]=len(output)
        output.extend(data[start:end])
    struct.pack_into('<I',output,0,n)
    struct.pack_into('<'+'q'*n,output,4,*offsets)
    return bytes(output)

def main():
    langs=sys.argv[1:] or ['spa','eng']
    if any(lang not in ['spa','eng','cat','fra','deu','ita'] for lang in langs):
        raise SystemExit('Idiomas válidos: spa eng cat fra deu ita')
    assets=[(BASE_JS+'tesseract.min.js',ROOT/'tesseract.min.js'),
            (BASE_JS+'worker.min.js',ROOT/'worker.min.js')]
    for name in ['tesseract-core.wasm.js','tesseract-core.wasm','tesseract-core-simd.wasm.js','tesseract-core-simd.wasm']:
        assets.append((BASE_CORE+name,ROOT/'core'/name))
    for lang in langs:
        assets.append((LANG_BASE+lang+'.traineddata.gz',ROOT/'langs'/(lang+'.traineddata.gz')))
    for url,path in assets:
        path.parent.mkdir(parents=True,exist_ok=True)
        if not path.exists():
            print('Descargando:',url,flush=True)
            tmp=path.with_suffix(path.suffix+'.part')
            try:
                with urllib.request.urlopen(url,timeout=90) as response,tmp.open('wb') as output:
                    while True:
                        chunk=response.read(1024*1024)
                        if not chunk:break
                        output.write(chunk)
                tmp.rename(path)
            except Exception:
                tmp.unlink(missing_ok=True)
                raise
        if path.name.endswith('.traineddata.gz'):
            old=gzip.decompress(path.read_bytes())
            classic=legacy_only(old)
            if classic!=old:
                path.write_bytes(gzip.compress(classic,compresslevel=9,mtime=0))
                print('Datos solo clásicos:',path.name,'(',len(classic),'bytes descomprimidos )')
            else:
                print('Datos clásicos preparados:',path.name)
        else:
            print('Disponible:',path.name)
    print('\nListo. Sirve la carpeta y activa «Recursos OCR locales» en el escáner.')
    print('En Android, cámara, micrófono y PWA requieren HTTPS; no basta una IP con HTTP.')
if __name__=='__main__':
    main()
