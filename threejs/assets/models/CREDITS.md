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
