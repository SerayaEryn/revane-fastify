import { FastifyReply } from "fastify";
import { RevaneResponse } from "./RevaneResponse.js";
import { HttpHeader } from "fastify/types/utils.js";
import { CookieSerializeOptions } from "@fastify/cookie";

export class RevaneFastifyResponse implements RevaneResponse {
  constructor(private readonly reply: FastifyReply) {}

  redirect(status: any, url?: any): void {
    this.reply.redirect(status, url);
  }

  status(statusCode: number): RevaneResponse {
    this.reply.status(statusCode);
    return this;
  }

  getHeader(name: string): string | number | string[] {
    return this.reply.getHeader(name);
  }

  setHeader(name: string, value: any): RevaneResponse {
    this.reply.header(name, value);
    return this;
  }

  setHeaders(
    values: Partial<Record<HttpHeader, number | string | string[] | undefined>>,
  ): RevaneResponse {
    this.reply.headers(values);
    return this;
  }

  get statusCode(): number {
    return this.reply.statusCode;
  }

  removeHeader(name: string) {
    this.reply.removeHeader(name);
  }

  hasHeader(name: string): boolean {
    return this.reply.hasHeader(name);
  }

  get headers(): Record<HttpHeader, number | string | string[] | undefined> {
    return this.reply.getHeaders();
  }

  setCookie(
    name: string,
    value: string,
    options?: CookieSerializeOptions,
  ): RevaneResponse {
    this.reply.setCookie(name, value, options);
    return this;
  }

  writeEarlyHints(
    hints: Record<string, string | string[]>,
    callback?: () => void,
  ): void {
    this.reply.writeEarlyHints(hints, callback);
  }
}
