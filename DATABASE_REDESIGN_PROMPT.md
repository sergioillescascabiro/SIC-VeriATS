# 🗃️ PROMPT: Implementación de Base de Datos SIC-VeriATS - ATS Multi-Empresa

## 📋 CONTEXTO DEL PROYECTO

**SIC-VeriATS** es un **ATS (Applicant Tracking System) Multi-Empresa** orientado a la gestión de ofertas de empleo y selección de candidatos. El sistema permite que múltiples empresas publiquen ofertas, gestionen aplicaciones y validen habilidades de candidatos a través de un catálogo global de skills reutilizable.

### 🔑 Características Principales

- **Multi-empresa**: Cada empresa gestiona sus propias ofertas independientemente
- **Sistema de Skills Global**: Catálogo compartido de habilidades reutilizables entre empresas
- **Validación de Habilidades**: Los admins validan las skills declaradas por candidatos
- **Proceso de Selección Completo**: Desde aplicación hasta selección final
- **Perfil Enriquecido**: Candidatos con educación, experiencia y documentos

### ⚠️ Restricciones Importantes

- ❌ **NO existen ferias de empleo** - Cada oferta es independiente
- ✅ Las skills son **globales y reutilizables**
- ✅ Los candidatos **solo añaden skills al aplicar a ofertas**
- ✅ **No hay "blind hiring"** - Sistema tradicional de ATS

---

## 🎯 OBJETIVO

Crear un **proyecto independiente de base de datos en Supabase** que:
1. Se ejecute en un **contenedor Docker local** en tu ordenador
2. Contenga **toda la lógica de base de datos** (esquema, migraciones, RLS, seeds)
3. Sea **completamente independiente** del backend FastAPI
4. Pueda ser **desplegado a producción** en Supabase Cloud cuando esté listo

---

## 📁 NUEVA ESTRUCTURA DEL PROYECTO

### Directorio Database (A CREAR)
```
SIC-VeriATS-database/
├── docker-compose.yml              # Supabase local stack
├── .env.example                    # Template de variables
├── .env                            # Variables locales (gitignored)
├── supabase/
│   ├── config.toml                 # Configuración Supabase CLI
│   ├── migrations/                 # Migraciones SQL ordenadas
│   │   ├── 001_schema_base.sql
│   │   ├── 002_auth_integration.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_functions.sql
│   │   └── 005_indexes.sql
│   ├── seed.sql                    # Datos de seed en SQL
│   └── functions/                  # Funciones PL/pgSQL
├── scripts/
│   ├── init.sh                     # Inicializar Supabase local
│   ├── reset.sh                    # Reset completo de DB
│   ├── migrate.sh                  # Aplicar migraciones
│   └── seed.sh                     # Aplicar seeds
├── docs/
│   ├── ERD.md                      # Diagrama entidad-relación
│   ├── SCHEMA.md                   # Documentación del esquema
│   └── RLS_POLICIES.md             # Documentación de RLS
└── README.md                       # Instrucciones de uso
```

---

## 🗂️ NUEVO ESQUEMA DE BASE DE DATOS

### 🎯 Organización del Sistema

El sistema se organiza en torno a:
1. **Empresas** que publican ofertas
2. **Ofertas** que requieren skills
3. **Candidatos** que aplican a ofertas
4. **Applications** que contienen skills del candidato
5. **Skills** globales reutilizables

---

### **ENTIDADES PRINCIPALES**

#### 1. **`users`** - Entidad base de autenticación

Tabla base para autenticación. **NO contiene información de perfil**.

```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'company_user', 'candidate', 'screener');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed
  role user_role NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
```

**Roles**:
- `super_admin`: Administrador del sistema
- `company_user`: Usuario de empresa
- `candidate`: Candidato
- `screener`: Admin con permisos limitados

---

#### 2. **`companies`** - Empresas participantes

Entidad separada para empresas. **NO está en users**.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  contact_email VARCHAR(255),
  website VARCHAR(500),
  
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_created_by ON companies(created_by);
CREATE INDEX idx_companies_name ON companies(name);
```

**Relación**: Un `user` con role `company_user` puede gestionar una o más `companies`.

---

#### 3. **`jobs`** - Ofertas de empleo

Cada oferta es independiente (no hay ferias).

```sql
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  pdf_description VARCHAR(500), -- URL a PDF opcional
  location VARCHAR(255),
  status job_status NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
```

**Regla**: El nombre de la oferta contiene implícitamente la referencia al evento (si aplica).

---

#### 4. **`skills`** - Catálogo global de habilidades

**Sistema clave**: Catálogo compartido y reutilizable.

```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100), -- Ej: "Programming", "Soft Skills", "Languages"
  
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
```

**Reglas**:
- Las skills son **globales** y compartidas entre todas las empresas
- Si una empresa necesita una skill existente, la **reutiliza**
- Solo se crea una nueva si **no existe**
- Pueden ser creadas por empresas o admins

---

#### 5. **`job_skills`** - Skills requeridas por ofertas

Tabla intermedia entre `jobs` y `skills`.

```sql
CREATE TYPE required_level AS ENUM ('basic', 'intermediate', 'advanced');

CREATE TABLE job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  
  required_level required_level NOT NULL,
  
  UNIQUE(job_id, skill_id)
);

CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);
```

**Nota**: Cada job puede requerir la misma skill solo una vez (con un nivel específico).

---

#### 6. **`candidates`** - Perfil completo del candidato

Perfil enriquecido con toda la información del candidato.

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Información básica
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL, -- Puede diferir del user email
  phone_number VARCHAR(50),
  
  -- Dirección
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  
  -- Información adicional
  availability_to_start DATE,
  source_of_application VARCHAR(100), -- Ej: "LinkedIn", "Referral"
  photo_url VARCHAR(500),
  
  -- Documentos
  cv_file VARCHAR(500), -- URL a archivo CV
  academic_file VARCHAR(500), -- URL a expediente académico
  cover_letter TEXT, -- Carta de presentación general (opcional)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_city ON candidates(city);
CREATE INDEX idx_candidates_country ON candidates(country);
```

---

#### 7. **`candidate_education`** - Información académica

Un candidato puede tener **múltiples registros académicos**.

```sql
CREATE TABLE candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  academic_level VARCHAR(100), -- Ej: "Bachelor", "Master", "PhD"
  degree VARCHAR(255), -- Título obtenido
  specialty VARCHAR(255), -- Especialidad
  country VARCHAR(100),
  institution VARCHAR(255),
  
  start_date DATE,
  end_date DATE,
  overall_average_mark DECIMAL(5,2), -- Nota media (ej: 8.5)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidate_education_candidate_id ON candidate_education(candidate_id);
```

---

#### 8. **`candidate_experience`** - Experiencia profesional

Historial laboral del candidato.

```sql
CREATE TABLE candidate_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  
  start_date DATE NOT NULL,
  end_date DATE, -- NULL si is_current = true
  is_current BOOLEAN DEFAULT false,
  
  roles_description TEXT, -- Descripción de responsabilidades
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidate_experience_candidate_id ON candidate_experience(candidate_id);
CREATE INDEX idx_candidate_experience_is_current ON candidate_experience(is_current);
```

---

#### 9. **`applications`** - Aplicaciones a ofertas

Cuando un candidato aplica a una oferta.

```sql
CREATE TYPE application_status AS ENUM ('pending', 'in_review', 'selected', 'rejected');

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  status application_status DEFAULT 'pending',
  
  UNIQUE(candidate_id, job_id) -- Un candidato solo puede aplicar una vez a cada job
);

CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
```

---

#### 10. **`application_skills`** - Skills del candidato en aplicación

⚡ **ENTIDAD MÁS IMPORTANTE DEL FLUJO**

**Concepto clave**:
- El candidato **NO crea skills en su perfil**
- Solo puede añadir habilidades **cuando aplica a una oferta**
- Está **respondiendo a las skills requeridas** por esa oferta

```sql
CREATE TYPE admin_state AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE candidate_level AS ENUM ('basic', 'intermediate', 'advanced');

CREATE TABLE application_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  
  -- Nivel declarado por el candidato
  candidate_level candidate_level NOT NULL,
  
  -- Justificación del candidato
  justification TEXT,
  
  -- Validación del admin
  admin_comment TEXT,
  admin_state admin_state DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(application_id, skill_id) -- Cada skill solo una vez por aplicación
);

CREATE INDEX idx_application_skills_application_id ON application_skills(application_id);
CREATE INDEX idx_application_skills_skill_id ON application_skills(skill_id);
CREATE INDEX idx_application_skills_admin_state ON application_skills(admin_state);
```

**Flujo**:
1. Candidato ve oferta con skills requeridas
2. Al aplicar, declara su nivel en cada skill relevante
3. Admin valida cada skill (approved/rejected)

---

#### 11. **`selected_candidates`** - Registro final de selección

Resultado final del proceso de selección.

```sql
CREATE TABLE selected_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  final_decision TEXT NOT NULL, -- "Selected", "Reserved", etc.
  interview_date TIMESTAMPTZ, -- Fecha de entrevista (futuro, opcional)
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_selected_candidates_job_id ON selected_candidates(job_id);
CREATE INDEX idx_selected_candidates_candidate_id ON selected_candidates(candidate_id);
```

---

## � REGLAS DE NEGOCIO CLAVE

### 📌 Reglas Fundamentales

1. **Skills Globales**:
   - El candidato **NO puede crear skills propias**
   - Solo puede asignar skills **al aplicar a una oferta**
   - Las skills son **globales y reutilizables** entre empresas

2. **Gestión de Skills**:
   - Las empresas pueden:
     - Crear nuevas skills si no existen
     - Reutilizar skills existentes del catálogo
     - Definir el nivel requerido por oferta (basic/intermediate/advanced)

3. **Validación de Skills**:
   - El admin valida **cada skill aportada** por el candidato
   - Estados: `pending` → `approved` / `rejected`

4. **Sin Ferias de Empleo**:
   - **NO existe ninguna referencia a ferias** en la base de datos
   - Cada oferta es independiente
   - El nombre de la oferta puede incluir referencia implícita al evento

5. **Aplicaciones Únicas**:
   - Un candidato solo puede aplicar **una vez** a cada job
   - Constraint: `UNIQUE(candidate_id, job_id)`

6. **Niveles Estandarizados**:
   - **Exactamente tres niveles** para skills:
     - `basic`
     - `intermediate`
     - `advanced`
   - Se elimina `expert` del diseño anterior

---

## 🔗 RELACIONES PRINCIPALES

```mermaid
erDiagram
    USERS ||--o{ COMPANIES : "creates"
    USERS ||--o| CANDIDATES : "has profile"
    USERS ||--o{ SKILLS : "creates"
    
    COMPANIES ||--o{ JOBS : "publishes"
    
    JOBS ||--o{ JOB_SKILLS : "requires"
    SKILLS ||--o{ JOB_SKILLS : "used in"
    
    CANDIDATES ||--o{ CANDIDATE_EDUCATION : "has"
    CANDIDATES ||--o{ CANDIDATE_EXPERIENCE : "has"
    CANDIDATES ||--o{ APPLICATIONS : "applies"
    
    APPLICATIONS }o--|| JOBS : "applies to"
    APPLICATIONS ||--o{ APPLICATION_SKILLS : "contains"
    APPLICATIONS ||--o| SELECTED_CANDIDATES : "results in"
    
    SKILLS ||--o{ APPLICATION_SKILLS : "evaluated in"
```

### Resumen de Relaciones

- **Company → Job** (1:N) - Una empresa publica muchas ofertas
- **Job → JobSkill**  (1:N) - Una oferta requiere varias skills
- **Skill → JobSkill** (1:N) - Una skill puede ser requerida por muchas ofertas
- **Candidate → Application** (1:N) - Un candidato puede aplicar a muchas ofertas
- **Application → ApplicationSkill** (1:N) - Una aplicación contiene varias skills
- **Candidate → CandidateEducation** (1:N) - Múltiples registros académicos
- **Candidate → CandidateExperience** (1:N) - Múltiples experiencias laborales
- **Application → SelectedCandidates** (1:1) - Resultado final opcional

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Políticas por Tabla

#### **users**
```sql
-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- Los admins pueden leer todos los usuarios
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.role IN ('super_admin', 'screener')
    )
  );
```

#### **companies**
```sql
-- Las empresas son públicas (lectura)
CREATE POLICY "Companies are publicly readable" ON companies
  FOR SELECT USING (true);

-- Solo el creador o admins pueden modificar
CREATE POLICY "Creator can manage company" ON companies
  FOR ALL USING (
    created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'super_admin'
    )
  );
```

#### **jobs**
```sql
-- Jobs publicados son públicos
CREATE POLICY "Published jobs are public" ON jobs
  FOR SELECT USING (status = 'published');

-- Company user puede gestionar jobs de su empresa
CREATE POLICY "Company can manage own jobs" ON jobs
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies 
      WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Admins pueden ver todos
CREATE POLICY "Admins can see all jobs" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('super_admin', 'screener')
    )
  );
```

#### **skills**
```sql
-- Skills son públicas (catálogo global)
CREATE POLICY "Skills are publicly readable" ON skills
  FOR SELECT USING (true);

-- Solo company_user y admins pueden crear skills
CREATE POLICY "Authorized users can create skills" ON skills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('super_admin', 'company_user')
    )
  );
```

#### **candidates**
```sql
-- Candidato puede leer su propio perfil
CREATE POLICY "Candidates can read own profile" ON candidates
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Candidato puede actualizar su propio perfil
CREATE POLICY "Candidates can update own profile" ON candidates
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Admins pueden leer todos los perfiles
CREATE POLICY "Admins can read all candidates" ON candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('super_admin', 'screener')
    )
  );
```

#### **applications**
```sql
-- Candidato puede ver sus propias aplicaciones
CREATE POLICY "Candidates can see own applications" ON applications
  FOR SELECT USING (
    candidate_id = (
      SELECT id FROM candidates 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Empresas pueden ver aplicaciones a sus ofertas
CREATE POLICY "Companies can see applications to their jobs" ON applications
  FOR SELECT USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE c.created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Admins pueden ver todas
CREATE POLICY "Admins can see all applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('super_admin', 'screener')
    )
  );
```

#### **application_skills**
```sql
-- Similar a applications, con permisos de validación para admins
CREATE POLICY "Admins can validate skills" ON application_skills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('super_admin', 'screener')
    )
  );
```

### Función Helper

```sql
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 🌱 DATOS DE SEED PROPUESTOS

### Estructura de Seeds

Los seeds deben generar datos realistas para testing y demo:

#### **1. Usuarios Base (4 usuarios)**

```sql
-- Super Admin
INSERT INTO users (email, password, role) VALUES 
  ('admin@sic-veriats.com', '$hashed...', 'super_admin');

-- Screener (Admin limitado)
INSERT INTO users (email, password, role) VALUES 
  ('screener@sic-veriats.com', '$hashed...', 'screener');

-- Company User
INSERT INTO users (email, password, role) VALUES 
  ('hr@techcorp.com', '$hashed...', 'company_user');

-- Candidate
INSERT INTO users (email, password, role) VALUES 
  ('candidate@example.com', '$hashed...', 'candidate');
```

#### **2. Empresas (5 empresas)**

```sql
-- Tech Solutions Inc.
INSERT INTO companies (name, description, contact_email, website, created_by) VALUES
  ('Tech Solutions Inc.', 
   'Empresa líder en soluciones tecnológicas e innovación digital',
   'contact@techsolutions.com',
   'https://techsolutions.com',
   '<company_user_id>');

-- Digital Innovations
INSERT INTO companies (name, description, contact_email, website, created_by) VALUES
  ('Digital Innovations',
   'Transformación digital y consultoría tecnológica',
   'jobs@digitalinnovations.com',
   'https://digitalinnovations.com',
   '<company_user_id>');

-- Cloud Services Co.
INSERT INTO companies (name, description, contact_email, website,created_by) VALUES
  ('Cloud Services Co.',
   'Servicios cloud, infraestructura y DevOps',
   'hiring@cloudservices.io',
   'https://cloudservices.io',
   '<company_user_id>');

-- Data Analytics Pro
INSERT INTO companies (name, description, contact_email, website, created_by) VALUES
  ('Data Analytics Pro',
   'Análisis de datos, BI y Machine Learning',
   'careers@dataanalytics.pro',
   'https://dataanalytics.pro',
   '<company_user_id>');

-- AI Ventures
INSERT INTO companies (name, description, contact_email, website, created_by) VALUES
  ('AI Ventures',
   'Inteligencia artificial y automatización',
   'jobs@aiventures.ai',
   'https://aiventures.ai',
   '<company_user_id>');
```

#### **3. Skills Globales (~30 skills)**

```sql
-- Programming Languages
INSERT INTO skills (name, description, category, created_by) VALUES
  ('Python', 'Lenguaje de programación versátil', 'Programming', '<admin_id>'),
  ('JavaScript', 'Lenguaje para web development', 'Programming', '<admin_id>'),
  ('Java', 'Lenguaje enterprise', 'Programming', '<admin_id>'),
  ('TypeScript', 'JavaScript tipado', 'Programming', '<admin_id>'),
  ('Go', 'Lenguaje de Google', 'Programming', '<admin_id>');

-- Frameworks
INSERT INTO skills (name, description, category, created_by) VALUES
  ('React', 'Framework frontend de Facebook', 'Frontend', '<admin_id>'),
  ('Vue.js', 'Framework frontend progresivo', 'Frontend', '<admin_id>'),
  ('Angular', 'Framework frontend de Google', 'Frontend', '<admin_id>'),
  ('Node.js', 'Runtime de JavaScript', 'Backend', '<admin_id>'),
  ('Django', 'Framework web de Python', 'Backend', '<admin_id>'),
  ('FastAPI', 'Framework moderno de Python', 'Backend', '<admin_id>');

-- Databases
INSERT INTO skills (name, description, category, created_by) VALUES
  ('PostgreSQL', 'Base de datos relacional', 'Database', '<admin_id>'),
  ('MongoDB', 'Base de datos NoSQL', 'Database', '<admin_id>'),
  ('Redis', 'Cache en memoria', 'Database', '<admin_id>');

-- DevOps & Cloud
INSERT INTO skills (name, description, category, created_by) VALUES
  ('Docker', 'Containerización', 'DevOps', '<admin_id>'),
  ('Kubernetes', 'Orquestación de containers', 'DevOps', '<admin_id>'),
  ('AWS', 'Amazon Web Services', 'Cloud', '<admin_id>'),
  ('Azure', 'Microsoft Azure', 'Cloud', '<admin_id>'),
  ('Terraform', 'Infrastructure as Code', 'DevOps', '<admin_id>'),
  ('CI/CD', 'Integración y despliegue continuo', 'DevOps', '<admin_id>');

-- Machine Learning & AI
INSERT INTO skills (name, description, category, created_by) VALUES
  ('Machine Learning', 'Aprendizaje automático', 'AI/ML', '<admin_id>'),
  ('TensorFlow', 'Framework de ML', 'AI/ML', '<admin_id>'),
  ('PyTorch', 'Framework de deep learning', 'AI/ML', '<admin_id>'),
  ('Scikit-learn', 'Librería de ML en Python', 'AI/ML', '<admin_id>');

-- Soft Skills
INSERT INTO skills (name, description, category, created_by) VALUES
  ('Team Leadership', 'Liderazgo de equipos', 'Soft Skills', '<admin_id>'),
  ('Agile Methodologies', 'Scrum, Kanban', 'Soft Skills', '<admin_id>'),
  ('Communication', 'Comunicación efectiva', 'Soft Skills', '<admin_id>'),
  ('Problem Solving', 'Resolución de problemas', 'Soft Skills', '<admin_id>');

-- Languages
INSERT INTO skills (name, description, category, created_by) VALUES
  ('English', 'Idioma inglés', 'Languages', '<admin_id>'),
  ('Spanish', 'Idioma español', 'Languages', '<admin_id>');
```

#### **4. Ofertas de Trabajo (8 jobs)**

```sql
-- Job 1: Senior Full Stack Developer @ Tech Solutions
INSERT INTO jobs (company_id, title, description, location, status) VALUES
  ('<tech_solutions_id>',
   'Senior Full Stack Developer - Tech Fair 2025',
   'Buscamos desarrollador full stack con amplia experiencia en React y Node.js...',
   'Madrid, España',
   'published');

-- Job Skills para Job 1
INSERT INTO job_skills (job_id, skill_id, required_level) VALUES
  ('<job1_id>', '<react_skill_id>', 'advanced'),
  ('<job1_id>', '<nodejs_skill_id>', 'advanced'),
  ('<job1_id>', '<typescript_skill_id>', 'intermediate'),
  ('<job1_id>', '<postgresql_skill_id>', 'intermediate');

-- Job 2: DevOps Engineer @ Cloud Services
INSERT INTO jobs (company_id, title, description, location, status) VALUES
  ('<cloud_services_id>',
   'DevOps Engineer',
   'Experto en automatización, Docker y Kubernetes...',
   'Barcelona, España',
   'published');

-- Job Skills para Job 2
INSERT INTO job_skills (job_id, skill_id, required_level) VALUES
  ('<job2_id>', '<docker_skill_id>', 'advanced'),
  ('<job2_id>', '<kubernetes_skill_id>', 'advanced'),
  ('<job2_id>', '<cicd_skill_id>', 'advanced'),
  ('<job2_id>', '<aws_skill_id>', 'intermediate');

-- Job 3: Data Scientist @ Data Analytics Pro
INSERT INTO jobs (company_id, title, description, location, status) VALUES
  ('<data_analytics_id>',
   'Data Scientist - Virtual Job Fair',
   'Científico de datos para proyectos de machine learning...',
   'Remote',
   'published');

-- Job Skills para Job 3
INSERT INTO job_skills (job_id, skill_id, required_level) VALUES
  ('<job3_id>', '<python_skill_id>', 'advanced'),
  ('<job3_id>', '<ml_skill_id>', 'advanced'),
  ('<job3_id>', '<tensorflow_skill_id>', 'intermediate'),
  ('<job3_id>', '<postgresql_skill_id>', 'intermediate');

-- ... (más jobs según necesidad)
```

#### **5. Candidatos (10 candidatos)**

```sql
-- Candidato 1: María García
INSERT INTO candidates (user_id, first_name, last_name, email, phone_number, city, country, availability_to_start, source_of_application) VALUES
  ('<user_candidate_1_id>',
   'María',
   'García',
   'maria.garcia@example.com',
   '+34 600 123 456',
   'Madrid',
   'España',
   '2025-03-01',
   'LinkedIn');

-- Educación de María
INSERT INTO candidate_education (candidate_id, academic_level, degree, specialty, institution, country, start_date, end_date, overall_average_mark) VALUES
  ('<maria_id>',
   'Master',
   'Master en Ingeniería Informática',
   'Desarrollo de Software',
   'Universidad Politécnica de Madrid',
   'España',
   '2020-09-01',
   '2022-06-30',
   8.5);

INSERT INTO candidate_education (candidate_id, academic_level, degree, specialty, institution, country, start_date, end_date, overall_average_mark) VALUES
  ('<maria_id>',
   'Bachelor',
   'Grado en Ingeniería Informática',
   'Software',
   'Universidad Politécnica de Madrid',
   'España',
   '2016-09-01',
   '2020-06-30',
   7.8);

-- Experiencia de María
INSERT INTO candidate_experience (candidate_id, company_name, position, department, start_date, end_date, is_current, roles_description) VALUES
  ('<maria_id>',
   'Accenture',
   'Full Stack Developer',
   'Digital Innovation',
   '2022-07-01',
   NULL,
   true,
   'Desarrollo de aplicaciones web con React y Node.js. Liderazgo de equipo de 3 desarrolladores.');

INSERT INTO candidate_experience (candidate_id, company_name, position, department, start_date, end_date, is_current, roles_description) VALUES
  ('<maria_id>',
   'Startup TechHub',
   'Junior Developer',
   'Engineering',
   '2020-09-01',
   '2022-06-30',
   false,
   'Desarrollo frontend con Vue.js y backend con Python/Django.');

-- ... (más candidatos)
```

#### **6. Aplicaciones y Skills (ejemplos)**

```sql
-- María aplica a "Senior Full Stack Developer"
INSERT INTO applications (candidate_id, job_id, status) VALUES
  ('<maria_id>', '<job1_id>', 'in_review');

-- María declara sus skills para esta aplicación
INSERT INTO application_skills (application_id, skill_id, candidate_level, justification, admin_state) VALUES
  ('<app1_id>', '<react_skill_id>', 'advanced', 
   '3 años de experiencia desarrollando SPAs en React. Proyectos en producible serviendo a +100k usuarios.',
   'approved');

INSERT INTO application_skills (application_id, skill_id, candidate_level, justification, admin_state) VALUES
  ('<app1_id>', '<nodejs_skill_id>', 'advanced',
   '2 años desarrollando APIs RESTful con Express y NestJS. Implementación de microservicios.',
   'approved');

INSERT INTO application_skills (application_id, skill_id, candidate_level, justification, admin_state) VALUES
  ('<app1_id>', '<typescript_skill_id>', 'intermediate',
   'Uso diario en proyectos. Configuración de tsconfig y tipado avanzado.',
   'pending');

INSERT INTO application_skills (application_id, skill_id, candidate_level, justification, admin_state) VALUES
  ('<app1_id>', '<postgresql_skill_id>', 'intermediate',
   'Diseño de schemas, queries complejas y optimización.',
   'pending');
```

#### **7. Candidatos Seleccionados (ejemplo)**

```sql
-- María ha sido seleccionada para el puesto
INSERT INTO selected_candidates (application_id, job_id, candidate_id, final_decision, interview_date, notes) VALUES
  ('<app1_id>',
   '<job1_id>',
   '<maria_id>',
   'Selected for final interview',
   '2025-03-15 10:00:00+00',
   'Excelente perfil técnico. Todas las skills validadas. Programar entrevista con CTO.');
```

### Resumen de Seeds

| Entidad | Cantidad |
|---------|----------|
| **Users** | 10-15 (admins, company users, candidates) |
| **Companies** | 5-8 |
| **Skills** | 30-40 (catálogo global) |
| **Jobs** | 8-12 |
| **Job_Skills** | ~40-50 (promedio 4-5 skills por job) |
| **Candidates** | 10-15 |
| **Candidate_Education** | 15-25 (promedio 1-2 por candidato) |
| **Candidate_Experience** | 20-30 (promedio 2-3 por candidato) |
| **Applications**| 20-30 |
| **Application_Skills** | 80-120 (promedio 4-5 skills por aplicación) |
| **Selected_Candidates** | 5-10 |

---

## 🐳 CONFIGURACIÓN DOCKER PROPUESTA

### Variables de Entorno (`.env`)
```env
# Database (Supabase Local)
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Supabase Local
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<generated_key>
SUPABASE_ANON_KEY=<generated_key>

# JWT for API
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Application
ENVIRONMENT=development
DEBUG=true
```

### Docker Compose (Supabase Stack Completo)
```yaml
# Usar `supabase init` y `supabase start` en vez de docker-compose manual
# Supabase CLI maneja automáticamente:
# - PostgreSQL
# - PostgREST
# - GoTrue (Auth)
# - Realtime
# - Storage
# - Studio (UI)
```

---

## 🎯 TAREAS PARA IMPLEMENTAR

### **FASE 1: Crear Proyecto de Base de Datos Standalone**

#### 1.1 Crear Estructura de Directorios
```bash
mkdir -p SIC-VeriATS-database/{supabase/{migrations,functions},scripts,docs}
cd SIC-VeriATS-database
supabase init
```

#### 1.2 Crear Migraciones SQL
Dividir en archivos lógicos:

**`001_schema_base.sql`**:
- ENUMs (user_role, job_status, required_level, etc.)
- Tablas: users, companies, jobs, skills, job_skills
- Tablas: candidates, candidate_education, candidate_experience
- Tablas: applications, application_skills, selected_candidates
- Constraints y Foreign Keys

**`002_auth_integration.sql`**:
- Linkeo con auth.users de Supabase
- Triggers para sync de users
- Funciones helper (get_current_user_id, get_current_user_role)

**`003_rls_policies.sql`**:
- Enable RLS en todas las tablas
- Políticas para users
- Políticas para companies, jobs, skills
- Políticas para candidates, applications, application_skills
- Políticas para selected_candidates

**`004_indexes.sql`**:
- Índices en FKs
- Índices en campos de búsqueda común
- Índices compuestos si necesario

**`005_functions.sql`**:
- Funciones de negocio (ej: calcular match score)
- Triggers (ej: auto-update updated_at)

#### 1.3 Convertir Seeds a SQL

Crear `seed.sql` con:
- Datos idempotentes (usar ON CONFLICT DO NOTHING o UPDATE)
- Orden correcto: users → companies → skills → jobs → job_skills → etc.
- IDs predecibles para testing (usar UUIDs conocidos)

#### 1.4 Scripts de Automatización

**`scripts/init.sh`**:
```bash
#!/bin/bash
echo "Initializing Supabase database..."
supabase start
supabase db reset # Aplica migraciones
```

**`scripts/reset.sh`**:
```bash
#!/bin/bash
echo "Resetting database..."
supabase db reset --linked=false
```

**`scripts/seed.sh`**:
```bash
#!/bin/bash
echo "Seeding database..."
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
```

**`scripts/migrate.sh`**:
```bash
#!/bin/bash
echo "Applying migrations..."
supabase db push
```

---

### **FASE 2: Documentación Viva**

#### 2.1 ERD (Entity Relationship Diagram)
- Crear diagrama Mermaid/PlantUML
- Incluir en `docs/ERD.md`
- Mostrar **todas las relaciones**
- Destacar tablas clave (application_skills)

#### 2.2 SCHEMA.md
- Documentar cada tabla con:
  - Propósito
  - Campos y tipos
  - Constraints
  - Relaciones
  - Ejemplos de datos

#### 2.3 RLS_POLICIES.md
- Documentar cada política RLS
- Casos de uso por rol
- Ejemplos de queries permitidas/denegadas

---

### **FASE 3: Testing y Validación**

#### 3.1 Tests de Constraints
```sql
-- Test: Un candidato no puede aplicar dos veces al mismo job
INSERT INTO applications (candidate_id, job_id) VALUES ('<c1>', '<j1>');
-- Debería fallar:
INSERT INTO applications (candidate_id, job_id) VALUES ('<c1>', '<j1>'); 

-- Test: Cada job-skill es única
INSERT INTO job_skills (job_id, skill_id, required_level) VALUES ('<j1>', '<s1>', 'advanced');
-- Debería fallar:
INSERT INTO job_skills (job_id, skill_id, required_level) VALUES ('<j1>', '<s1>', 'basic');
```

#### 3.2 Tests de RLS
```sql
-- Como candidato, ver solo mis aplicaciones
SET LOCAL auth.uid = '<candidate_auth_id>';
SELECT * FROM applications; -- Solo las mías

-- Como company, ver aplicaciones a mis jobs
SET LOCAL auth.uid = '<company_auth_id>';
SELECT * FROM applications; -- Solo de mis jobs
```

#### 3.3 Tests de Seeds
- Verificar que todos los datos se insertan correctamente
- Comprobar integridad referencial
- Validar estados iniciales (ej: algunas skills en pending, otras approved)

---

### **FASE 4: Preparación para Producción**

#### 4.1 Configuración de Backups
- Script para backup de volúmenes Docker
- Documentar cómo hacer restore

#### 4.2 Deploy a Supabase Cloud
```bash
# Linkear con proyecto cloud
supabase link --project-ref <project-id>

# Aplicar migraciones
supabase db push

# Aplicar seeds (manual via Supabase Studio o API)
```

#### 4.3 CI/CD
- GitHub Actions para validar migraciones
- Dry-run antes de deploy
- Tests automatizados de RLS

---

## 🚨 CONSIDERACIONES IMPORTANTES

### **Seguridad**

1. **RLS Estricto**:
   - ✅ Todas las tablas tienen RLS habilitado
   - ✅ Sin políticas = sin acceso (deny by default)
   - ✅ Admins tienen acceso completo pero auditado

2. **Validación de Skills**:
   - ❗ Solo admins/screeners pueden cambiar `admin_state`
   - ✅ Candidatos solo pueden crear application_skills en `pending`

3. **Separación de Roles**:
   - ✅ `company_user` no puede ver datos de otros company_users
   - ✅ `candidate` solo ve sus propios datos
   - ✅ `screener` tiene permisos limitados vs `super_admin`

### **Performance**

1. **Índices Críticos**:
   - ✅ Todos los FKs indexados
   - ✅ `skills.name` (búsquedas frecuentes)
   - ✅ `jobs.status` (filtros)
   - ✅ `applications.status` (dashboards)
   - ✅ `application_skills.admin_state` (filtros de pending)

2. **Índices Compuestos**:
   - `(job_id, status)` en `applications`
   - `(candidate_id, status)` en `applications`
   - `(application_id, admin_state)` en `application_skills`

3. **Queries Frecuentes**:
   - Jobs published por empresa
   - Applications pending por admin
   - Application_skills pending de validación
   - Candidates con scores altos

### **Integridad de Datos**

1. **Constraints**:
   - ✅ `UNIQUE(candidate_id, job_id)` en applications
   - ✅ `UNIQUE(job_id, skill_id)` en job_skills
   - ✅ `UNIQUE(application_id, skill_id)` en application_skills
   - ✅ `skills.name` es UNIQUE

2. **Cascadas**:
   - ❗ `ON DELETE CASCADE` en applications → application_skills
   - ❗ `ON DELETE RESTRICT` en skills (no borrar si son usadas)
   - ✅ `ON DELETE CASCADE` en candidates → education/experience

3. **Validaciones**:
   - ❓ ¿Triggers para validar que `end_date > start_date`?
   - ❓ ¿Constraint para `is_current = true` implica `end_date IS NULL`?

---

## ✅ DECISIONES TOMADAS

### 1. **Tabla `company_users` - N:M** ✅
   - **Decisión**: SÍ, crear tabla intermedia
   - **Razón**: Permite múltiples usuarios por empresa, delegación de accesos, roles internos
   - **Implementación**:
     ```sql
     CREATE TABLE company_users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       role VARCHAR(50) NOT NULL, -- 'admin', 'viewer', 'recruiter'
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       UNIQUE(company_id, user_id)
     );
     ```

### 2. **Skills con aprobación admin** ✅
   - **Decisión**: SÍ, skills requieren aprobación
   - **Razón**: Evita duplicados, errores, skills basura
   - **Implementación**: Añadir campo `status` a `skills`:
     ```sql
     CREATE TYPE skill_status AS ENUM ('pending', 'approved', 'rejected');
     
     ALTER TABLE skills ADD COLUMN status skill_status DEFAULT 'pending';
     ```
   - **Flujo**: Empresa crea skill → pending → Admin valida

### 3. **Soft deletes obligatorios** ✅
   - **Decisión**: SÍ, en todas las tablas clave
   - **Razón**: Procesos legales, trazabilidad, auditorías
   - **Implementación**: Añadir a todas las tablas:
     ```sql
     deleted_at TIMESTAMPTZ,
     is_active BOOLEAN DEFAULT true
     ```
   - **Tablas afectadas**: users, companies, jobs, applications, skills, candidates

### 4. **Supabase Storage para documentos** ✅
   - **Decisión**: SÍ, usar Supabase Storage
   - **Razón**: Escalabilidad, seguridad, URLs firmadas, RLS en archivos
   - **Implementación**: Nueva tabla `candidate_documents`:
     ```sql
     CREATE TYPE document_type AS ENUM ('cv', 'cv_anonymized', 'academic_certificate', 'cover_letter', 'photo');
     
     CREATE TABLE candidate_documents (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
       type document_type NOT NULL,
       storage_url VARCHAR(500) NOT NULL,
       version INTEGER DEFAULT 1,
       uploaded_at TIMESTAMPTZ DEFAULT NOW(),
       deleted_at TIMESTAMPTZ,
       is_active BOOLEAN DEFAULT true
     );
     ```

### 5. **Auditoría centralizada** ✅
   - **Decisión**: SÍ, tabla `audit_logs`
   - **Razón**: Decisiones humanas, evaluaciones, selección de candidatos
   - **Implementación**:
     ```sql
     CREATE TABLE audit_logs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID REFERENCES users(id),
       entity_type VARCHAR(100) NOT NULL, -- 'application', 'skill_validation', etc.
       entity_id UUID NOT NULL,
       action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'approved', 'rejected'
       old_value JSONB,
       new_value JSONB,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     
     CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
     CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
     CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
     ```

### 6. **Estados gestionados por app logic** ✅
   - **Decisión**: Validación en backend (FastAPI)
   - **Razón**: Más fácil de depurar, portable, claro para tests
   - **Triggers solo para**: Auditoría automática, integridad básica

### 7. **Full-Text Search** ✅
   - **Decisión**: SÍ, implementar con `tsvector` de PostgreSQL
   - **Razón**: Búsqueda de candidatos, skills, ofertas
   - **Implementación**:
     ```sql
     -- En candidates
     ALTER TABLE candidates ADD COLUMN search_vector tsvector
       GENERATED ALWAYS AS (
         setweight(to_tsvector('spanish', coalesce(first_name, '')), 'A') ||
         setweight(to_tsvector('spanish', coalesce(last_name, '')), 'A') ||
         setweight(to_tsvector('spanish', coalesce(city, '')), 'B')
       ) STORED;
     
     CREATE INDEX idx_candidates_search ON candidates USING GIN(search_vector);
     
     -- Similar para jobs y skills
     ```

### 8. **Tabla de notificaciones** ✅
   - **Decisión**: SÍ, crear tabla
   - **Razón**: Avisar cambios de estado, nuevas aplicaciones, validaciones
   - **Implementación**:
     ```sql
     CREATE TYPE notification_type AS ENUM ('application_status', 'skill_validated', 'new_application', 'interview_scheduled');
     
     CREATE TABLE notifications (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       type notification_type NOT NULL,
       message TEXT NOT NULL,
       is_read BOOLEAN DEFAULT false,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     
     CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
     CREATE INDEX idx_notifications_created_at ON notifications(created_at);
     ```

### 9. **Tabla de interviews separada** ✅
   - **Decisión**: SÍ, tabla independiente
   - **Razón**: Las entrevistas son un proceso distinto a la postulación
   - **Implementación**:
     ```sql
     CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
     CREATE TYPE interview_mode AS ENUM ('presencial', 'virtual', 'phone');
     
     CREATE TABLE interviews (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
       scheduled_date TIMESTAMPTZ NOT NULL,
       duration_minutes INTEGER DEFAULT 60,
       mode interview_mode NOT NULL,
       status interview_status DEFAULT 'scheduled',
       location VARCHAR(255), -- URL si es virtual, dirección si presencial
       notes TEXT,
       interviewer_ids UUID[], -- Array de user_ids
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
     );
     
     CREATE INDEX idx_interviews_application ON interviews(application_id);
     CREATE INDEX idx_interviews_date ON interviews(scheduled_date);
     CREATE INDEX idx_interviews_status ON interviews(status);
     ```

### 10. **Versionado de documentos** ✅
   - **Decisión**: SÍ, incluido en `candidate_documents`
   - **Razón**: Trazabilidad, historial, legal
   - **Implementación**: Ya incluido en tabla `candidate_documents` (campo `version`)

---

## 🚀 ENTREGABLES ESPERADOS

Al finalizar, deberías tener:

- [ ] ✅ **Proyecto `SIC-VeriATS-database/`** completamente funcional
- [ ] ✅ **Supabase local** corriendo con: `supabase start`
- [ ] ✅ **11 tablas** creadas con schema completo
- [ ] ✅ **Migraciones** en `supabase/migrations/`
- [ ] ✅ **Seeds** en `seed.sql` con datos realistas
- [ ] ✅ **RLS habilitado** en todas las tablas
- [ ] ✅ **Índices** en campos críticos
- [ ] ✅ **Funciones helper** (get_current_user_id, etc.)
- [ ] ✅ **Scripts** (init, reset, migrate, seed)
- [ ] ✅ **Documentación**:
  - ERD.md (diagrama)
  - SCHEMA.md (tablas)
  - RLS_POLICIES.md (políticas)
  - README.md (instrucciones)
- [ ] ✅ **Tests** de constraints y RLS
- [ ] ✅ **Instrucciones de deploy** a Supabase Cloud

---

## 📝 NOTAS FINALES

### Cambios Principales vs Diseño Anterior

| Aspecto | Diseño Anterior | Diseño Nuevo |
|---------|-----------------|--------------|
| **Arquitectura** | Blind Hiring | ATS Multi-Empresa Tradicional |
| **Empresas** | Campos en `users` | Tabla `companies` separada |
| **Ferias**  | Tabla `fairs` | ❌ NO EXISTEN |
| **Skills** | Requirements por job | Catálogo global reutilizable |
| **Candidatos** | `sensitive_data + public_profiles` | Tabla `candidates` completa |
| **Perfil Candidato** | Básico | Enriquecido (educación + experiencia) |
| **Aplicación Skills** | Validations de requirements | `application_skills` (respuesta a job_skills) |
| **Niveles** | 4 (Beginner...Expert) | 3 (basic, intermediate, advanced) |
| **Multi-tenancy** | `tenants` + `tenant_members` | Via `companies` |
| **IDs** | `SERIAL INTEGER` | `UUID` |

### Próximos Pasos

1. ✅ **Revisar este documento** y tomar decisiones (preguntas 1-10)
2. ✅ **Aprobar el diseño final**
3. 🚀 **Ejecutar FASE 1**: Crear proyecto y migraciones
4. 🌱 **Ejecutar FASE 2**: Seeds y documentación
5. ✅ **Ejecutar FASE 3**: Tests y validación
6. 🌐 **Ejecutar FASE 4**: Deploy a Supabase Cloud

---

**Fecha de actualización**: 2026-02-06  
**Autor**: Sergio  
**Para**: Agente AI  

---

## 🎬 ACCIÓN INMEDIATA

Por favor, agente:

1. **Confirma que has entendido el nuevo diseño**
2. **Espera mis respuestas a las 10 preguntas de decisión**
3. **Propón un plan de acción detallado** con:
   - Orden de creación de archivos
   - Contenido exacto de `001_schema_base.sql`
   - Estructura de `seed.sql`
   - Timeline estimado (horas/días)
4. Una vez aprobado, **comienza con FASE 1**

¡Gracias! 🚀
