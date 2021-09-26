export interface RevaneFastifyContext {
  hasById (id: string): boolean
  getByComponentType (type: string): any[]
  getById (id: string): any
}
