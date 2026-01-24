# 🐛 Debugging Frontend - Pantalla en Blanco

## Problema
El frontend muestra una pantalla en blanco al abrir http://localhost:5173

## ✅ Pasos para Debugging

### 1. Abrir Consola del Navegador
1. Abre http://localhost:5173 en tu navegador
2. Presiona **F12** o **Click derecho** → **Inspeccionar**
3. Ve a la pestaña **Console**
4. Busca mensajes de error en **rojo**

### 2. Errores Comunes y Soluciones

#### Error: "Missing Supabase environment variables"
**Solución:**
```bash
# Verifica que .env existe
cat .env

# Debería mostrar:
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

Si no existe, créalo:
```bash
cp .env.example .env
```

Luego edita`.env` con las credenciales correctas.

#### Error: "Cannot find module '@/lib/supabase'"
**Solución:**
```bash
# Reinicia el servidor de Vite
# Presiona Ctrl+C en la terminal
# Luego:
npm run dev
```

#### Error: "AuthProvider is not exported"
**Archivo:** `src/hooks/useAuth.tsx`

Verifica que el archivo termine con:
```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  // ...
}

export function useAuth() {
  // ...
}
```

#### Error de TypeScript: Type errors
**Solución:**
```bash
# Verifica errores de TypeScript
npm run build

# Si hay errores, repórtalos
```

### 3. Verificar que Supabase está Corriendo

```bash
cd ../SIC-VeriATS-database
supabase status

# Debería mostrar:
# supabase local dev is running.
# API URL: http://localhost:54321
```

Si NO está corriendo:
```bash
supabase start
```

### 4. Verificar Rutas del Frontend

Navega manualmente a:
- http://localhost:5173/ (debería mostrar algo)
- http://localhost:5173/login (debería mostrar página de login)

### 5. Logs de Vite

En la terminal donde corre `npm run dev`, busca:
- ✅ **Verde**: "ready in X ms" → Todo bien
- ❌ **Rojo**: Errores de compilación → Hay problemas

---

## 🔧 Fix Rápido

Si nada funciona, intenta:

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar node_modules y reinstalar
rm -rf node_modules
npm install

# 3. Reiniciar
npm run dev

# 4. Abrir navegador en modo incógnito
# Esto evita problemas de caché
```

---

## 📸 Dame esta Información

Para ayudarte mejor, necesito que me digas:

1. **¿Qué ves en la consola del navegador?** (F12 → Console)
   - ¿Hay mensajes de error en rojo?
   - Copia el texto completo del error

2. **¿Qué muestra la terminal de Vite?**
   - ¿Dice "ready in X ms"?
   - ¿Hay errores?

3. **¿La página está completamente en blanco?**
   - ¿O ves algo (header, footer, etc.)?

4. **¿Funciona http://localhost:5173/login?**
   - Intenta navegar directamente a /login

---

## 🎯 Verificación Rápida

Ejecuta esto y dime qué sale:

```bash
# En la carpeta SIC-VeriATS-front
cat .env
```

**Debería mostrar:**
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Si sale diferente o no existe, ese es el problema! 🔴
