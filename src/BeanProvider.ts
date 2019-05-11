export interface BeanProvider {
  get (id: string): any
  has (id: string): boolean
  getByType (type: string): any
}
