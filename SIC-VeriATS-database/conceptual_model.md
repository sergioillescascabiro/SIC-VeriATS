# Modelo Conceptual de Datos (SIC-VeriATS)

El modelo conceptual describe la semántica del dominio, las entidades de negocio involucradas y las relaciones entre ellas a un alto nivel de abstracción.

## Entidades Principales

1. **Usuario (User):** Representa a un individuo autenticado en el sistema. Puede ser un candidato, un reclutador o un administrador.
2. **Candidato (Candidate):** Representa el perfil profesional de un usuario. Existe una relación de especialización (Is-A) con Usuario.
3. **Empresa (Company):** Representa a una organización que busca contratar personal.
4. **Oferta de Empleo (Job):** Representa una vacante publicada por una Empresa.
5. **Habilidad (Skill):** Representa una competencia requerida por una oferta o poseída por un candidato. Es un diccionario global maestro.
6. **Candidatura (Application):** Representa el evento o intención de un Candidato de aplicar a una Oferta de Empleo.
7. **Entrevista (Interview):** Representa un evento programado para evaluar a un Candidato en el marco de una Candidatura.

## Relaciones de Negocio y Cardinalidad

- **Usuario gestiona Empresa (N:M):** Un usuario (reclutador) puede administrar el perfil de varias empresas, y una empresa puede tener varios reclutadores.
- **Usuario es un Candidato (1:1):** Cada candidato tiene una cuenta de usuario central para iniciar sesión.
- **Empresa publica Oferta de Empleo (1:N):** Una empresa es la dueña absoluta de sus ofertas de empleo.
- **Oferta de Empleo requiere Habilidad (N:M):** Múltiples vacantes exigen diversas habilidades (Ej: Java, SQL).
- **Candidato aplica a Oferta (N:M):** Esta relación a nivel conceptual se transforma en la entidad puente **Candidatura** debido a que maneja estado propio (Pendiente, Aceptada, Rechazada).
- **Candidato declara Habilidad en Candidatura (N:M):** Durante una candidatura, las habilidades exigidas deben ser respondidas/justificadas por el candidato.
- **Candidatura tiene Entrevistas (1:N):** El proceso de selección para una solicitud específica puede abarcar múltiples rondas de entrevistas.

## Justificación de Decisiones Conceptuales

1. **Separación de User y Candidate:** Al abstraer `User`, permitimos que la autenticación sea general, mientras que `Candidate` aloja únicamente los datos curriculares (nombre, teléfono, ciudad). De esta forma un `User` tipo `company_user` no necesita campos innecesarios.
2. **Entidad "Candidatura" vs Relación Simple:** Se decidió elevar la postulación de "relación" a "entidad fuerte" (`Application`) porque posee ciclo de vida propio y actúa como ancla para entidades dependientes (Entrevistas, Selección Final).
3. **Diccionario de Habilidades Global:** La entidad `Skill` no pertenece a una sola empresa ni candidato; es global. Esto permite búsquedas y estadísticas transversales en todo el sistema.
4. **Métricas Académicas como Atributos del Candidato:** Se modeló el historial académico (Notas de Grado, Máster UPM y GPA en USA) como atributos directos de la entidad `Candidato` y no como entidades independientes, dado que el dominio exige estrictamente esos 3 valores predefinidos ("General Matching") unificando el formato de comparación para las empresas.
