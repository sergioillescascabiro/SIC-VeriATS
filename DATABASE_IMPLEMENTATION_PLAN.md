# 🚀 PLAN DE IMPLEMENTACIÓN - SIC-VeriATS Database

## 📊 Resumen del Diseño Final

### Total de Tablas: **16 tablas**

#### Tablas Core (11)
1. `users` - Autenticación base
2. `companies` - Entidades empresariales
3. `jobs` - Ofertas de empleo
4. `skills` - Catálogo global de habilidades
5. `job_skills` - Skills requeridas por ofertas
6. `candidates`- Perfil completo del candidato
7. `candidate_education` - Historial académico
8. `candidate_experience` - Experiencia laboral
9. `applications` - Aplicaciones a ofertas
10. `application_skills` - Skills del candidato en aplicación
11. `selected_candidates` - Resultado final de selección

#### Tablas Adicionales (5)
12. `company_users` - Relación N:M entre users y companies
13. `candidate_documents` - Documentos versionados (CVs, certificados, etc.)
14. `audit_logs` - Auditoría centralizada de cambios
15. `notifications` - Sistema de notificaciones
16. `interviews` - Gestión de entrevistas

---

## 📋 FASE 1: Schema Base (Prioridad ALTA)

### Migración: `001_enums.sql`
```sql
-- ENUMs del sistema
CREATE TYPE user_role AS ENUM ('super_admin', 'company_user', 'candidate', 'screener');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE required_level AS ENUM ('basic', 'intermediate', 'advanced');
CREATE TYPE candidate_level AS ENUM ('basic', 'intermediate', 'advanced');
CREATE TYPE admin_state AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'selected', 'rejected');
CREATE TYPE skill_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE document_type AS ENUM ('cv', 'cv_anonymized', 'academic_certificate', 'cover_letter', 'photo');
CREATE TYPE notification_type AS ENUM ('application_status', 'skill_validated', 'new_application', 'interview_scheduled');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE interview_mode AS ENUM ('presencial', 'virtual', 'phone');
```

### Migración: `002_core_tables.sql`

**Orden de creación**:
1. `users`
2. `companies`
3. `company_users` ⭐ NUEVA
4. `skills`
5. `jobs`
6. `job_skills`
7. `candidates`
8. `candidate_education`
9. `candidate_experience`
10. `candidate_documents` ⭐ NUEVA
11. `applications`
12. `application_skills`
13. `selected_candidates`
14. `interviews` ⭐ NUEVA
15. `notifications` ⭐ NUEVA
16. `audit_logs` ⭐ NUEVA

#### Ejemplo completo de tabla con soft deletes:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  
  -- Soft deletes y auditoría
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active, deleted_at);
```

#### Tabla `skills` con aprobación admin:

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Aprobación admin
  status skill_status DEFAULT 'pending',
  
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Soft deletes
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_active ON skills(is_active, deleted_at);
```

---

## 📋 FASE 2: Auth Integration

### Migración: `003_auth_integration.sql`

```sql
-- Función helper para obtener user_id actual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Función helper para obtener rol actual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger para sync con auth.users (si es necesario)
-- Trigger para auto-update de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas que tienen updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 📋 FASE 3: RLS Policies

### Migración: `004_rls_policies.sql`

**Enable RLS en todas las tablas**:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

**Políticas por tabla** (ver documento principal para detalles completos)

---

## 📋 FASE 4: Full-Text Search

### Migración: `005_full_text_search.sql`

```sql
-- FTS en candidates
ALTER TABLE candidates ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(first_name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(last_name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(email, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(city, '')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(country, '')), 'C')
  ) STORED;

CREATE INDEX idx_candidates_search ON candidates USING GIN(search_vector);

-- FTS en jobs
ALTER TABLE jobs ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(location, '')), 'C')
  ) STORED;

CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);

-- FTS en skills
ALTER TABLE skills ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(category, '')), 'B')
  ) STORED;

CREATE INDEX idx_skills_search ON skills USING GIN(search_vector);
```

---

## 📋 FASE 5: Audit Triggers

### Migración: `006_audit_triggers.sql`

```sql
-- Trigger genérico de auditoría
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      get_current_user_id(),
      TG_TABLE_NAME,
      OLD.id,
      'deleted',
      row_to_json(OLD),
      NULL
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      get_current_user_id(),
      TG_TABLE_NAME,
      NEW.id,
      'updated',
      row_to_json(OLD),
      row_to_json(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      get_current_user_id(),
      TG_TABLE_NAME,
      NEW.id,
      'created',
      NULL,
      row_to_json(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas críticas
CREATE TRIGGER audit_applications
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_application_skills
AFTER INSERT OR UPDATE OR DELETE ON application_skills
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_skills
AFTER INSERT OR UPDATE OR DELETE ON skills
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_selected_candidates
AFTER INSERT OR UPDATE OR DELETE ON selected_candidates
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 📋 FASE 6: Indexes Compuestos

### Migración: `007_composite_indexes.sql`

```sql
-- Índices compuestos para queries frecuentes
CREATE INDEX idx_applications_job_status ON applications(job_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_candidate_status ON applications(candidate_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_application_skills_admin_state ON application_skills(application_id, admin_state);
CREATE INDEX idx_company_users_company ON company_users(company_id, is_active);
CREATE INDEX idx_candidate_documents_candidate_type ON candidate_documents(candidate_id, type, is_active);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at) WHERE is_read = false;
CREATE INDEX idx_interviews_date_status ON interviews(scheduled_date, status);
```

---

## 🌱 FASE 7: Seed Data

### Archivo: `seed.sql`

**Estructura**:
1. Limpiar datos existentes (con WHERE para idempotencia)
2. Insertar users (admins, company_users, candidates)
3. Insertar companies
4. Insertar company_users (relaciones)
5. Insertar skills (30-40 skills)
6. Insertar jobs
7. Insertar job_skills
8. Insertar candidates
9. Insertar candidate_education
10. Insertar candidate_experience
11. Insertar candidate_documents
12. Insertar applications
13. Insertar application_skills
14. Insertar selected_candidates (algunos)
15. Insertar interviews (algunos)

**UUIDs predecibles para testing**:
```sql
-- Usar UUIDs conocidos para facilitar testing
INSERT INTO users (id, email, password, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sic-veriats.com', '$hashed', 'super_admin')
  ON CONFLICT (id) DO NOTHING;
```

---

## ✅ Checklist de Implementación

### FASE 1: Schema Base
- [ ] Crear `001_enums.sql` con todos los ENUMs
- [ ] Crear `002_core_tables.sql` con las 16 tablas
- [ ] Verificar constraints y FKs
- [ ] Verificar índices básicos
- [ ] Añadir soft deletes (is_active, deleted_at) a todas las tablas clave

### FASE 2: Auth Integration
- [ ] Crear `003_auth_integration.sql`
- [ ] Implementar funciones helper
- [ ] Implementar triggers de updated_at

### FASE 3: RLS Policies
- [ ] Crear `004_rls_policies.sql`
- [ ] Enable RLS en todas las tablas
- [ ] Implementar políticas para cada rol
- [ ] Testear políticas con diferentes roles

### FASE 4: Full-Text Search
- [ ] Crear `005_full_text_search.sql`
- [ ] Añadir tsvector a candidates, jobs, skills
- [ ] Crear índices GIN
- [ ] Testear búsquedas

### FASE 5: Audit Triggers
- [ ] Crear `006_audit_triggers.sql`
- [ ] Implementar función genérica de auditoría
- [ ] Aplicar triggers a tablas críticas
- [ ] Verificar que audit_logs se puebla correctamente

### FASE 6: Indexes Compuestos
- [ ] Crear `007_composite_indexes.sql`
- [ ] Añadir índices para queries frecuentes
- [ ] Verificar performance con EXPLAIN

### FASE 7: Seed Data
- [ ] Crear `seed.sql`
- [ ] Poblar con datos realistas
- [ ] Verificar integridad referencial
- [ ] Testear diferentes escenarios

---

## 📊 Timeline Estimado

| Fase | Tiempo Estimado | Prioridad |
|------|-----------------|-----------|
| FASE 1: Schema Base | 4-6 horas | 🔥 CRÍTICA |
| FASE 2: Auth Integration | 2-3 horas | 🔥 CRÍTICA |
| FASE 3: RLS Policies | 3-4 horas | 🔥 CRÍTICA |
| FASE 4: Full-Text Search | 2 horas | ⚠️ ALTA |
| FASE 5: Audit Triggers | 2 horas | ⚠️ ALTA |
| FASE 6: Indexes Compuestos | 1 hora | ✅ MEDIA |
| FASE 7: Seed Data | 3-4 horas | 🔥 CRÍTICA |
| **TOTAL** | **17-24 horas** | |

---

## 🚀 Próximo Paso Inmediato

**¿Empezamos con FASE 1?**

Puedo generar ahora mismo:
1. `001_enums.sql` completo
2. `002_core_tables.sql` con las 16 tablas completas
3. Los scripts de automatización (init.sh, reset.sh, migrate.sh, seed.sh)

**¿Procedo?** 🎯
