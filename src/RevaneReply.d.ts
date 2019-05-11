export interface RevaneReply {
  redirect (status: number, url: string): void
  redirect (url: string): void
  status (status: number): RevaneReply
  getHeader (name: string): string
  setHeader (name: string, value: string): void
}