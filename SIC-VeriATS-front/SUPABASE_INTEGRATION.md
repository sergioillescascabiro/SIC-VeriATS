# ✅ Frontend Integrado con Supabase

Se ha configurado el frontend para conectarse directamente a Supabase (local o cloud) sin backend intermedio.

---

## 🔧 Cambios Realizados

### 1. **Configuración de Supabase Client**
- ✅ Creado `src/lib/supabase.ts` con cliente configurado
- ✅ Helpers para manejo de errores y obtención de usuario

### 2. **Servicio de Autenticación Actualizado**
- ✅ `src/services/auth.service.ts` usa Supabase Auth directamente
- ✅ Sincronización automática con tabla `users`
- ✅ Login, logout, refresh token, registro

### 3. **Hook de Autenticación**
- ✅ Creado `src/hooks/useAuth.tsx` con AuthProvider y useAuth hook
- ✅ Escucha automática de cambios de sesión
- ✅ Estado global de autenticación

### 4. **App.tsx Actualizado**
- ✅ AuthProvider envuelve toda la aplicación
- ✅ Estado de auth disponible en todos los componentes

### 5. **Variables de Entorno**
- ✅ `.env.example` actualizado con configuración de Supabase
- ✅ `.env` ya tiene las credenciales locales configuradas

---

## 🚀 Cómo Usar

### 1. **En cualquier componente:**

```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!user) {
    return <button onClick={() => signIn('ana.garcia@email.com', 'password123')}>
      Login
    </button>
  }

  return (
    <div>
      <p>Welcome {user.email}!</p>
      <p>Role: {user.role}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### 2. **Acceso directo a Supabase:**

```typescript
import { supabase } from '@/lib/supabase'

// GET datos
const { data, error } = await supabase
  .from('jobs')
  .select('*, companies(name)')
  .eq('status', 'published')

// INSERT datos
const { data, error } = await supabase
  .from('applications')
  .insert({
    candidate_id: 'uuid',
    job_id: 'uuid',
    status: 'pending'
  })
```

---

## 📝 Usuarios de Prueba (seed.sql)

Todos con password: `password123`

### Admins:
- `admin@sic-veriats.com` (super_admin)
- `screener@sic-veriats.com` (screener)

### Recruiters:
- `hr@techcorp.com` (company_user - TechCorp)
- `recruiter@innovasoft.com` (company_user - InnovaSoft)
- `rrhh@dataanalytics.com` (company_user - DataAnalytics)

### Candidatos:
- `ana.garcia@email.com` (candidate)
- `carlos.lopez@email.com` (candidate)
- `maria.rodriguez@email.com` (candidate)

---

## 🔄 Próximos Pasos

### Pantallas a Modificar:

1. **Login Page** - Usar `useAuth` hook
2. **Dashboard Admin** - Consultar datos directamente de Supabase
3. **Dashboard Company** - Filtrar por company_id del usuario
4. **Dashboard Candidate** - Filtrar por candidate_id del usuario
5. **Jobs Page** - Listar jobs desde Supabase
6. **Applications** - CRUD de aplicaciones

---

## 🛠️ Ejecutar el Frontend

```bash
cd SIC-VeriATS-front

# Instalar dependencias (si es necesario)
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

---

## 🔑 Verificar Conexión

1. Asegúrate de que Supabase está corriendo:
   ```bash
   cd SIC-VeriATS-database
   supabase status
   ```

2. Si no está corriendo:
   ```bash
   supabase start
   ```

3. Verifica las credenciales en `.env`:
   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<tu_anon_key>
   ```

---

## 📊 RLS (Row Level Security)

Las queries de Supabase respetarán automáticamente las políticas RLS:

- **Admins** ven todo
- **Company users** solo ven datos de su empresa
- **Candidates** solo ven sus propios datos

**OJO**: Para que funcione correctamente, el usuario debe estar autenticado.

---

## ⚠️ Notas Importantes

1. **Passwords**: Los usuarios en seed.sql usan `password123` hasheado con bcrypt
2. **Auth vs Users**: Supabase Auth gestiona la autenticación, tabla `users` tiene el perfil
3. **Auto-refresh**: Los tokens se refrescan automáticamente
4. **Session persistence**: La sesión se guarda en localStorage

---

**Siguiente**: Modificar la página de login para usar `useAuth` 🚀
