export interface CreatureRenderMetadata {
  battleScaleMax?: number;
  battleYOffset?: number;
  previewYOffset?: number;
  shadowScale?: number;
}

export const creatureRenderMetadata: Record<string, CreatureRenderMetadata> = {};

export const getCreatureRenderMetadata = (creatureId: string): CreatureRenderMetadata =>
  creatureRenderMetadata[creatureId] ?? {};

