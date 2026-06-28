# Manual de Programación — Hotel App

## Stack Tecnológico

### Frontend (hotel-app)
- **Framework:** Expo SDK 54 + React Native 0.81.5
- **Lenguaje:** TypeScript ~5.9.2
- **Navegación:** Expo Router 6 con drawer (role-based navigation)
- **Estilos:** NativeWind 4 (Tailwind CSS para React Native)
- **Estado/Peticiones:** TanStack React Query 5
- **Iconos:** @expo/vector-icons (MaterialIcons)
- **Almacenamiento local:** expo-secure-store (primario), AsyncStorage (fallback)
- **Notificaciones push:** expo-notifications + expo-device
- **Date picker:** @react-native-community/datetimepicker

### Backend (hotel-app-back)
- **Framework:** NestJS 11
- **ORM:** TypeORM 0.3 con PostgreSQL
- **Lenguaje:** TypeScript
- **Autenticación:** JWT (24h de expiración) con passport + passport-jwt
- **Encriptación:** bcrypt
- **Push:** expo-server-sdk
- **Tareas programadas:** @nestjs/schedule (cron)
- **Documentación API:** Swagger (opcional)

---

## Estructura del Proyecto (Frontend)

```
hotel-app/
├── app/                      # Rutas de Expo Router
│   ├── _layout.tsx           # Layout raíz (Theme + Query + Auth providers)
│   ├── index.tsx             # Página de inicio (redirige según rol)
│   ├── (auth)/               # Pantallas de autenticación
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/               # Cliente: tabs inferiores
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── booking.tsx
│   │   ├── rooms.tsx
│   │   └── profile.tsx
│   ├── admin/                # Rol: Administrador
│   │   ├── _layout.tsx       # Drawer navigation
│   │   ├── rooms.tsx
│   │   ├── reservations.tsx
│   │   ├── walkin.tsx
│   │   ├── walkin-history.tsx
│   │   ├── users.tsx
│   │   ├── reports.tsx
│   │   ├── maintenance.tsx
│   │   ├── settings.tsx
│   │   └── profile.tsx
│   ├── manager/              # Rol: Gerente
│   │   ├── _layout.tsx
│   │   ├── rooms.tsx
│   │   ├── reports.tsx
│   │   ├── accounting.tsx
│   │   └── profile.tsx
│   ├── receptionist/         # Rol: Recepcionista
│   │   ├── _layout.tsx
│   │   ├── checkin.tsx
│   │   ├── checkout.tsx
│   │   ├── reservations.tsx
│   │   ├── rooms.tsx
│   │   ├── walkin.tsx
│   │   ├── walkin-history.tsx
│   │   └── profile.tsx
│   └── maintinence/          # Rol: Mantenimiento
│       ├── _layout.tsx
│       ├── maintenance.tsx
│       └── profile.tsx
├── components/
│   ├── shared/               # Componentes reutilizables
│   │   ├── index.ts          # Barrel export
│   │   ├── RoomCard.tsx
│   │   ├── RoomFormModal.tsx
│   │   ├── ReservationCard.tsx
│   │   ├── ReservationFormModal.tsx
│   │   ├── NotificationsModal.tsx
│   │   ├── StatusPickerModal.tsx
│   │   ├── UserCard.tsx
│   │   ├── UserFormModal.tsx
│   │   ├── StatBadge.tsx
│   │   ├── EmptyState.tsx
│   │   └── ProfileRow.tsx
│   ├── client/               # Componentes específicos de cliente
│   │   ├── ClientRoomCard.tsx
│   │   └── ClientReservationCard.tsx
│   ├── receptionist/
│   │   ├── ReservationCard.tsx
│   │   ├── OccupancyCard.tsx
│   │   └── CheckInOutModals.tsx
│   ├── walkin/
│   │   ├── WalkInDashboard.tsx
│   │   ├── WalkInForm.tsx
│   │   ├── WalkInHistory.tsx
│   │   ├── GuestFormRow.tsx
│   │   └── NewUserModal.tsx
│   └── ... (componentes base: ThemedText, ThemedView, etc.)
├── hooks/
│   ├── index.ts              # Barrel export de hooks públicos
│   ├── api/
│   │   ├── client.ts         # Cliente HTTP (fetch con JWT)
│   │   ├── types.ts          # Tipos compartidos + ENDPOINTS
│   │   ├── walkin-types.ts   # Tipos de walk-in
│   │   ├── use-notifications.ts
│   │   └── use-walkin.ts
│   ├── auth/use-auth.tsx     # Contexto de autenticación
│   ├── rooms/use-rooms.ts
│   ├── reservations/use-reservations.ts
│   ├── occupancies/use-occupancies.ts
│   ├── promotions/use-promotions.ts
│   ├── services/use-services.ts
│   ├── roles/use-roles.ts
│   ├── use-users.ts
│   ├── use-exchange-rate.ts
│   ├── use-push-notifications.ts
│   ├── use-biometric.ts
│   ├── use-theme.tsx
│   └── providers/query-provider.tsx
├── app.json                  # Configuración de Expo
├── eas.json                  # Configuración de EAS Build
├── .env                      # Variables de entorno locales
├── tailwind.config.js        # Configuración de NativeWind
└── tsconfig.json
```

---

## Estructura del Proyecto (Backend)

```
hotel-app-back/
├── src/
│   ├── main.ts                        # Punto de entrada
│   ├── app.module.ts                  # Módulo raíz
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── auth/                          # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts            # Estrategia JWT (Passport)
│   │   ├── jwt-auth.guard.ts          # Guard de autenticación
│   │   ├── roles.guard.ts             # Guard de roles
│   │   ├── roles.decorator.ts         # @Roles() decorator
│   │   ├── current-user.decorator.ts  # @CurrentUser() decorator
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users/                         # CRUD de usuarios
│   ├── rooms/                         # CRUD de habitaciones
│   ├── reservations/                  # CRUD de reservas + detección de conflictos
│   ├── occupancies/                   # Ocupaciones (check-in/out real)
│   ├── walkin/                        # Walk-in (check-in sin reserva)
│   ├── roles/                         # Roles del sistema
│   ├── services/                      # Servicios adicionales
│   ├── promotions/                    # Promociones/Cupones
│   └── notifications/                 # Notificaciones push + in-app
│       ├── notifications.module.ts
│       ├── notifications.controller.ts
│       ├── notifications.service.ts   # CRUD + cron + Expo push
│       └── entities/
│           └── notification.entity.ts
├── db/
│   ├── schema.sql                     # Esquema completo de la BD
│   └── migrations/                    # Migraciones SQL
│       ├── 002_add_walkin_tables.sql
│       ├── ...
│       └── 011_add_service_type.sql
└── package.json
```

---

## Roles del Sistema

| Rol | Ruta | Descripción |
|-----|------|-------------|
| `Administrator` | `/admin` | CRUD completo: habitaciones, usuarios, reservas, reportes |
| `Manager` | `/manager` | Visión general: habitaciones, reportes, contabilidad |
| `Receptionist` | `/receptionist` | Check-in/out, reservas, walk-ins |
| `Client` | `/(tabs)` | Consultar habitaciones, reservar, perfil |
| `Maintenance` | `/maintinence` | Tareas de mantenimiento |

La navegación se controla con `RoleGuard` en cada layout. El login redirige según el rol del usuario.

---

## Flujo de Autenticación

1. `login()` en `AuthProvider` envía `POST /auth/login` con email + password
2. Backend valida credenciales, devuelve `{ access_token, user }`
3. Token se almacena en SecureStore (con fallback a AsyncStorage)
4. `api` client automáticamente añade header `Authorization: Bearer <token>`
5. En `401`, el token se elimina y se fuerza logout
6. Al iniciar la app, `restoreSession()` recupera el token guardado y decodifica JWT para restaurar el usuario

---

## API Client (`hooks/api/client.ts`)

Cliente HTTP basado en `fetch` con:

- **`api.get(url)`** — GET con autenticación
- **`api.post(url, data)`** — POST con autenticación
- **`api.postPublic(url, data)`** — POST sin autenticación (login, register)
- **`api.patch(url, data)`** — PATCH con autenticación
- **`api.delete(url)`** — DELETE con autenticación

Manejo de errores:
- `401` → elimina token automáticamente
- Respuestas vacías (DELETE) → retorna `null` sin error
- Errores HTTP → lanza `Error` con `errorData.message` del body

---

## ENDPOINTS (Backend)

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Iniciar sesión |
| `/auth/register` | POST | No | Registrar usuario |
| `/users` | GET/POST | Sí | CRUD usuarios |
| `/users/:id` | GET/PATCH/DELETE | Sí | CRUD usuario individual |
| `/rooms` | GET/POST | Sí | CRUD habitaciones |
| `/rooms/:id` | GET/PATCH/DELETE | Sí | CRUD habitación individual |
| `/rooms/:id/tasks` | PATCH | Sí | Actualizar tareas de mantenimiento |
| `/reservations` | GET/POST | Sí | CRUD reservas |
| `/reservations/:id` | GET/PATCH/DELETE | Sí | CRUD reserva individual |
| `/occupancies` | GET/POST | Sí | CRUD ocupaciones |
| `/occupancies/:id` | GET/PATCH/DELETE | Sí | CRUD ocupación individual |
| `/services` | GET/POST | Sí | CRUD servicios |
| `/promotions` | GET/POST | Sí | CRUD promociones |
| `/walkin/checkin` | POST | Sí | Check-in walk-in |
| `/walkin/checkout` | POST | Sí | Check-out walk-in |
| `/walkin/history` | GET | Sí | Historial de walk-ins |
| `/notifications` | GET | Sí | Listar notificaciones del usuario |
| `/notifications/unread-count` | GET | Sí | Contador de no leídas |
| `/notifications/:id/read` | PATCH | Sí | Marcar como leída |
| `/notifications/read-all` | PATCH | Sí | Marcar todas como leídas |

---

## Variables de Entorno

### Frontend (`.env`)
```
EXPO_PUBLIC_COTIZAVE_KEY=    # API Key de Cotizave para tipo de cambio
EXPO_PUBLIC_COTIZAVE_API_URL=  # URL de la API de Cotizave
EXPO_PUBLIC_BASE_URL=        # URL del backend (producción)
```

### app.json extra
```json
{
  "extra": {
    "backendUrl": "https://hotel-genesis-backend.onrender.com"
  }
}
```

### Backend
Variables definidas en el entorno del servidor (Render/railway):
- `DATABASE_URL` — conexión a PostgreSQL
- `JWT_SECRET` — secreto para firmar tokens
- `PORT` — puerto del servidor

---

## Migraciones de Base de Datos

Las migraciones están en `hotel-app-back/db/migrations/`. Se aplican manualmente contra PostgreSQL:

```
psql -h <host> -d <database> -f db/migrations/010_add_price_per_3hours.sql
```

Lista de migraciones:
1. `002_add_walkin_tables.sql` — Tablas walk-in/guests
2. `003_make_occupancy_reservation_nullable.sql` — Walk-ins sin reserva
3. `004_add_maintenance_notes_to_rooms.sql`
4. `005_add_maintenance_tasks_to_rooms.sql`
5. `006_allow_same_day_reservations.sql`
6. `007_add_bs_amounts.sql` — total_amount_bs
7. `008_create_notifications.sql` — Tabla de notificaciones
8. `009_add_push_token.sql` — Columna push_token en users
9. `010_add_price_per_3hours.sql` — Precio por 3 horas en rooms
10. `011_add_service_type.sql` — Tipo de servicio en reservations/occupancies

---

## Notificaciones Push

### Backend
- Cron job diario a las 6 AM (`CronExpression.EVERY_DAY_AT_6AM`)
- Busca reservas que inician en 2 días con estado `confirmed`
- Crea notificaciones in-app (tabla `notifications`)
- Envía push via Expo Push API (`expo-server-sdk`) a usuarios con `push_token` válido
- Deduplicación: evita crear notificación si ya existe `id_user + id_reservation + title`

### Frontend
- `usePushNotifications()` en `app/_layout.tsx` solicita permiso y registra el token
- `NotificationsModal.tsx` — campana con badge + modal de notificaciones
- Las notificaciones están disponibles para admin y recepcionista (en sus headers)

---

## Detección de Conflictos de Reservas

En `reservations.service.ts`:

```typescript
async checkOverlap(
  id_room: number,
  checkIn: Date,
  checkOut: Date,
  excludeId?: number,
): Promise<Reservation[]>
```

- Busca reservas con fechas solapadas y estado `pending` o `confirmed`
- Si hay solapamiento con estado `confirmed` → lanza `BadRequestException("CONFIRMADA")`
- Si hay solapamiento con estado `pending` → lanza `BadRequestException("PENDIENTE")`
- El frontend captura el mensaje y muestra un `Alert.alert()` personalizado
- Se aplica en `create()`, `update()`, `updateByClient()`

---

## Tipos de Servicio y Precios

- `service_type`: `'nightly'` (por noche) o `'3hours'` (por 3 horas fijas)
- `price_per_3hours`: precio fijo para estadías de tipo 3 horas
- Precio se recalcula en el frontend según `service_type` seleccionado
- El badge en historial walk-in y tarjetas muestra "3h" cuando `service_type === '3hours'`

---

## Comandos Útiles

```bash
# Frontend
npm start                    # Iniciar Expo dev
npx expo run:android         # Compilar y correr en Android
npx tsc --noEmit             # TypeScript check

# Backend
npm run build                # Compilar NestJS
npm start                    # Iniciar servidor
npm run start:dev            # Iniciar en modo watch

# EAS Build
eas build --platform android --profile development
eas build --platform android --profile production
```
