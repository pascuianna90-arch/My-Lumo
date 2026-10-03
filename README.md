# My Lumo

**Egy lény. Egy világ. Te irányítod.**

Standalone My Lumo prototype based on the approved concept image. It does **not** modify or depend on the Before&After project.

## What works

- Shared persistent Lumo state stored on the server.
- Command queue: users can submit commands and Lumo executes them one-by-one.
- Supported command families in Hungarian / English / Romanian.
- Persistent changes: location, mood, level, inventory, followers, world-change log.
- Live history with country labels.
- Live world map and location movement.
- Lumo currency demo wallet; every command costs 2 Lumo.
- Demo top-up shop (no real money is charged).
- Basic safety filtering for unsafe commands.
- Responsive desktop/mobile UI.
- Railway-ready Node server with `/health` endpoint.

## Run locally

```bash
npm start
```

Open http://localhost:3000

## Important

Real payments are intentionally disabled. The next production step is to connect Stripe only after business/tax setup is ready.
