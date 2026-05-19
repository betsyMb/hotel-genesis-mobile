# Hotel App - Project Summary

## Stack
- Frontend: Expo SDK 54, React Native, NativeWind, TanStack Query, Expo Router (drawer)
- Backend: NestJS 11, TypeORM, PostgreSQL
- Auth: JWT (SecureStore primary, AsyncStorage fallback)

## Architecture
- Role-based navigation: Admin, Manager, Receptionist, Maintenance, Client
- API client: `hooks/api/client.ts` — Fetch wrapper with SecureStore+AsyncStorage token storage, JWT interceptor, `postPublic`
- Auth: `hooks/use-auth.tsx` — Auth context with SecureStore session persistence, JWT decode fallback
- Shared components in `components/shared/` with barrel index exports
- Role-specific components in `components/[role]/`

## Key Decisions
- SecureStore > AsyncStorage for auth tokens
- Walk-in `id_reservation` must be `null` (not `0`)
- DTO field: `phone_number` (not `phone`)
- Backend `synchronize: false` — schema changes via SQL migrations
- `<Modal>` replaced with absolute-positioned View to avoid React context loss in Expo 54
- Date fields use plain `TextInput` (YYYY-MM-DD) instead of `DateTimePicker` to avoid navigation context issues
- ErrorBoundary wraps reservation form content for debugging

## Known Issues
- Pre-existing TS error in `components/ThemedTextInput.tsx:27` (style type mismatch)
- ErrorBoundary in `ReservationFormModal` catches errors with component stack logging

## Route Mapping
- Admin → `/admin/rooms`
- Manager → `/manager`
- Receptionist → `/receptionist/checkin`
- Maintenance → `/maintinence`
- Client → `/(tabs)/home`

## Backend Notes
- JWT expires in 24h; 401 → `removeToken()`
- Walk-in creates user by DNI if not found (auto-email, DNI-hashed password)
- `UpdateUserDto` uses `extends PartialType(CreateUserDto)` without field redeclarations
- `UsersService.update()` loads without relations before save to avoid stale `role` FK override
