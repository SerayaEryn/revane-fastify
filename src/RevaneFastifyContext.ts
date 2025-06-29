export interface RevaneFastifyContext {
  hasById(id: string): Promise<boolean>;
  getByComponentType(type: string): Promise<any[]>;
  getById(id: string): Promise<any>;
  getByMetadata(marker: string | symbol): Promise<any[]>;
}
