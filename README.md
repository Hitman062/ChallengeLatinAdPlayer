# ChallengeLatinAdPlayer

### Tareas

#### Ventana:

-   [x] El reproductor debe operar en pantalla completa y en modo ventana sin marcos.
-   [x] Permitir configurar las dimensiones de la ventana (alto, ancho) y su posición inicial (coordenadas X, Y desde la esquina superior izquierda).
-   [x] El cursor del mouse debe ocultarse si se encuentra sobre la ventana del reproductor.

#### Reproducción de Contenido:

-   [x] El reproductor debe reproducir imágenes y videos en loop.
-   [x] Las imágenes y videos deben descargarse localmente para garantizar que el reproductor funcione sin internet.
-   [x] Usar una librería como NeDB o LokiDB para la base de datos local.
-   [ ] La reproducción debe ser gapless (sin pantallas negras entre anuncios), precargando el anuncio siguiente en un div oculto.
-   [x] Mostrar anuncios ocupando toda la pantalla o respetando la relación de aspecto, según el campo "fill_screen" (CSS object-fit: fill o contain).

#### Orden, duración y filtrado de contenidos:

-   [x] Respetar el orden de reproducción basado en el campo "position", reproduciendo los anuncios en orden ascendente.
-   [x] Cada anuncio debe reproducirse durante el tiempo especificado en el campo "length" (milisegundos).
-   [x] Reproducir solo los anuncios dentro del rango de fechas especificado por "from_date" y "to_date".
-   [x] Eliminar automáticamente los archivos descargados de anuncios que ya no deben reproducirse.

#### Consulta y Actualización de Contenidos:

-   [x] Consultar un backend cada 10 segundos para obtener la lista de anuncios a reproducir.
-   [x] Actualizar los anuncios inmediatamente si se detectan cambios en el campo "updated_at".
-   [x] Actualizar contenido local

### Ejecucion:

-   Para ejecutar directamente la alicacion
    ```bash
    npm run start
    ```
-   La aplicacion tambien se puede ejecutar en modo debuger
