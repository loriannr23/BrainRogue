import Phaser from 'phaser';
import { UI_THEME } from '../ui/theme';

export const DEBUG_UI =
  new URLSearchParams(window.location.search).has('debugUi') ||
  window.localStorage.getItem('brainrogue.debugUi') === '1';

export const DEBUG_INPUT =
  new URLSearchParams(window.location.search).has('debugInput') ||
  window.localStorage.getItem('brainrogue.debugInput') === '1';

export interface DebugRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type UiInteractiveObject = Phaser.GameObjects.GameObject & {
  input?: Phaser.Types.Input.InteractiveObject | null;
  setInteractive: (hitArea?: unknown, callback?: Phaser.Types.Input.HitAreaCallback) => Phaser.GameObjects.GameObject;
  disableInteractive: () => Phaser.GameObjects.GameObject;
};

export const makeUiInteractive = <T extends UiInteractiveObject>(
  gameObject: T,
  bounds: Omit<DebugRect, 'x' | 'y'>,
): T => {
  const roundedWidth = Math.max(1, Math.round(bounds.width));
  const roundedHeight = Math.max(1, Math.round(bounds.height));
  if (gameObject.input) {
    gameObject.disableInteractive();
  }
  gameObject.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, roundedWidth, roundedHeight),
    Phaser.Geom.Rectangle.Contains,
  );
  return gameObject;
};

export const setContainerHitArea = (
  container: Phaser.GameObjects.Container,
  width: number,
  height: number,
): void => {
  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);
  container.setPosition(Math.round(container.x), Math.round(container.y));
  container.setSize(roundedWidth, roundedHeight);
  makeUiInteractive(container, { width: roundedWidth, height: roundedHeight });
};

export const addDebugHitbox = (scene: Phaser.Scene, rect: DebugRect, label?: string): void => {
  if (!DEBUG_UI) return;
  const rounded = roundRect(rect);

  const graphics = scene.add.graphics();
  graphics.lineStyle(2, UI_THEME.colors.accent, 0.9);
  graphics.strokeRect(rounded.x, rounded.y, rounded.width, rounded.height);
  graphics.setDepth(10000);

  if (label) {
    scene.add.text(rounded.x + 4, rounded.y + 4, label, {
      fontSize: '11px',
      color: UI_THEME.css.accent,
      fontFamily: 'monospace',
      backgroundColor: UI_THEME.css.bg,
    }).setDepth(10001);
  }
};

export const createInteractiveZone = (
  scene: Phaser.Scene,
  rect: DebugRect,
  label?: string,
): Phaser.GameObjects.Zone => {
  const rounded = roundRect(rect);
  const zone = scene.add.zone(rounded.x, rounded.y, rounded.width, rounded.height)
    .setOrigin(0, 0);
  makeUiInteractive(zone, { width: rounded.width, height: rounded.height });
  zone.input!.cursor = 'pointer';
  addDebugHitbox(scene, rounded, label);
  return zone;
};

const roundRect = (rect: DebugRect): DebugRect => ({
  x: Math.round(rect.x),
  y: Math.round(rect.y),
  width: Math.round(rect.width),
  height: Math.round(rect.height),
});

export const installPointerDebug = (scene: Phaser.Scene): void => {
  let enabled = DEBUG_UI;
  let hovered: Phaser.GameObjects.GameObject | undefined;
  let text: Phaser.GameObjects.Text | undefined;
  let boundsGraphics: Phaser.GameObjects.Graphics | undefined;

  const createOverlay = (): void => {
    if (text) return;
    text = scene.add.text(8, 8, '', {
    fontSize: '14px',
    color: UI_THEME.css.accent,
    fontFamily: 'monospace',
    backgroundColor: UI_THEME.css.bg,
    padding: { x: 6, y: 4 },
    }).setDepth(10002).setScrollFactor(0);
    boundsGraphics = scene.add.graphics().setDepth(10001).setScrollFactor(0);
  };

  const destroyOverlay = (): void => {
    text?.destroy();
    boundsGraphics?.destroy();
    text = undefined;
    boundsGraphics = undefined;
  };

  if (enabled) createOverlay();

  scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (!enabled) return;
    createOverlay();
    const event = pointer.event as PointerEvent | undefined;
    const hoveredBounds = getObjectBounds(hovered);
    text?.setText([
      `game ${Math.round(pointer.x)}, ${Math.round(pointer.y)}`,
      `client ${Math.round(event?.clientX ?? 0)}, ${Math.round(event?.clientY ?? 0)}`,
      `screen ${Math.round(event?.screenX ?? 0)}, ${Math.round(event?.screenY ?? 0)}`,
      `canvas ${Math.round(scene.scale.displaySize.width)}x${Math.round(scene.scale.displaySize.height)}`,
      `base ${scene.scale.gameSize.width}x${scene.scale.gameSize.height}`,
      hoveredBounds ? `hover ${hoveredBounds.x},${hoveredBounds.y} ${hoveredBounds.width}x${hoveredBounds.height}` : 'hover none',
    ].join('\n'));

    boundsGraphics?.clear();
    if (hoveredBounds) {
      boundsGraphics?.lineStyle(2, UI_THEME.colors.accent, 1);
      boundsGraphics?.strokeRect(hoveredBounds.x, hoveredBounds.y, hoveredBounds.width, hoveredBounds.height);
    }
  });

  scene.input.on('gameobjectover', (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject) => {
    hovered = object;
  });
  scene.input.on('gameobjectout', (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject) => {
    if (hovered === object) hovered = undefined;
  });

  scene.input.keyboard?.on('keydown-F3', () => {
    enabled = !enabled;
    if (enabled) createOverlay();
    else destroyOverlay();
  });

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    destroyOverlay();
  });
};

export interface InputDebugState {
  phase?: string;
  inputLocked?: boolean;
  turn?: number | string;
}

export const installInputDebug = (
  scene: Phaser.Scene,
  getState: () => InputDebugState,
): void => {
  if (!DEBUG_INPUT) return;

  let lastPointerDown = 'none';
  const text = scene.add.text(8, 42, '', {
    fontSize: '13px',
    color: UI_THEME.css.accent,
    fontFamily: 'monospace',
    backgroundColor: UI_THEME.css.bg,
    padding: { x: 6, y: 4 },
  }).setDepth(10003).setScrollFactor(0);

  const pointerHandler = (pointer: Phaser.Input.Pointer) => {
    lastPointerDown = `${Math.round(pointer.x)}, ${Math.round(pointer.y)}`;
  };
  scene.input.on('pointerdown', pointerHandler);

  const timer = scene.time.addEvent({
    delay: 150,
    loop: true,
    callback: () => {
      const state = getState();
      text.setText([
        `scene ${scene.scene.key}`,
        `phase ${state.phase ?? 'n/a'}`,
        `locked ${state.inputLocked ?? false}`,
        `turn ${state.turn ?? 'n/a'}`,
        `interactive ${countInteractiveObjects(scene)}`,
        `lastDown ${lastPointerDown}`,
      ].join('\n'));
    },
  });

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointerdown', pointerHandler);
    timer.remove(false);
    text.destroy();
  });
};

const countInteractiveObjects = (scene: Phaser.Scene): number => {
  let count = 0;
  scene.children.each((child) => {
    const gameObject = child as Phaser.GameObjects.GameObject & { input?: unknown };
    if (gameObject.input) count += 1;
  });
  return count;
};

const getObjectBounds = (object?: Phaser.GameObjects.GameObject): DebugRect | undefined => {
  if (!object) return undefined;
  const withBounds = object as Phaser.GameObjects.GameObject & {
    getBounds?: () => Phaser.Geom.Rectangle;
    x?: number;
    y?: number;
    input?: Phaser.Types.Input.InteractiveObject;
  };
  if (withBounds.getBounds) {
    const bounds = withBounds.getBounds();
    return roundRect({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
  }
  const hitArea = withBounds.input?.hitArea as Phaser.Geom.Rectangle | undefined;
  if (typeof withBounds.x === 'number' && typeof withBounds.y === 'number' && hitArea) {
    return roundRect({ x: withBounds.x + hitArea.x, y: withBounds.y + hitArea.y, width: hitArea.width, height: hitArea.height });
  }
  return undefined;
};
