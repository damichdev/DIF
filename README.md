# Sistema DIF Tapachula

Sistema de citas y expediente clínico: 4 microservicios Spring Boot + frontend React (Vite).

| Componente | Carpeta | Puerto | Base de datos |
|---|---|---|---|
| Médico + login | `Medico-Service/Medico-Service` | 8081 | `medicos_db` |
| Paciente | `Paciente-Service/Paciente-Service` | 8082 | `pacientes_db` |
| Citas y signos vitales | `Citas-Servies/Citas-Service` | 8083 | `citas_db` |
| Clínica (expedientes y consultas) | `Clinica-Expediente-Service/Clinica-Service` | 8084 | `clinica_db` |
| Frontend | `dif-tapachula` | 5173 | — |

## Requisitos

- Java 17 o superior
- Node.js 18 o superior
- PostgreSQL 16 (usuario `postgres`)

## Puesta en marcha

### 1. Crear las bases de datos

Hibernate crea las tablas solo, pero no las bases:

```sql
CREATE DATABASE medicos_db;
CREATE DATABASE pacientes_db;
CREATE DATABASE citas_db;
CREATE DATABASE clinica_db;
```

### 2. Definir la contraseña de PostgreSQL

Los servicios la leen de la variable `DB_PASSWORD` (si no existe, usan `postgres`). No se guarda en el repositorio.

```bash
# Git Bash / Linux / macOS
export DB_PASSWORD=tu_password

# PowerShell
$env:DB_PASSWORD = "tu_password"
```

Define la variable en la misma terminal desde la que arrancas cada servicio.

### 3. Levantar los microservicios, en este orden

Citas y Clínica consultan a Médico y Paciente, así que esos dos van primero. Cada servicio va en su propia terminal; espera a ver `Started ...Application` antes de abrir el siguiente.

```bash
cd Medico-Service/Medico-Service            && ./mvnw spring-boot:run   # 1 · 8081
cd Paciente-Service/Paciente-Service        && ./mvnw spring-boot:run   # 2 · 8082
cd Citas-Servies/Citas-Service              && ./mvnw spring-boot:run   # 3 · 8083
cd Clinica-Expediente-Service/Clinica-Service && ./mvnw spring-boot:run # 4 · 8084
```

En Windows con cmd o PowerShell usa `mvnw.cmd` en lugar de `./mvnw`.

Los catálogos (sexos, derechohabiencias y estatus de cita) se cargan solos desde `data.sql` al arrancar.

### 4. Crear los usuarios de acceso

La base nace sin usuarios y el código no trae ninguno fijo. Créalos con la API (ajusta correos y contraseñas):

```bash
# Recepción (rol R) y enfermería (rol E)
curl -X POST localhost:8081/api/auth/personal -H "Content-Type: application/json" \
  -d '{"nombre":"Recepcion DIF","correo":"recepcion@dif.gob.mx","contrasena":"Recep2026!","rol":"R"}'
curl -X POST localhost:8081/api/auth/personal -H "Content-Type: application/json" \
  -d '{"nombre":"Enfermeria DIF","correo":"enfermeria@dif.gob.mx","contrasena":"Enferm2026!","rol":"E"}'

# Médico (crea también su cuenta de acceso, rol M)
curl -X POST localhost:8081/api/medicos -H "Content-Type: application/json" \
  -d '{"nombre":"Laura","apPaterno":"Torres","cedulaProfesional":"CED-1001","areaEspecialidad":"Medicina General","correo":"dratorres@dif.gob.mx","contrasena":"Medico2026!"}'
```

Las contraseñas se guardan con hash BCrypt. Mínimo 6 caracteres.

### 5. Frontend

```bash
cd dif-tapachula
npm install
npm run dev
```

Abre http://localhost:5173. Vite redirige `/api/...` a los puertos 8081–8084 (ver `vite.config.js`).

## Roles y menús

| Rol | Módulos |
|---|---|
| Recepción (R) | Registrar paciente, Agendar citas, Signos vitales |
| Enfermería (E) | Signos vitales, Búsqueda de pacientes |
| Médico (M) | Búsqueda, Expediente, Consulta, Historial, Receta (en construcción) |

## Problemas frecuentes

- **`password authentication failed`**: `DB_PASSWORD` no coincide con tu PostgreSQL.
- **`database "..." does not exist`**: falta el paso 1.
- **Desplegables de sexo o estatus vacíos**: reinicia el servicio correspondiente para que cargue `data.sql`.
- **`Connection refused` al agendar o registrar signos**: Médico o Paciente no están corriendo; respeta el orden del paso 3.
- **Puerto ocupado**: otro proceso usa 8081–8084 o 5173.
- **El login rechaza todo**: no se crearon los usuarios (paso 4).

## Pendiente conocido

- La API todavía no exige token: el login valida las credenciales, pero los endpoints pueden llamarse directamente. Falta agregar Spring Security con JWT antes de exponer el sistema.
- Los módulos del médico (expediente clínico, consulta, historial y receta) están como maquetas sin conectar al backend.
