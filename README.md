# EMY Digital Death Screen V1 — Premium FiveM Death UI

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![FiveM](https://img.shields.io/badge/platform-FiveM-orange.svg)
![Framework](https://img.shields.io/badge/framework-QB%20%2F%20Qbox%20%2F%20ESX%20%2F%20Standalone-purple.svg)
![Language](https://img.shields.io/badge/language-English-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Price](https://img.shields.io/badge/price-FREE-brightgreen.svg)

### 📺 [Watch Preview Video on YouTube](https://www.youtube.com/watch?v=S0TKSpNEUvY)

**EMY Digital Death Screen** is a polished, high-performance death UI for FiveM.  
It gives your players a modern unconscious screen with bleed-out timer, free camera, EMS signal, locked give-up, and optional wait-time minigames — while staying easy to wire into **your own ambulance / medical system**.

> **Important:** This is a death **UI layer**, not a full ambulance job.  
> You must open / close it from your ambulance or death handler using the exports and events below.

---

## 🚀 Key Features

- **🎨 Premium NUI:** Clean death screen with countdown, responsive scaling for 1080p / 1440p / 4K
- **🎥 Free Camera (F):** Scripted freecam with WASD + mouse look while downed
- **📡 Dispatch (G):** Send an EMS / signal request (cooldown protected)
- **🔒 Locked Give Up (E):** Respawn button stays locked until the bleed-out timer hits `00:00`
- **🎮 Minigames:** Optional 2048 + Clumsy Bird while waiting for EMS
- **⚙️ Framework Auto-Detect:** `qbx_core` → `qb-core` → `es_extended` → `standalone`
- **🔌 Easy Integration:** Client exports + server events for any ambulance job
- **⚡ Optimized:** Idle resmon ~`0.00` while alive (no death loop)

---

## 📋 Requirements

- A FiveM server (`cerulean` / `lua54`)
- Your **ambulance / death / medical** resource (required for production use)
- Framework optional: QBCore, Qbox, ESX, or standalone

No database / `oxmysql` required.

---

## 🛠️ Installation

1. **Download** the latest release (or clone this repository).
2. **Rename** the folder to exactly `emydigital-deathscreen`.
3. Place it in your server `resources` folder.
4. Add to `server.cfg` **after** your framework and ambulance resource:

   ```cfg
   ensure qb-core                 # or qbx_core / es_extended
   ensure qb-ambulancejob         # your ambulance / medical resource
   ensure emydigital-deathscreen
   ```

5. Restart the server (or `ensure emydigital-deathscreen`).
6. Wire **open / close** into your ambulance death logic (see Integration).
7. Optional UI test command: `/testdeath` (remove in production if you want).

> `web/dist` is already built. You only need `npm run build` inside `web/` if you edit the React UI.

---

## ⚙️ Configuration (`config.lua`)

| Option | Default | Description |
|--------|---------|-------------|
| `Config.Framework` | `'auto'` | `'auto'` \| `'qb'` \| `'qbx'` \| `'esx'` \| `'standalone'` |
| `Config.BleedOutTime` | `300` | Countdown seconds |
| `Config.NuiFocus` | `true` | Mouse + keyboard focus on NUI while dead |
| `Config.EnableMinigame` | `true` | Show minigame button |
| `Config.EnableFreecam` | `true` | Allow free camera (**F**) |
| `Config.EnableDispatch` | `true` | Allow dispatch (**G**) |
| `Config.EnableRespawn` | `true` | Allow give up (**E**) after timer |
| `Config.DispatchCooldown` | `30000` | ms between dispatch presses |
| `Config.RespawnCoords` | hospital `vector4` | Standalone revive teleport |
| `Config.Locale` | English table | Default UI strings |

### Framework behaviour

With `'auto'`, detection order is: `qbx_core` → `qb-core` → `es_extended` → `standalone`.

| Framework | Dispatch (G) | Respawn (E) |
|-----------|--------------|-------------|
| `qb` / `qbx` | Server dispatch + `hospital:server:ambulanceAlert` | `hospital:client:RespawnAtHospital` |
| `esx` | Server dispatch event | `emydigital-deathscreen:server:respawn` (hook your ambulance) |
| `standalone` | Server dispatch event | Local revive + teleport to `RespawnCoords` |

---

## 🔌 Integrating with your ambulance job

### Open on death

```lua
-- Server
TriggerClientEvent('emydigital-deathscreen:client:open', src, {
    timer = 300,
    playerName = GetPlayerName(src) or 'Unknown',
})

-- Client
exports['emydigital-deathscreen']:OpenDeathScreen({
    timer = 300,
    playerName = GetPlayerName(PlayerId()) or 'Unknown',
})
```

### Close on revive

```lua
-- Server
TriggerClientEvent('emydigital-deathscreen:client:close', src)

-- Client
exports['emydigital-deathscreen']:CloseDeathScreen()
```

### Sync timer (optional)

```lua
TriggerClientEvent('emydigital-deathscreen:client:updateTimer', src, 120)
```

Replace your old death DrawText / NUI with these calls. Keep your EMS revive, bills, and inventory rules in your ambulance resource.

---

## 📦 Client exports

| Export | Description |
|--------|-------------|
| `OpenDeathScreen(payload?)` | Opens the death UI |
| `CloseDeathScreen()` | Closes UI + stops freecam |
| `IsDeathScreenOpen()` | Returns `true` if open |

```lua
exports['emydigital-deathscreen']:OpenDeathScreen({ timer = 300, playerName = 'John Doe' })
exports['emydigital-deathscreen']:CloseDeathScreen()
print(exports['emydigital-deathscreen']:IsDeathScreenOpen())
```

---

## 📡 Events

### Client events

| Event | Description |
|-------|-------------|
| `emydigital-deathscreen:client:open` | Open UI (payload table) |
| `emydigital-deathscreen:client:close` | Close UI |
| `emydigital-deathscreen:client:updateTimer` | Sync remaining seconds |
| `emydigital-deathscreen:client:freecam` | Toggle freecam |

### Server events (hook these)

| Event | When |
|-------|------|
| `emydigital-deathscreen:server:dispatch` | Player pressed **G** |
| `emydigital-deathscreen:server:respawn` | Give up / standalone respawn path |
| `emydigital-deathscreen:server:timerExpired` | Countdown reached `0` |

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| **F** | Toggle free camera |
| **G** | Send dispatch / EMS signal |
| **E** | Give up — **locked until timer is 00:00** |
| **WASD** | Move freecam |
| **Mouse** | Look (freecam) |
| **Shift** | Faster freecam |
| **Space / Ctrl** | Freecam up / down |
| **ESC** | Close minigame overlay |

---

## 📁 Folder structure

```text
emydigital-deathscreen/
├── fxmanifest.lua
├── config.lua
├── client.lua
├── server.lua
├── LICENSE
├── README.md
└── web/
    ├── dist/          # Built NUI (required at runtime)
    ├── public/        # Minigames + assets
    └── src/           # React source
```

---

## ⚡ Performance

| State | Expected |
|-------|----------|
| Alive (UI closed) | ~`0.00` |
| Dead (UI open) | `Wait(0)` control lock |
| Freecam | `Wait(0)` until exited |

---

## 🧑‍💻 Frontend development

```bash
cd web
npm install
npm run build
```

---

## 🛡️ License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).

---

## Credits

**Developed by ❤️ [EMY Digital](https://discord.gg/emydigital)**
