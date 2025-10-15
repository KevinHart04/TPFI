# Trabajo Práctico Final Integrador - IS1

> Documentación del proyecto final de Ingeniería de Software I.

**Autores:**

- Chatelain, Agustín
- Galdini, Jenaro
- Hartmann, Kevin

## Tabla de Contenidos

- [Introducción](#introducción)
- [Primeros Pasos](#primeros-pasos)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
- [Uso](#uso)
  - [Ejecutando la aplicación](#ejecutando-la-aplicación)
  - [Ejemplos de uso](#ejemplos-de-uso)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
  - [Componentes Principales](#componentes-principales)
  - [Diagrama de Arquitectura](#diagrama-de-arquitectura)
- [Referencia de la API](#referencia-de-la-api)
- [Esquema de la Base de Datos](#esquema-de-la-base-de-datos)
- [Despliegue](#despliegue)
- [Ejecución de Pruebas](#ejecución-de-pruebas)
- [Construido Con](#construido-con)
- [Contribuciones](#contribuciones)
- [Autores y Agradecimientos](#autores-y-agradecimientos)
- [Licencia](#licencia)

---

## Introducción

Este documento detalla el desarrollo y la arquitectura del sistema "Mesa de Ayuda", un proyecto final para la cátedra de Ingeniería de Software I.

El propósito de este software es ofrecer una solución web integral para la gestión de tickets de soporte. El sistema busca resolver la necesidad de centralizar, organizar y dar seguimiento a las solicitudes de ayuda generadas por los clientes de una empresa, mejorando la eficiencia y la comunicación.

Está dirigido principalmente a los **clientes finales**, quienes pueden:

- Registrarse en la plataforma.
- Iniciar sesión de forma segura.
- Crear nuevos tickets de soporte para reportar incidencias.
- Visualizar el historial y el estado de sus tickets.

El objetivo es proporcionar un canal de comunicación claro y ordenado entre los clientes y el equipo de soporte técnico de una organización.

---

## Primeros Pasos

Instrucciones sobre cómo poner en marcha una copia local del proyecto para desarrollo y pruebas.

### Prerrequisitos

Lista de software y herramientas necesarias para instalar y ejecutar el proyecto. Incluye versiones específicas.

```bash
# Ejemplo de prerrequisitos
Node.js >= 18.x
npm >= 9.x
```

### Instalación

Una guía paso a paso sobre cómo instalar el proyecto.

1.  **Clonar el repositorio**

    ```bash
    git clone https://github.com/KevinHart04/TPFI.git
    cd TPFI
    ```

2.  **Instalar dependencias**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**
    Crea un archivo `.env` a partir de `.env.example` y completa las variables necesarias.

    ```bash
    cp .env.example .env
    ```

    Ejemplo de variables:

    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    API_KEY="tu_api_key_secreta"
    ```

---

## Uso

Instrucciones y ejemplos sobre cómo utilizar la aplicación una vez instalada.

### Ejecutando la aplicación

```bash
# Iniciar el servidor de desarrollo
node server.js
```

La aplicación estará disponible en `http://localhost:8080`.

### Ejemplos de uso

Muestra ejemplos prácticos de cómo interactuar con tu aplicación. Puedes incluir fragmentos de código, capturas de pantalla o GIFs.

---

## Arquitectura del Sistema

Una visión general de alto nivel de la arquitectura del software.

### Componentes Principales

- **Frontend**: Archivos `HTML` y `CSS` para la interfaz de usuario.
- **Backend**: Archivos `JS` y `JSON` para el servidor.
- **Base de Datos**: `DynamoDB` para almacenamiento de datos.
- **Servicios Externos**: `AWS`

### Diagrama de Arquitectura

![Diagrama de Arquitectura del Sistema](C:\Users\jenar\OneDrive\Desktop\TP-ing\TPFI\public\img\diagrama.png)

---

## Referencia de la API - Mesa de Ayuda

Esta es la documentación oficial para la API REST del sistema de Mesa de Ayuda. Todos los endpoints esperan y devuelven datos en formato `JSON`.

### Endpoints de Clientes

Estos endpoints gestionan la autenticación y el registro de usuarios.

---

#### 1. Login de Cliente

Autentica a un cliente usando su correo y contraseña.

- **Método:** `POST`
- **Ruta:** `/cliente/login`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "contacto": "usuario@example.com",
    "password": "password123"
  }
  ```

- **Respuesta Exitosa (200 OK):** Devuelve los datos del cliente, incluyendo el `id` para usar en otras peticiones.

  ```json
  {
    "response": "OK",
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "contacto": "usuario@example.com",
    "nombre": "Nombre del Usuario",
    "fecha_ultimo_ingreso": "15/07/2024"
  }
  ```

- **Respuesta de Error (400/401):**

  ```json
  {
    "response": "ERROR",
    "message": "Contraseña incorrecta"
  }
  ```

---

#### 2. Registro de Cliente

Crea un nuevo cliente en la base de datos.

- **Método:** `POST`
- **Ruta:** `/cliente/registro`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "nombre": "Nuevo Usuario",
    "contacto": "nuevo@example.com",
    "password": "unapasswordsegura"
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "cliente": {
      "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
      "nombre": "Nuevo Usuario",
      "contacto": "nuevo@example.com",
      "activo": true,
      "registrado": true,
      "fecha_alta": "15/07/2024"
    }
  }
  ```

- **Respuesta de Error (400 Bad Request):**

  ```json
  {
    "response": "ERROR",
    "message": "Cliente ya existe"
  }
  ```

---

#### 3. Cambiar Contraseña

Permite a un cliente restablecer su contraseña.

- **Método:** `POST`
- **Ruta:** `/cliente/resetPassword`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "contacto": "usuario@example.com",
    "password": "nuevapasswordsegura123"
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "message": "Password actualizada"
  }
  ```

- **Respuesta de Error (404 Not Found):**

  ```json
  {
    "response": "ERROR",
    "message": "Cliente no encontrado"
  }
  ```

### Endpoints de Tickets

Estos endpoints se utilizan para gestionar los tickets de soporte de los clientes.

---

#### 1. Listar Tickets de un Cliente

Obtiene todos los tickets asociados a un ID de cliente específico.

- **Método:** `POST`
- **Ruta:** `/tickets/listarTicket`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "id_cliente": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "data": [
      {
        "id": "cf92c555-6a65-4479-b8bd-8a5995695e09",
        "descripcion": "El monitor no enciende.",
        "solucion": null,
        "fecha_apertura": "14/07/2024"
      },
      {
        "id": "tkt-002",
        "descripcion": "No puedo acceder al sistema de facturación.",
        "solucion": "Se reseteó la contraseña del usuario.",
        "fecha_apertura": "10/07/2024"
      }
    ]
  }
  ```

- **Respuesta de Error (404 Not Found):**

  ```json
  {
    "response": "ERROR",
    "message": "El cliente no tiene tickets"
  }
  ```

---

#### 2. Crear un Nuevo Ticket

Crea un nuevo ticket de soporte para un cliente.

- **Método:** `POST`
- **Ruta:** `/tickets/addTicket`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "contacto": "usuario@example.com",
    "descripcion": "La impresora no funciona."
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "ticket": {
      "id": "cf92c555-6a65-4479-b8bd-8a5995695e09",
      "clienteID": "usuario@example.com",
      "descripcion": "La impresora no funciona.",
      "estado_solucion": 1,
      "fecha_apertura": "15/07/2024"
    }
  }
  ```

---

#### 3. Obtener un Ticket por ID

Recupera los detalles de un ticket específico.

- **Método:** `POST`
- **Ruta:** `/tickets/getTicket`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "id": "cf92c555-6a65-4479-b8bd-8a5995695e09"
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "data": {
      "id": "cf92c555-6a65-4479-b8bd-8a5995695e09",
      "clienteID": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "descripcion": "El monitor no enciende.",
      "estado": "Pendiente",
      "fecha_apertura": "16/07/2024"
    }
  }
  ```

- **Respuesta de Error (404 Not Found):**

  ```json
  {
    "response": "ERROR",
    "message": "Ticket no encontrado"
  }
  ```

---

#### 4. Actualizar un Ticket

Modifica la descripción o el estado de un ticket existente.

- **Método:** `POST`
- **Ruta:** `/tickets/updateTicket`
- **Cuerpo de la Petición (Request Body):**

  ```json
  {
    "id": "cf92c555-6a65-4479-b8bd-8a5995695e09"
  }
  ```

- **Respuesta Exitosa (200 OK):**

  ```json
  {
    "response": "OK",
    "data": {
      "id": "cf92c555-6a65-4479-b8bd-8a5995695e09",
      "descripcion": "El monitor no enciende, ya probé cambiar el cable.",
      "estado": "En progreso"
    }
  }
  ```

## Esquema de la Base de Datos

Descripción de las tablas/colecciones principales, sus columnas/campos y las relaciones entre ellas. Puedes incluir un Diagrama Entidad-Relación.

---

## Despliegue

Instrucciones sobre cómo desplegar el proyecto en un entorno de producción. Menciona plataformas (ej. Vercel, Heroku, AWS) y los pasos necesarios.

---

## Construido Con

- HTML, CSS y JS para el frontend.
- Node.js - El entorno de ejecución para el backend.
- Express - El framework para el servidor backend.
- <!-- !Pedirle a kevin todo esto -->
  -jijo

---
