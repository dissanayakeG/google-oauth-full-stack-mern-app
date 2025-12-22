# FE setup

```bash
pnpm create vite react-fe --template react-ts
pnpm add axios react-router-dom
```

## run

```bash
cd react-fe
pnpm run dev
```

```bash
add tailwind and configure
https://tailwindcss.com/docs/installation/using-vite
then import "./App.css" in App.tsx
```


# BE setup

```bash
pnpm init

pnpm add express @types/express @types/node eslint prettier helmet cors @types/cors bcrypt @types/bcrypt jsonwebtoken @types/jsonwebtoken dotenv zod sequelize sequelize-cli mysql2 http-status-codes googleapis
```

initial server

```ts
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
    console.log("Server started on port:" + `http://localhost:${process.env.PORT}`);
});
```

## auto load

```bash
pnpm add -D tsx typescript
```
### package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```



# TODO

```
Improvement: Use a middleware

to reuse Zod validation across multiple routes:

// middlewares/validate.ts
import { z, AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }
};


in route:

import { validate } from '../middlewares/validate';
import { createUserSchema } from '../dtos/create-user.dto';

router.post('/add-user', validate(createUserSchema), async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ message: 'User added', user: newUser });
});
```