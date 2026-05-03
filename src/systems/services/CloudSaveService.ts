import { SaveData } from '../../types/save';

export interface CloudSaveService {
  uploadSave(save: SaveData): Promise<void>;
  downloadSave(): Promise<SaveData | null>;
}

export class LocalCloudSaveService implements CloudSaveService {
  async uploadSave(): Promise<void> {
    // TODO: Replace with backend save sync when accounts exist.
    return;
  }

  async downloadSave(): Promise<SaveData | null> {
    return null;
  }
}
