# Asset Pipeline

## Creature Sprites

BrainRogue uses a fixed logical creature sprite size of `96x96`.

Front sprite path:

```text
public/assets/sprites/creatures/{creatureId}.png
```

Back sprite path:

```text
public/assets/sprites/creatures/back/{creatureId}.png
```

The runtime keys are:

```text
creature:{creatureId}:front
creature:{creatureId}:back
```

Back sprites are optional. If a front or back sprite is missing, the game creates a procedural fallback texture and keeps running.

## Manifest

Every creature ID from `src/data/creatures.ts` is mapped in `src/systems/assets/CreatureSpriteManifest.ts`.

Use the manifest when tooling needs to list expected sprite files or validate asset coverage.

## Type Icons

Type icon textures are generated procedurally for now and use keys:

```text
type-icon:{type}
```

Future real icons should live under:

```text
public/assets/icons/types/{type}.png
```
