# Nuestra Bitácora

Aplicación privada y mobile-first para una relación a distancia.

## Stack
- Next.js + TypeScript
- Prisma
- PostgreSQL
- Vercel

## Desarrollo
```bash
npm install
cp .env.example .env
# coloca DATABASE_URL en .env
npx prisma db push
npm run dev
```

## Próximos pasos
1. Crear una base PostgreSQL (por ejemplo Neon desde Vercel Marketplace).
2. Copiar `DATABASE_URL` a las variables de entorno de Vercel.
3. Ejecutar `npx prisma db push`.
4. Añadir autenticación privada para separar Tú/Ella.
5. Completar la edición segura de reseñas y el historial de estados.
