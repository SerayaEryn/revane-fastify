export interface RevaneResponse {
  redirect(status: number, url: string): void;
  redirect(url: string): void;
  status(status: number): RevaneResponse;
  getHeader(name: string): string | number | string[];
  setHeader(name: string, value: string): RevaneResponse;
}
