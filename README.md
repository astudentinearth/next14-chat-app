# 🗨️ Next 14 real time chat

Real time chat app built with Next 14, shadcn-ui, socket.io, Drizzle ORM and lucia-auth

## Features

-   User authentication
-   Direct messages
-   Channels and invite links (with or without expiry)
-   Single use invites

## Database

Create a Postgres database, set the environment variable `PG_CONNECTION_STRING` and run the migrations inside `/drizzle` by running `pnpm drizzle-kit migrate`

## Development

```bash
pnpm install
pnpm dev
```

## Building

```bash
pnpm install
pnpm build
pnpm start # runs in production
```
