import { IncomingHttpHeaders } from "node:http";

export interface RevaneRequest {
  url(): string;
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  cookies(): { [cookieName: string]: string };
  headers(): IncomingHttpHeaders;
  query(): unknown;
  params(): unknown;
  protocol(): string;
  method(): string;
  hostname(): string;
  ip(): string;
  get id(): string;
  get ips(): string[];
  get host(): string;
  get port(): number;
  get originalUrl(): string;
}
