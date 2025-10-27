# Proyecto TPFI (Trabajo Práctico Final Integrador)

Este repositorio contiene el código fuente del Trabajo Práctico Final Integrador. Es una aplicación web desarrollada con Node.js y Express, enfocada en la funcionalidad y la protección de datos del usuario.

## Funcionalidades Clave

La plataforma ahora incluye un flujo de usuario completo y funcionalidades de gestión:

* **Autenticación por Email**: Se modernizó el sistema de ingreso. El login ahora se realiza utilizando el **email del usuario (contacto)** en lugar de un ID numérico, mejorando la usabilidad
* **Panel de Registro**: Se implementó un formulario de registro (`/registro`) para que los nuevos usuarios puedan crear sus cuentas de forma segura.
* **Recuperación de Contraseña**: Se añadió un flujo para que los usuarios que hayan olvidado su contraseña puedan gestionar su recuperación.
* **Gestión de Tickets**: La aplicación ahora permite a los usuarios autenticados **añadir tickets**, formando el núcleo de la funcionalidad del sistema.

## Mejoras de Seguridad Implementadas

Se han implementado varias mejoras críticas para proteger los datos:

### 1. Ocultamiento de Contraseñas en Logs
Las contraseñas de los usuarios son tratadas como información clasificada. En ningún momento se registran en los logs del sistema, evitando exposiciones accidentales.

### 2. Eliminación de Query Strings para Datos Sensibles
No más  `?userId=123` en la URL. Se eliminó el paso de datos sensibles a través de *query strings*. En su lugar, se utiliza **Session Storage** para manejar la información de la sesión del usuario de forma segura, previniendo que los datos queden expuestos en el historial del navegador o en ataques de "shoulder surfing".

### 3. Hasheo de Contraseñas en la Base de Datos
No guardamos contraseñas, guardamos *sombras* criptográficas. Antes de persistir una nueva contraseña en la base de datos (tanto en el registro como en la recuperación), esta es procesada con un algoritmo de *hashing* (con bcrypt).

### 4. Sistema de Login Inteligente (Safe-Migration)
El proceso de login es robusto y está pensado para la migración de datos:
* **Comparación de Hashes**: El sistema compara de forma segura la contraseña ingresada contra el hash almacenado.
* **Advertencia de Texto Plano**: Si el sistema detecta que una contraseña en la base de datos está en texto plano (de un sistema anterior), **genera una advertencia interna**. Esto permite identificar y migrar cuentas inseguras sin bloquear el acceso al usuario.

## Colaboradores

* [KevinHart04](https://github.com/KevinHart04)
* [Jenaro112](https://github.com/Jenaro112)
* [Chate19](https://github.com/Chate19)
