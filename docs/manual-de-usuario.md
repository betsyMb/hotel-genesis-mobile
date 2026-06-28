# Manual de Usuario — Hotel Genesis App

## Introducción

Bienvenido al sistema de gestión hotelera **Hotel Genesis**. Esta aplicación permite a los huéspedes realizar reservas en línea, y al personal del hotel gestionar habitaciones, check-ins, check-outs y más, según su rol.

La aplicación está disponible para dispositivos Android e iOS.

---

## Roles de Usuario

Cada usuario inicia sesión con un rol que determina quéfunciones puede ver y usar:

| Rol | ¿Quién lo usa? | Acceso principal |
|-----|----------------|-----------------|
| **Cliente** | Huéspedes | Ver habitaciones, hacer reservas, ver perfil |
| **Recepcionista** | Personal de recepción | Check-in, check-out, reservas, walk-ins |
| **Administrador** | Gerente/Administrador | Gestión completa del hotel |
| **Gerente** | Gerencia | Reportes, contabilidad, habitaciones |
| **Mantenimiento** | Personal de mantenimiento | Tareas de mantenimiento |

---

## Inicio de Sesión

1. Abre la aplicación
2. Ingresa tu **correo electrónico** y **contraseña**
3. Presiona **"Iniciar Sesión"**
4. Si no tienes cuenta, presiona **"Registrarse"** y completa el formulario

![Pantalla de login]

> Nota: Los walk-ins (clientes sin reserva) son registrados por el recepcionista, no necesitan crear cuenta.

---

## Módulo Cliente

El cliente ve 4 pestañas en la parte inferior de la pantalla.

### Inicio
- Bienvenida con el nombre del usuario
- Acceso rápido a funciones principales

### Habitaciones (Rooms)
- Lista de todas las habitaciones disponibles
- Cada tarjeta muestra: tipo, capacidad, precio por noche y por 3 horas, piso
- Presiona una habitación para ver sus detalles en un modal
- Desde el modal puedes presionar **"Reservar ahora"**

### Booking (Reservar)
- Selecciona las fechas de entrada y salida
- Elige la habitación
- Selecciona el tipo de servicio: **Por Noche** o **Por 3 Horas**
- Revisa el resumen y presiona **"Confirmar Reserva"**
- Tu reserva quedará en estado **Pendiente** hasta que el hotel la confirme

### Perfil
- Ver tu información personal
- Cambiar entre tema claro/oscuro
- Cerrar sesión

---

## Módulo Recepcionista

El recepcionista ve un menú lateral con las siguientes opciones:

### Check-In
- Lista de reservas confirmadas para hoy
- Presiona una reserva para realizar el check-in
- También puedes registrar walk-ins (huéspedes sin reserva)

### Walk-Ins (Registro sin reserva)
- **Registrar Entrada:** Completa el formulario con datos del huésped, selecciona habitación disponible y tipo de servicio (noche / 3 horas). Puedes añadir huéspedes adicionales.
- **Registrar Salida:** Presiona una ocupación activa para registrar la salida. El sistema calcula automáticamente las noches.
- **Historial:** Ver todas las salidas completadas con detalles.

### Reservas
- Lista de todas las reservas
- Puedes cambiar el estado de una reserva (Pendiente → Confirmada, etc.)
- Presiona una tarjeta para ver/acceder a acciones disponibles

### Habitaciones
- Vista general de todas las habitaciones con su estado actual
- Filtros por estado (disponible, ocupada, mantenimiento)

### Check-Out
- Interfaz dedicada para registrar salidas rápidas
- Selecciona la habitación ocupada y confirma la salida

---

## Módulo Administrador

El administrador tiene acceso completo al sistema.

### Habitaciones
- **CRUD completo:** Crear, editar, eliminar habitaciones
- **Formulario de habitación:** número, tipo, piso, precio por noche, precio por 3 horas, capacidad, metros cuadrados, descripción, vistas, balcón
- **Estado de habitación:** disponible, ocupada, mantenimiento, reservada

### Reservas
- Lista completa de todas las reservas del hotel
- Ver historial de ingresos (total en Bs.)
- Cambiar estados: pendiente → confirmada → cancelada / completada

### Walk-Ins
- Mismas funciones que recepcionista: registro de entrada, salida, historial

### Usuarios
- **CRUD completo:** Crear, editar, eliminar usuarios
- Asignar roles (Administrador, Gerente, Recepcionista, Mantenimiento, Cliente)

### Reportes
- Estadísticas y gráficos del hotel
- Ingresos por período
- Ocupación de habitaciones

### Mantenimiento
- Lista de habitaciones con tareas de mantenimiento
- Marcar tareas como completadas
- Añadir notas de mantenimiento

### Configuración
- Servicios adicionales del hotel
- Promociones y códigos de descuento

---

## Módulo Gerente

### Habitaciones
- Ver lista de habitaciones con precios (por noche y 3 horas)
- Ver estado actual de cada habitación

### Reportes
- Estadísticas de ocupación e ingresos

### Contabilidad
- Reportes financieros del hotel

---

## Módulo Mantenimiento

### Tareas
- Lista de habitaciones asignadas con tareas de mantenimiento
- Marcar tareas como completadas
- Ver notas y descripciones de cada tarea

---

## Walk-In (Registro sin Reserva)

El walk-in permite registrar a un huésped que llega al hotel sin reserva previa.

### Registrar Entrada
1. Presiona **"Registrar Entrada"**
2. Completa los datos del huésped principal (nombre, apellido, DNI, teléfono)
3. Selecciona una habitación disponible de la lista
4. Elige el tipo de servicio: **Por Noche** o **Por 3 Horas**
5. Opcional: añade huéspedes adicionales
6. Presiona **"Confirmar Check-In"**

### Registrar Salida
1. Presiona la ocupación activa en la lista
2. Confirma la salida en el diálogo
3. El sistema muestra: habitación, huésped, duración, fechas

---

## Notificaciones

- Los administradores y recepcionistas ven un ícono de campana en el encabezado
- El badge muestra la cantidad de notificaciones no leídas
- Presiona la campana para abrir el listado de notificaciones
- Las notificaciones se generan automáticamente 2 días antes de una reserva confirmada
- Presiona **"Marcar todas como leídas"** para limpiar

---

## Tipos de Servicio

Al hacer una reserva o walk-in, puedes elegir:

| Servicio | Descripción |
|----------|-------------|
| **Por Noche (Nightly)** | Tarifa estándar por noche. Ideal para estadías de 1+ noches. |
| **Por 3 Horas** | Tarifa fija por un bloque de 3 horas. Ideal para descansos breves. |

- Las tarjetas de resumen muestran "3h" cuando el servicio es por horas
- El badge en el historial también refleja el tipo de servicio

---

## Preguntas Frecuentes

**¿Cómo cambio mi contraseña?**
Por ahora, contacta al administrador del sistema.

**¿Por qué mi reserva aparece como "Pendiente"?**
Las reservas requieren confirmación del hotel. Un recepcionista o administrador debe cambiar el estado a "Confirmada".

**¿Puedo cancelar mi reserva?**
Sí, contacta al hotel para cancelar. Un administrador puede cambiar el estado a "Cancelada".

**¿Qué hago si hay un problema con la habitación?**
Reporta el problema al recepcionista, quien puede asignar una tarea de mantenimiento.

**¿Cómo cierro sesión?**
Presiona el ícono de salida (🚪) en la esquina superior derecha.

---

## Soporte Técnico

Si encuentras algún error o problema técnico, contacta al administrador del sistema o al equipo de desarrollo.
