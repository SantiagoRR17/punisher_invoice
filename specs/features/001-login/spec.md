# **001 · Login**

**Estado:** Hecho ✅ (validada por el usuario contra MongoDB Atlas real)

## Qué hace

La pantalla recibe al usuario autorizado, solicita usuario y contraseña, valida las credenciales contra la base de datos y, si son correctas, lo envía al menú principal.

## Por qué

Esta feature protege el acceso al sistema y evita que personas no autorizadas vean o manipulen información sensible del negocio.

## Criterios de aceptación

- [x] muestra un formulario de acceso con usuario y contraseña
- [x] aplica un estilo visual tipo glassmorphism sin afectar la legibilidad
- [x] valida las credenciales contra la base de datos (probado contra Mongo Memory Server en pruebas automatizadas y validado por el usuario contra MongoDB Atlas real)
- [x] redirecciona al menú principal cuando la autenticación es correcta (destino `/menu` es un placeholder de la feature 002)
- [x] muestra un mensaje de error cuando el usuario o la contraseña son inválidos
- [x] funciona de forma responsive en escritorio y dispositivos móviles

## Fuera de alcance

- No incluye registro de usuarios.
- No incluye recuperación de contraseña.
- No incluye administración de roles desde interfaz.
- La conexión a MongoDB Atlas ya quedó configurada y validada por el usuario (variables reales en `.env.local`, no versionadas).

## Provisión de usuarios autorizados

Al no existir pantalla de registro, los usuarios autorizados (dueño y contadora) se crean mediante un script de seed que el usuario del proyecto ejecuta localmente con las credenciales reales. El script nunca contiene contraseñas reales dentro del repositorio.
