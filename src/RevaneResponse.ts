import { CookieSerializeOptions } from "@fastify/cookie";
import { HttpHeader } from "fastify/types/utils";

export interface RevaneResponse {
  redirect(status: number, url: string): void;
  redirect(url: string): void;
  status(status: number): RevaneResponse;
  getHeader(name: string): string | number | string[];
  setHeader(name: string, value: string): RevaneResponse;
  get headers(): Record<HttpHeader, number | string | string[] | undefined>;
  setCookie(
    name: string,
    value: string,
    options?: CookieSerializeOptions,
  ): RevaneResponse;
  writeEarlyHints(
    hints: Record<string, string | string[]>,
    callback?: () => void,
  ): void;
  get statusCode(): number;
}
