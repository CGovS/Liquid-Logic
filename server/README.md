# Liquid Logic v6.0 — LAN Buzzer Server

Turns phones into buzzers over your local WiFi. The host opens the game on a TV/laptop;
players scan a QR code and buzz in from their phones. No internet required — everything
stays on your local network.

When this server is **not** running, the game still works as a normal static site
(keyboard buzzers + moderated mode) — the phone-buzzer toggle simply stays disabled.

## Requirements

- **Node.js 18+** — check with `node --version`. Install from <https://nodejs.org> if needed.
- Host computer and all phones on the **same WiFi network**.

## Run it

```bash
cd "server"
npm install        # installs ws (+ optional qrcode for the on-screen QR)
npm start
```

You'll see output like:

```
  HOST (open on the TV / main screen):
    http://192.168.1.42:8090/

  PLAYERS (open on phones, same WiFi):
    http://192.168.1.42:8090/buzzer
```

1. On the **host** screen, open the HOST url.
2. On the landing page, flip on **Live Phone Buzzers** — a QR code + join link appear.
3. **Players** scan the QR (or type the buzzer URL), pick their team, and buzz.
4. Play as normal. First valid buzz wins; early buzzers get the 2-second freeze; phones
   show frozen / locked / "you're up" states in real time.

## How it works (short version)

- `server.js` serves the game files in `../v6.0/` and runs a WebSocket relay at `/ws`.
- The **host** is authoritative: phones only send `buzz`; the host engine decides validity
  and broadcasts state back to every phone.
- The server is otherwise a dumb relay — one server = one game room on your LAN.

## Notes / troubleshooting

- **No QR on screen?** Install the optional dep: `npm install qrcode`. Without it, the
  join link still shows as text.
- **Phones can't connect?** Make sure they're on the same WiFi (not guest network / cellular),
  and that your firewall allows incoming connections on the port.
- **Change the port:** `PORT=9000 npm start`.
- **Different locations (not same WiFi):** out of scope for this LAN server. See
  `../docs/UNIVERSE_ROADMAP.md` §5 for the remote-play upgrade path.
