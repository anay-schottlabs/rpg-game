# Model credits

All packs below are by [Kenney](https://kenney.nl), licensed CC0 1.0 Universal
(public domain — no attribution required, listed here for reference only).

| Folder | Pack | Models | Source |
|---|---|---|---|
| `nature-kit/` | Nature Kit | 330 (full pack) | https://kenney.nl/assets/nature-kit |
| `fantasy-town-kit/` | Fantasy Town Kit | 167 (full pack) | https://kenney.nl/assets/fantasy-town-kit |
| `castle-kit/` | Castle Kit | 76 (full pack) | https://kenney.nl/assets/castle-kit |
| `graveyard-kit/` | Graveyard Kit | 91 (full pack, includes rigged/animated characters) | https://kenney.nl/assets/graveyard-kit |
| `survival-kit/` | Survival Kit | 38 (cherry-picked — wood/canvas/stone props only; skipped fence/campfire/tent/tree/rock items that duplicate Nature Kit, and the corrugated-metal shelter pieces, which read industrial rather than fantasy) | https://kenney.nl/assets/survival-kit |

Skipped entirely: Mini Forest Kit (self-contained archer-outpost diorama, not a
nature scatter set) and Pirate Kit (ship/ocean theme, off-brief for this
world).

`nature-kit/` models are flat-shaded (no texture, just per-part solid color).
The other four packs share a `Textures/colormap.png` per folder — each
`.glb`'s material references it via a relative path (`Textures/colormap.png`),
so keep the `.glb` files and their `Textures/` subfolder together.

## Dungeon/interior kit

By [Kay Lousberg](https://kaylousberg.itch.io/) (same artist as the character
packs below), CC0, pulled from the GitHub mirror.

| Folder | Pack | Models | Source |
|---|---|---|---|
| `dungeon-pack/` | KayKit Dungeon Remastered | 203 (full free tier) | https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0 (same pack as https://kaylousberg.itch.io/kaykit-dungeon-pack) |

Modular walls (straight, corner, T-split, crossing, windowed, arched, gated,
broken/cracked, scaffold), floor tiles (wood/stone/dirt/grate, several
sizes), stairs, pillars/columns, and interior props (tables, chairs, beds,
shelves, chests, barrels, banners, torches, candles) — everything needed to
build the castle's interior rooms and hallways.

## Trade-goods / resource props

| Folder | Pack | Models | Source |
|---|---|---|---|
| `resource-bits/` | KayKit Resource Bits | 76 (full free tier) | https://kaylousberg.itch.io/resource-bits |

Stackable wood/stone/textile/ore-bar/nugget props, for dressing a market or
storage area — ships as `.gltf` + `.bin` pairs sharing one
`resource_bits_texture.png` in the same folder (kept alongside, same
relative-path convention as the Kenney kits above).
