# ⚽ Penca Mundial 2026 — fascioli.com.uy

App web mobile-first para la penca del Mundial 2026 de los empleados de Fascioli.

---

## 🚀 Cómo subir a Vercel (paso a paso)

### 1. Requisitos previos
- Tener una cuenta en [vercel.com](https://vercel.com) (gratis)
- Tener una cuenta en [github.com](https://github.com) (gratis)
- Tener [Node.js](https://nodejs.org) instalado en tu PC

---

### 2. Subir el código a GitHub

```bash
# Abrí una terminal en la carpeta del proyecto y ejecutá:
git init
git add .
git commit -m "Penca Mundial 2026 inicial"

# Creá un repositorio en github.com (privado recomendado) y luego:
git remote add origin https://github.com/TU_USUARIO/penca-mundial.git
git push -u origin main
```

---

### 3. Crear el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Conectá tu cuenta de GitHub y seleccioná el repositorio `penca-mundial`
3. Vercel detecta automáticamente que es Next.js ✅
4. **Antes de hacer deploy**, configurá las variables de entorno (ver paso 4)
5. Hacé click en **Deploy**

---

### 4. Configurar variables de entorno en Vercel

En el panel de tu proyecto en Vercel → **Settings** → **Environment Variables**, agregá:

| Variable | Valor | Descripción |
|---|---|---|
| `JWT_SECRET` | (string largo aleatorio) | Secreto para firmar tokens. Usá [este generador](https://generate-secret.vercel.app/32) |
| `ADMIN_USERNAME` | `admin` | Tu usuario de superadmin |
| `ADMIN_PASSWORD` | (tu clave segura) | Tu contraseña de superadmin |
| `INVITE_CODE` | `MUNDIAL2026` | El código que le das a los empleados para registrarse |

---

### 5. Crear la base de datos KV (Redis)

1. En Vercel → tu proyecto → pestaña **Storage**
2. Click en **Create Database** → elegí **KV (Redis)**
3. Seguí los pasos (es gratis hasta 30,000 req/mes)
4. Vercel **automáticamente** agrega las variables `KV_URL`, `KV_REST_API_URL`, etc. a tu proyecto
5. Hacé **Redeploy** para que tome los cambios

---

### 6. ¡Listo! 🎉

Tu app va a estar en `https://penca-mundial.vercel.app` (o el dominio que elijas).

Podés conectar tu dominio `fascioli.com.uy` o un subdominio como `penca.fascioli.com.uy` desde **Settings → Domains**.

---

## 👤 Cómo funciona

### Para los empleados:
1. Entran a la URL
2. Click en "Registrate acá"
3. Completan nombre, usuario, contraseña y el **código de invitación** que vos les dás
4. Empiezan a cargar sus picks partido por partido

### Para vos (superadmin):
1. Entrás con el usuario y contraseña de `ADMIN_USERNAME` / `ADMIN_PASSWORD`
2. Tenés acceso al **panel de administración** con:
   - Carga de resultados reales partido por partido
   - Tabla de posiciones en tiempo real
   - Lista de participantes
   - Configuración del sistema de puntos

---

## 📊 Sistema de puntos (configurable desde el panel)

| Acierto | Puntos por defecto |
|---|---|
| Resultado exacto (ej: 2-1 y acertás 2-1) | **3 puntos** |
| Ganador correcto (ej: gana Local y acertás eso) | **1 punto** |
| Empate correcto (acertás que es empate) | **1 punto** |

---

## 🔒 Seguridad

- Las contraseñas se guardan **hasheadas con bcrypt** (nunca en texto plano)
- Las sesiones usan **JWT firmados** con expiración de 7 días
- Solo el superadmin puede cargar resultados y cambiar configuración
- Los picks se **bloquean automáticamente** cuando se carga el resultado real

---

## 🛠 Tecnologías

- **Next.js 14** (App Router)
- **Vercel KV** (Redis) para la base de datos
- **bcryptjs** para hasheo de contraseñas
- **jose** para JWT
- CSS puro, sin librerías de UI
