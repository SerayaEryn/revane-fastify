import { FastifyRequest } from "fastify";
import { IncomingHttpHeaders } from "node:http";
import { RevaneRequest } from "./RevaneRequest.js";

export class RevaneFastifyRequest implements RevaneRequest {
  constructor(private readonly request: FastifyRequest) {}

  public url(): string {
    return this.request.url;
  }

  public get originalUrl(): string {
    return this.request.originalUrl;
  }

  public cookies(): Record<string, string> {
    return this.request.cookies;
  }

  public headers(): IncomingHttpHeaders {
    return this.request.headers;
  }

  public query(): unknown {
    return this.request.query;
  }

  public params(): unknown {
    return this.request.params;
  }

  public protocol(): string {
    return this.request.protocol;
  }

  public method(): string {
    return this.request.method;
  }

  public hostname(): string {
    return this.request.hostname;
  }

  public ip(): string {
    return this.request.ip;
  }

  public get id(): string {
    return this.request.id;
  }

  public get ips(): string[] {
    return this.request.ips;
  }

  public get host(): string {
    return this.request.host;
  }

  public get port(): number {
    return this.request.port;
  }
}
