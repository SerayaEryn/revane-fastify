export interface RevaneFastifyContext {
  hasById(id: string): Promise<boolean>;
  getByComponentType(type: string): Promise<any[]>;
  getById(id: string): Promise<any>;
  getByMarker(marker: string | symbol): Promise<any[]>;
}
