#!/usr/bin/env python3
"""Servidor ESTÁTICO de desarrollo; no recibe notas, audio ni archivos del navegador.
En Android utiliza HTTPS para cámara/micrófono/PWA. localhost es seguro en el mismo PC.
Uso: python3 servidor.py [puerto]
"""
import http.server
import os
import sys
from pathlib import Path

os.chdir(Path(__file__).resolve().parent)
class StaticServer(http.server.SimpleHTTPRequestHandler):
    extensions_map={**http.server.SimpleHTTPRequestHandler.extensions_map,'.webmanifest':'application/manifest+json','.wasm':'application/wasm','.js':'application/javascript'}
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        if self.path.split('?')[0].endswith(('sw.js','index.html')) or self.path=='/':
            self.send_header('Cache-Control','no-cache')
        super().end_headers()
port=int(sys.argv[1]) if len(sys.argv)>1 else 8123
print('Study Hub estático en http://0.0.0.0:'+str(port),flush=True)
http.server.ThreadingHTTPServer(('0.0.0.0',port),StaticServer).serve_forever()
