# Setup

## setup front end

```bash
cd client
pnpm install

cp .env.example .env
pnpm run dev
```

## setup back end

```bash
cd server
pnpm install

cp .env.example .env
pnpm run migrate
pnpm run dev
```