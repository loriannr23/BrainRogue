import { SaveData } from '../../types/save';

export interface SaveService {
  load(): SaveData;
  save(data: SaveData): void;
  clear(): void;
}
