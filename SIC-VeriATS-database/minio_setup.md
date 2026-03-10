# Guía de Configuración de MinIO (Almacenamiento Local de CVs)

Como hemos descartado Supabase Storage, **MinIO** es la alternativa perfecta. Es un servidor autoalojado 100% compatible con la API de Amazon S3. Esto significa que cualquier librería de backend (como `boto3` en Python o el SDK de AWS en Node.js) funcionará idénticamente como si estuvieras usando AWS, pero todo se queda en tu ordenador.

## 1. Levantar el Servidor MinIO
He creado un archivo `docker-compose.yml` en esta misma carpeta, súper simplificado para tu entorno local.

Abre una terminal en esta carpeta (`SIC-VeriATS-database`) y ejecuta:
```bash
docker-compose up -d
```
*(`-d` lo ejecuta en segundo plano).*

## 2. Acceder a la Consola de Administración Visual
Abre tu navegador y entra en:
👉 **http://localhost:9001**

- **Usuario:** `admin`
- **Contraseña:** `password123`

## 3. Crear el "Bucket" (Tu carpeta principal en la nube)
En la interfaz de MinIO:
1. Ve al menú izquierdo y haz clic en **"Buckets"**.
2. Haz clic en **"Create Bucket"**.
3. Nómbralo: `veriats-cvs` (todo en minúsculas).
4. Dale a crear.

### Hacer que los CVs sean legibles públicamente
Para que el frontend pueda mostrar un PDF a los reclutadores usando solo una URL, el Bucket tiene que permitir lecturas.
1. Haz clic en tu nuevo bucket `veriats-cvs`.
2. Ve a la pestaña **Summary** -> Busca el apartado **"Access Policy"** (por defecto estará en *Private*).
3. Haz clic en el lápiz para editar y cámbialo a **"Public"**.

## 4. Obtener las Claves para tu Backend (Access Keys)
Tu backend (Python, Node o el que sea) necesitará llaves para poder subir archivos automáticamente:
1. Ve al menú izquierdo y haz clic en **"Access Keys"**.
2. Dale a **"Create Access Key"**.
3. Copia el `Access Key` y el `Secret Key`. Estas son las variables de entorno que pondrás en tu API (`.env` del Backend).

## 5. El Flujo de Trabajo en el Backend
- Cuando un candidato sube su archivo (CV A o CV B), tu API lo recibe.
- Tu API usa la librería S3 conectándose a `http://localhost:9000` con las claves que acabas de generar.
- Lo sube al bucket `veriats-cvs`.
- MinIO genera una URL que se verá más o menos así: 
  `http://localhost:9000/veriats-cvs/uuid-del-candidato-cv_a.pdf`
- **Esa es la URL que tu Backend tiene que insertar en PostgreSQL (en la tabla `candidate_documents`).**

Cuando en la tabla `applications` el candidato decida usar el CV B para aplicar a una oferta específica, el backend simplemente guardará `cv_b` en la columna `resume_used`.
