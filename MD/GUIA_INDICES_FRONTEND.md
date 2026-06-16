# Guía de Integración Frontend — Índices de Libros

## ¿Qué cambió?

Ahora cuando se sube un PDF de un libro, el backend **extrae automáticamente** la tabla de contenidos (índice) usando el outline nativo del PDF. Si el PDF está bien maquetado con marcadores/capítulos, los índices se generan solos.

Si el PDF no tiene outline, el admin puede **cargar los índices manualmente** mediante CRUD.

Los índices reemplazan los antiguos archivos `book_menu-EU.ts` / `book_menu-US.ts` que se cargaban desde seed. Ahora se gestionan dinámicamente por API.

---

## Modelo de datos

Cada entrada de índice tiene esta estructura:

```typescript
interface VersionIndex {
  id: string;               // UUID
  version_id: string;       // UUID → versión del libro
  parent_id: string | null; // null = raíz, UUID = hijo de otra entrada
  title: string;            // "Capítulo 1: Introducción"
  page_number: number;      // 1
  sort_order: number;       // 0, 1, 2... orden entre hermanos
  level: number;            // 0 = capítulo, 1 = sub-capítulo, 2 = sub-sub...
  created_at: string;       // ISO date
  updated_at: string;       // ISO date
}
```

Cuando se **listan**, se devuelven como árbol:

```typescript
interface VersionIndexTreeNode extends VersionIndex {
  children: VersionIndexTreeNode[];
}
```

---

## Autenticación y base URL

- **Auth**: Bearer token (JWT) en header `Authorization: Bearer <token>`
- **Base URL**: `{API_URL}/v1/book/{bookId}/versions/{versionId}/indexes`
- Las operaciones de escritura (POST, PUT, DELETE) requieren **rol admin**
- `GET` (listar) funciona con cualquier usuario autenticado

---

## Endpoints

### 1. Extraer índices del PDF automáticamente

```
POST /book/{bookId}/versions/{versionId}/indexes/extract
```

No requiere body. Busca el PDF en GCS, lo procesa con pdfjs-dist, extrae el outline y lo guarda en la base de datos.

**Respuesta exitosa (200):**

```json
{
  "count": 8,
  "indexes": [
    {
      "id": "uuid-1",
      "version_id": "uuid-v",
      "parent_id": null,
      "title": "Antes de empezar",
      "page_number": 9,
      "sort_order": 0,
      "level": 0,
      "children": [
        {
          "id": "uuid-2",
          "parent_id": "uuid-1",
          "title": "Sobre nosotros",
          "page_number": 10,
          "sort_order": 0,
          "level": 1,
          "children": []
        }
      ]
    }
  ]
}
```

**Errores:**
- `400` — No hay PDF subido para esta versión
- `404` — Libro o versión no encontrada
- `422` — Error al procesar el PDF (corrupto o no parseable)

---

### 2. Listar índices (árbol completo)

```
GET /book/{bookId}/versions/{versionId}/indexes
```

Devuelve el árbol jerárquico completo de índices para la versión.

**Respuesta (200):** `VersionIndexTreeNode[]`

Los índices vienen ordenados por `sort_order` ascendente, con sus hijos anidados en `children`.

---

### 3. Crear entrada manual

```
POST /book/{bookId}/versions/{versionId}/indexes
```

**Body:**

```json
{
  "title": "Capítulo 3: Ejercicios",
  "page_number": 45,
  "parent_id": null,
  "sort_order": 2,
  "level": 0
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | ✅ | Título del capítulo/sección |
| `page_number` | number | ✅ | Número de página donde empieza |
| `parent_id` | string \| null | ❌ | UUID del padre (null = raíz) |
| `sort_order` | number | ❌ | Orden entre hermanos (default 0) |
| `level` | number | ❌ | 0 = capítulo, 1 = sub, etc. (default 0) |

**Respuesta (201):** `VersionIndex` (el objeto creado, con su UUID)

---

### 4. Actualizar entrada

```
PUT /book/{bookId}/versions/{versionId}/indexes/{id}
```

Body: todos los campos son opcionales, se actualiza solo lo que se envía.

```json
{
  "title": "Nuevo título",
  "page_number": 50,
  "sort_order": 1,
  "level": 0,
  "parent_id": null
}
```

**Respuesta (200):** `VersionIndex` (el objeto actualizado)

---

### 5. Eliminar entrada

```
DELETE /book/{bookId}/versions/{versionId}/indexes/{id}
```

Elimina la entrada y **todos sus hijos en cascada** (por la FK de la base de datos).

**Respuesta (200):**
```json
{ "message": "Index entry deleted successfully" }
```

---

### 6. Reordenar / batch update

```
PUT /book/{bookId}/versions/{versionId}/indexes/batch/reorder
```

Útil para drag & drop: podés cambiar `parent_id` y `sort_order` de múltiples entradas en una sola llamada.

**Body:**

```json
{
  "indexes": [
    { "id": "uuid-1", "parent_id": null, "sort_order": 0 },
    { "id": "uuid-2", "parent_id": null, "sort_order": 1 },
    { "id": "uuid-3", "parent_id": "uuid-1", "sort_order": 0 }
  ]
}
```

**Respuesta (200):** `VersionIndexTreeNode[]` — el árbol completo actualizado después del cambio.

---

## Flujo recomendado para el panel admin

### Paso 1: Subir el PDF

Los endpoints de subida (`POST /book/:bookId/versions` y `POST /book/upload-private-file`) ya disparan la extracción automática. No hace falta llamar a `/extract` después de subir.

### Paso 2: Si la extracción automática no encontró índices

Llamar a `GET /{versionId}/indexes`. Si devuelve `[]`, el PDF no tiene outline nativo.

En ese caso, el admin puede:
- Usar `POST /{versionId}/indexes` para crear las entradas una por una
- O subir un PDF con mejor maquetación (con marcadores/bookmarks)

### Paso 3: Re-extracción forzada

Si se sube un PDF corregido, se puede llamar a `POST /{versionId}/indexes/extract` manualmente. Esto **reemplaza** todos los índices existentes por los nuevos.

### Paso 4: Ajustes manuales

Después de extraer, se pueden:
- **Actualizar** títulos o números de página con `PUT /{versionId}/indexes/{id}`
- **Reordenar** con `PUT /{versionId}/indexes/batch/reorder`
- **Eliminar** entradas que no correspondan

---

## Ejemplo: Componente de administración en Next.js

```tsx
// api/version-indexes.ts
const API = `${process.env.NEXT_PUBLIC_API_URL}/v1`;

const headers = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const VersionIndexesAPI = {
  extract: (bookId: string, versionId: string, token: string) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes/extract`, {
      method: 'POST',
      headers: headers(token),
    }).then(r => r.json()),

  list: (bookId: string, versionId: string, token: string) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes`, {
      headers: headers(token),
    }).then(r => r.json()),

  create: (bookId: string, versionId: string, token: string, data: any) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (bookId: string, versionId: string, id: string, token: string, data: any) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes/${id}`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (bookId: string, versionId: string, id: string, token: string) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes/${id}`, {
      method: 'DELETE',
      headers: headers(token),
    }).then(r => r.json()),

  batchReorder: (bookId: string, versionId: string, token: string, indexes: any[]) =>
    fetch(`${API}/book/${bookId}/versions/${versionId}/indexes/batch/reorder`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({ indexes }),
    }).then(r => r.json()),
};
```

---

## Consideraciones

- **Auto-extracción no bloqueante**: si falla, el PDF se sube igual y se loguea un warning. El admin puede forzar re-extracción manual después.
- **Los índices son por versión**: cada versión de un libro tiene sus propios índices independientes.
- **Reemplazo completo en extracción**: llamar a `/extract` borra todos los índices existentes de esa versión y los reemplaza con los nuevos. No es un merge.
- **El batch/reorder respeta `parent_id`**: podés mover entradas entre capítulos cambiando su `parent_id`.
