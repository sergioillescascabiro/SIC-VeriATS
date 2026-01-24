# 🔐 Usuarios de Prueba - SIC-VeriATS

Todos los usuarios tienen el mismo password: **`password123`**

---

## 👑 ADMINISTRADORES

### 1. Super Admin
- **Email**: `admin@sic-veriats.com`
- **Password**: `password123`
- **Rol**: `super_admin`
- **Dashboard**: `/admin`
- **Permisos**: Acceso completo al sistema, puede ver y modificar todo

### 2. Screener (Validador de Skills)
- **Email**: `screener@sic-veriats.com`
- **Password**: `password123`
- **Rol**: `screener`
- **Dashboard**: `/admin`
- **Permisos**: Validar skills de candidatos, acceso limitado

---

## 🏢 RECRUITERS (Company Users)

### 1. TechCorp Solutions
- **Email**: `hr@techcorp.com`
- **Password**: `password123`
- **Rol**: `company_user`
- **Dashboard**: `/company`
- **Empresa**: TechCorp Solutions
- **Permisos**: Ver y gestionar ofertas de su empresa, ver aplicaciones

### 2. InnovaSoft
- **Email**: `recruiter@innovasoft.com`
- **Password**: `password123`
- **Rol**: `company_user`
- **Dashboard**: `/company`
- **Empresa**: InnovaSoft
- **Permisos**: Ver y gestionar ofertas de su empresa

### 3. DataAnalytics Pro
- **Email**: `rrhh@dataanalytics.com`
- **Password**: `password123`
- **Rol**: `company_user`
- **Dashboard**: `/company`
- **Empresa**: DataAnalytics Pro

### 4. Cloud Services Inc
- **Email**: `hiring@cloudservices.com`
- **Password**: `password123`
- **Rol**: `company_user`
- **Dashboard**: `/company`
- **Empresa**: Cloud Services Inc

### 5. Marketing Pro Agency
- **Email**: `talent@marketingpro.com`
- **Password**: `password123`
- **Rol**: `company_user`
- **Dashboard**: `/company`
- **Empresa**: Marketing Pro Agency

---

## 👤 CANDIDATOS

### 1. Ana García
- **Email**: `ana.garcia@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Full Stack Developer de Madrid
- **Experiencia**: 4 años con React y Node.js
- **Aplicaciones**: 2 (TechCorp - Full Stack, DevOps Engineer)

### 2. Carlos López
- **Email**: `carlos.lopez@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Frontend Developer de Barcelona
- **Especialidad**: React y Vue.js
- **Aplicaciones**: 2 (InnovaSoft - Frontend React, UX/UI Designer)

### 3. María Rodríguez
- **Email**: `maria.rodriguez@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Data Scientist de Valencia
- **Especialidad**: Python y Machine Learning
- **Aplicaciones**: 1 (DataAnalytics - Data Scientist)

### 4. Javier Martín
- **Email**: `javier.martin@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: DevOps Engineer de Sevilla
- **Aplicaciones**: 1 (TechCorp - DevOps Engineer - RECHAZADO)

### 5. Laura Sánchez
- **Email**: `laura.sanchez@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Backend Python Developer de Bilbao
- **Especialidad**: FastAPI y Django
- **Aplicaciones**: 1 (DataAnalytics - Backend Python - SELECCIONADO)

### 6. Pedro Fernández
- **Email**: `pedro.fernandez@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Cloud Architect de Málaga
- **Especialidad**: AWS y Kubernetes

### 7. Sofía González
- **Email**: `sofia.gonzalez@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: SEO Specialist de Zaragoza

### 8. Miguel Torres
- **Email**: `miguel.torres@email.com`
- **Password**: `password123`
- **Rol**: `candidate`
- **Dashboard**: `/candidate`
- **Perfil**: Social Media Manager de Granada

---

## 🎯 Casos de Uso Recomendados para Testing

### Testing de Admin
```
Email: admin@sic-veriats.com
Password: password123
```
- ✅ Ver todas las empresas
- ✅ Ver todos los candidatos
- ✅ Validar skills pendientes
- ✅ Ver estadísticas globales

### Testing de Company
```
Email: hr@techcorp.com
Password: password123
```
- ✅ Ver mis ofertas de trabajo (TechCorp)
- ✅ Ver aplicaciones a mis ofertas
- ✅ Ver candidatos seleccionados (ciego - sin datos personales)

### Testing de Candidate
```
Email: ana.garcia@email.com
Password: password123
```
- ✅ Ver ofertas disponibles
- ✅ Aplicar a ofertas
- ✅ Ver estado de mis aplicaciones
- ✅ Subir/actualizar CV

---

## 🧪 Testing de Roles y RLS

### 1. Probar que Company User solo ve SUS datos:
- Login con `hr@techcorp.com`
- Deberías ver solo ofertas de TechCorp
- NO deberías ver ofertas de InnovaSoft

### 2. Probar que Candidate solo ve SU perfil:
- Login con `ana.garcia@email.com`
- Deberías ver tus aplicaciones
- NO deberías poder ver aplicaciones de Carlos

### 3. Probar que Admin ve TODO:
- Login con `admin@sic-veriats.com`
- Deberías ver todas las empresas y candidatos

---

## 📊 Estado de Datos en Seed

| Entidad | Cantidad | Notas |
|---------|----------|-------|
| Users Auth | 15 | ✅ Creados en auth.users |
| Users Table | 15 | ✅ Sincronizados con auth_id |
| Companies | 5 | TechCorp, InnovaSoft, etc. |
| Jobs | 10 | 9 publicados, 1 draft |
| Candidates | 8 | Con perfiles completos |
| Applications | 10 | En varios estados |
| Skills | 35 | Todas aprobadas |

---

## 🔄 Cómo Resetear Usuarios de Prueba

Si necesitas recrear los usuarios:

```powershell
cd SIC-VeriATS-database

# 1. Reset completo de Supabase
supabase db reset

# 2. Recrear usuarios de auth
.\scripts\create-auth-users.ps1
```

---

## 🚨 Troubleshooting

### "Invalid login credentials"
- Verifica que ejecutaste `.\scripts\create-auth-users.ps1`
- Verifica que Supabase está corriendo: `supabase status`

### "User not found in users table"
- Los usuarios están en auth.users pero falta sincronizar con users table
- Ejecuta de nuevo `.\scripts\create-auth-users.ps1`

### Permissions error
- Verifica tu `.env` tiene las credenciales correctas
- El ANON_KEY debe coincidir con el de Supabase local

---

**Password universal**: `password123` 🔑
