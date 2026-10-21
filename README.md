# Sella

Certificados verificables y perfil profesional para la estética. Las instituciones emiten
certificados con código y QR; cada profesional reúne su formación en un perfil para compartir;
cualquiera la verifica en segundos, sin crear cuenta.

Es un prototipo y piloto de Impulso Creativo (3 meses en la Patagonia, con dos instituciones).

## Para empezar

```bash
npm install
echo "DEMO_MODE=true" > .env.local   # datos de prueba, bandeja de mails y accesos rápidos
npm run dev                           # http://localhost:3000 → la guía de la demo está en /demo
```

No hace falta instalar una base de datos: sin `DATABASE_URL` se usa PGlite, un Postgres que corre
dentro de Node. `npm run demo:reiniciar` (con el servidor apagado) vuelve todo al inicio.

## Documentación

- `docs/estado.md`: qué está hecho, qué falta y qué hay que confirmar. **Empezá por acá.**
- `docs/producto.md`: qué es, pantallas, flujos, decisiones, privacidad y tono.
- `docs/modelo-de-datos.md`: las tablas y por qué.
- `docs/arquitectura.md`: stack, carpetas, reglas de Next 16, permisos, diseño y cómo correrlo.

## Antes de subir cambios

```bash
npm run typecheck && npm run lint && npm test   # tipos, estilo y pruebas de lógica
npm run test:e2e                                # pruebas de punta a punta (celular y escritorio)
```
