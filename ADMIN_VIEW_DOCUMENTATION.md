# Vista Completa del Administrador - SIC-VeriATS

## Resumen

Se ha implementado la vista completa del Administrador Principal para el sistema ATS multi-empresa de feria de empleo. El administrador tiene visión global del sistema y es el único con permisos para validar requisitos y seleccionar candidatos.

## Arquitectura Implementada

### Navegación Principal
La vista del administrador está organizada en **5 pestañas principales** (componente `AdminTabNavigation`):

1. **Panel General** (`/admin/dashboard`)
2. **Empresas** (`/admin/companies`)
3. **Ofertas** (`/admin/jobs`)
4. **Candidatos** (`/admin/candidates`)
5. **Evaluación** (`/admin/evaluation`)

---

## 1. Panel General (`AdminDashboard.tsx`)

Vista de control global del evento de feria de empleo.

### Contenido:
- **Resumen estadístico:**
  - Empresas publicadas (vs. total)
  - Ofertas activas (vs. total)
  - Candidatos registrados
  - Candidatos pendientes de evaluación
  - Candidatos seleccionados
  
- **Progreso de evaluación:**
  - Indicador visual de progreso (%)
  - Barra de progreso animada

- **Acciones rápidas:**
  - Ir a Evaluación (muestra pendientes)
  - Gestionar Ofertas (muestra activas)
  - Ver Empresas (muestra publicadas)

### Características:
- Grid responsivo de tarjetas estadísticas
- Códigos de color por tipo de métrica
- Tarjeta especial con gradiente para progreso
- Enlaces rápidos a secciones críticas

---

## 2. Empresas (`AdminCompanies.tsx`)

Vista de gestión de empresas participantes.

### Contenido:
- **Listado de empresas** con:
  - Logo o ícono placeholder
  - Nombre de la empresa
  - Descripción (si existe)
  - Número de ofertas publicadas
  - Estado: Borrador / Publicada

- **Filtros:**
  - Todas
  - Publicadas
  - Borradores

### Acciones del Admin:
- ✏️ **Editar empresa**
- 👁️ **Publicar/Despublicar** empresa
- 💼 **Ver ofertas** de la empresa
- ➕ **Crear nueva empresa**

### Características:
- Grid responsivo (2 columnas en desktop)
- Badges de estado
- Contador de ofertas por empresa
- Navegación a ofertas de cada empresa

---

## 3. Ofertas (`AdminJobs.tsx`)

Vista de gestión de todas las ofertas del sistema.

### Contenido:
- **Listado de ofertas** con:
  - Nombre de la empresa
  - Título del puesto
  - Ubicación y tipo de contrato
  - Estado: Borrador / Publicada / Cerrada
  - Número de candidatos postulados

- **Filtros múltiples:**
  - Por estado: Todas / Publicadas / Borradores / Cerradas
  - Por empresa: selector dinámico de empresas

### Acciones del Admin:
- ✏️ **Editar oferta**
- 📋 **Definir requisitos**
- 👥 **Ver candidatos** postulados
- ➕ **Crear nueva oferta**

### Características:
- Grid de 3 columnas en desktop
- Doble filtrado (estado + empresa)
- Contador de candidatos destacado
- Estado visual con badges coloreados

---

## 4. Candidatos (`AdminCandidates.tsx`)

Vista global de todos los candidatos de la feria.

### Contenido:
- **Estadísticas resumidas:**
  - Total de candidatos
  - Sin evaluar
  - En evaluación
  - Seleccionados
  - Rechazados

- **Listado de candidatos** con:
  - Identificador anonimizado (SIC-XXX)
  - Nombre completo (visible solo para admin)
  - Email
  - Número de postulaciones
  - Estado de evaluación
  - Indicador de CV disponible

- **Búsqueda y filtros:**
  - Búsqueda por ID, nombre o email
  - Filtrado por estado de evaluación

### Acciones del Admin:
- 👤 **Ver perfil completo**
- 📊 **Evaluar** candidato
- Acceso directo a evaluación por candidato

### Características:
- 5 tarjetas de estadísticas con color por estado
- Barra de búsqueda integrada
- Lista compacta con tarjetas hover
- Códigos de color consistentes (naranja=evaluación, verde=seleccionado, rojo=rechazado)

---

## 5. Evaluación (`AdminEvaluation.tsx`)

**Vista operativa clave del Administrador** - Única vista donde se toman decisiones.

### Flujo de trabajo:

#### Paso 1: Selección de Oferta
- Lista de ofertas disponibles
- Muestra número de candidatos y requisitos por oferta
- Click para comenzar evaluación

#### Paso 2: Evaluación por Candidato
Vista dividida en 2 paneles (desktop) o tabs (mobile):

**Panel Izquierdo: CV del Candidato**
- Visor de PDF del currículum
- Placeholder para integración futura

**Panel Derecho: Validación de Requisitos**
Para cada requisito:
- Título y descripción del requisito
- Badge "Obligatorio" si aplica
- Justificación escrita por el candidato
- Acciones del admin:
  - ✅ **Cumple** / ❌ **No cumple**
  - Campo de comentario opcional

#### Paso 3: Decisión Final
- **Seleccionar** candidato
- **No Seleccionar** (rechazar)
- Botones deshabilitados hasta validar todos los requisitos obligatorios

### Navegación entre candidatos:
- Botones ⬅️ Anterior / Siguiente ➡️
- Contador de progreso (Candidato X de N)
- Opción de cambiar de oferta

### Características especiales:
- Vista split-screen eficiente (CV + Requisitos)
- Validación en tiempo real de requisitos obligatorios
- Navegación fluida entre candidatos
- Estado persistente de decisiones
- Responsive con tabs en mobile
- Diseño orientado a eficiencia y velocidad

---

## Componentes Reutilizados

### Desde vistas existentes:
- `Card` - Tarjetas base
- `Button` - Botones con variantes
- `Badge` - **Extendido** con nuevas variantes (success, warning, default, secondary)
- `Avatar` - Para usuarios/candidatos (si aplica)

### Nuevos componentes admin:
- `AdminTabNavigation` - Navegación de pestañas principal
- Componentes específicos de cada vista (integrados)

---

## Tipos TypeScript (`types/admin.ts`)

Se crearon tipos completos para el dominio del administrador:

```typescript
- AdminStats - Estadísticas del dashboard
- AdminCompany - Empresas con estado
- AdminJob - Ofertas con requisitos
- AdminRequirement - Requisito de una oferta
- AdminCandidate - Candidato con estado de evaluación
- CandidateApplication - Postulación completa
- RequirementResponse - Respuesta a requisito con validación
- EvaluationDecision - Decisión final del admin
```

---

## Principios de Diseño Aplicados

✅ **Priorizar eficiencia sobre estética**
- Layouts optimizados para trabajo rápido
- Menos clicks para acciones comunes

✅ **Reducir navegación innecesaria**
- Acciones inline cuando es posible
- Enlaces directos contextuales

✅ **Permitir trabajo en paralelo**
- Vista de evaluación permite navegar entre candidatos sin salir
- Filtros rápidos en todas las vistas

✅ **Claridad absoluta de estados y decisiones**
- Badges coloreados consistentes
- Estados visibles en todo momento
- Confirmación visual de acciones

---

## Restricciones Implementadas

🔒 **El Admin es el único decisor**
- Solo el admin ve las vistas de evaluación
- Solo el admin puede seleccionar candidatos

🔒 **Las empresas no influyen en la evaluación**
- Separación clara de responsabilidades
- Empresas no acceden a evaluación

🔒 **El candidato no ve información interna**
- Estados internos no expuestos
- Candidatos solo ven su status público

---

## Rutas Implementadas

```typescript
/admin/dashboard      → Panel General
/admin/companies      → Gestión de Empresas
/admin/jobs           → Gestión de Ofertas
/admin/candidates     → Vista de Candidatos
/admin/evaluation     → Evaluación (decisiones)
/admin/validation     → Legacy (validación anterior)
```

---

## Estado Actual

### ✅ Completado:
1. Arquitectura de 5 vistas principales
2. Navegación con tabs persistente
3. Componentes UI base extendidos
4. Tipos TypeScript completos
5. Mock data para desarrollo
6. Rutas registradas en el route tree
7. Responsive design (mobile + desktop)
8. Vista de evaluación con split-screen

### 🔄 Pendiente (TODOs en código):
1. Integración con API real (actualmente usa mock data)
2. Visor de PDF real en evaluación
3. Modales de creación/edición de empresas y ofertas
4. Editor de requisitos
5. Gestión de estados con mutaciones (React Query)
6. Persistencia de evaluaciones
7. Navegación condicional según permisos

---

## Próximos Pasos Sugeridos

1. **Integrar con Backend:**
   - Conectar endpoints de admin
   - Implementar mutations para CRUD
   - Gestión de permisos

2. **Completar Formularios:**
   - Crear/editar empresa
   - Crear/editar oferta
   - Editor de requisitos

3. **Visor de CV:**
   - Integrar biblioteca de visualización de PDF
   - Implementar descarga de CV

4. **Optimizaciones:**
   - Paginación en listas largas
   - Lazy loading de datos
   - Caché de evaluaciones

---

## Uso de la Vista Admin

### Para empezar a usar:

1. Navega a `/admin/dashboard` después de login
2. Explora las estadísticas generales
3. Accede a cada sección desde las tabs
4. Para evaluar:
   - Ir a "Evaluación"
   - Seleccionar oferta
   - Evaluar candidatos uno por uno
   - Tomar decisión final

### Workflow típico:
```
Dashboard → Ver pendientes → Evaluación → 
Seleccionar oferta → Revisar CV → 
Validar requisitos → Decisión final → 
Siguiente candidato
```

---

## Notas Técnicas

- **Framework:** React 18 + TypeScript
- **Routing:** TanStack Router
- **State:** React Query (para datos async)
- **Styling:** Tailwind CSS
- **Icons:** Heroicons (outline)
- **Responsive:** Mobile-first approach

---

**Fecha de implementación:** Enero 2026  
**Versión:** 1.0.0  
**Estado:** Desarrollo - Listo para integración con backend
