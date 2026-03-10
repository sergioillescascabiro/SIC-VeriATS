# Modelo Lógico de Datos (3NF) - SIC-VeriATS

El modelo lógico traduce el modelo conceptual a estructuras relacionales específicas aplicando las reglas de normalización. Nuestro sistema ha sido rigurosamente estructurado hasta la **Tercera Forma Normal (3NF)**.

## Cumplimiento de Normalización (Hasta 3NF)

### 1NF (Primera Forma Normal)
- Todos los atributos contienen valores atómicos (indivisibles).
- No hay listas separadas por comas. Por ejemplo, en lugar de que el candidato tenga una columna "experiencias_laborales" tipo texto, se abstrajo a la tabla `candidate_experience`. Así, cada experiencia tiene su propia fila referenciando al candidato.
- No hay grupos repetitivos de columnas (Ej: `skill_1`, `skill_2`).

### 2NF (Segunda Forma Normal)
- El modelo cumple 1NF.
- Todos los atributos no clave dependen funcionalmente de la Clave Primaria Completa.
- En las tablas puente como `company_users` (PK: id), el rol de acceso depende de la combinación de la empresa y el usuario, pero usamos de forma estandarizada Claves Subrogadas Múltiples (UUID) como Primary Key y restricciones de unicidad compuestas (`UNIQUE(company_id, user_id)`), asegurando que los metadatos (como la fecha de adición) dependan enteramente de esa clave.

### 3NF (Tercera Forma Normal)
- El modelo cumple 2NF.
- **No existen dependencias transitivas.** Todo atributo no clave depende *exclusivamente* de la clave primaria y no de otro atributo no clave.
- Por ejemplo, en `candidates`, en lugar de guardar "nombre_del_pais_y_su_moneda", se guardan atributos granulares y exclusivos del ciudadano. En `locations` se almacena independientemente cada string.
- El estado general de una posición (`jobs.status`) y su ubicación no dependen de la empresa, sino únicamente del ID del trabajo.

## Tablas y Relaciones (Crow's Foot)

A nivel lógico, las relaciones M:N del modelo conceptual se han resuelto mediante **Entidades Intermedias**:
1. `company_users`: Rompe la relación *"Usuario gestiona Empresa"*. Contiene el atributo `role` (Admin, Reclutador).
2. `job_skills`: Rompe la relación *"Oferta requiere Habilidad"*. Añade el atributo `required_level`.
3. `application_skills`: Rompe la relación *"Candidato declara Habilidad"*. Almacena el nivel que afirma poseer el candidato, la respuesta/justificación del candidato, y el `admin_state` (aprobado o rechazado por la administración).

### Estructura Periférica del Candidato
Para mantener la 3NF y aislar atributos dependientes por temporalidad, el historial del candidato se almacena parcialmente como Tablas Satélites (relación 1:N hacia Candidato):
- `candidate_experience`: Cargo, empresa, descripciones, fechado temporal e indicador de si es trabajo actual.
- `candidate_documents`: (URLs de los assets en la nube como CVs, Certificados Académicos, Capturas GPA), evitando añadir campos BLOB a la tabla principal.

*Excepción al modelo genérico:* Los datos académicos (`candidate_education`) fueron eliminados como tabla independiente 1:N y se "aplanaron" directamente dentro de la tabla principal `candidates` (como `bachelor_mark`, `master_upm_mark`, `master_usa_gpa`). Esto responde a una regla de negocio altamente específica de *General Matching*, donde el formulario exige exactamente esos 3 hitos académicos cerrados a todos los candidatos. Esta decisión evita JOINs innecesarios.

### Auditoría y Notificaciones
Se implementan tablas aisladas (`audit_logs` y `notifications`) cuya clave externa es `user_id`, asegurando que el seguimiento del sistema no contamina la lógica estricta del modelo de recursos humanos.
