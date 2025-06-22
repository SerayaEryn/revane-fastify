import "reflect-metadata";
import { parse } from "acorn";
import {
  decoratorDrivenSym,
  errorHandlersSym,
  fallbackErrorHandlerSym,
  routesSym,
} from "./Symbols.js";
import { RevaneRequest } from "./RevaneRequest.js";
import { RevaneResponse } from "./RevaneFastify.js";
import { getMetadata, setMetadata } from "./revane-util/Metadata.js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function createMethodDecorator(method: string | string[]): Function {
  return function methodDecorator(url: string, options?: any) {
    return function decorate(
      target,
      propertyKey: string | ClassMethodDecoratorContext,
      _: PropertyDescriptor,
    ) {
      setMetadata(
        decoratorDrivenSym,
        true,
        target,
        propertyKey as ClassMethodDecoratorContext,
      );
      const routes = getMetadata(routesSym, target) ?? {};
      const handlerFunction = propertyKey;
      const key =
        typeof propertyKey === "string"
          ? propertyKey
          : (propertyKey as ClassMethodDecoratorContext).name;
      if (!routes[key]) {
        routes[key] = { method, url, options, handlerFunction };
      } else {
        routes[key].method = method;
        routes[key].url = url;
        routes[key].options = options;
        routes[key].handlerFunction = handlerFunction;
      }
      setMetadata(
        routesSym,
        routes,
        target,
        propertyKey as ClassMethodDecoratorContext,
      );
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function createRequestSubValueParameterDecorator(type: string): Function {
  return function parameterDecorator(
    maybeName: string | object,
    maybePropertyKey?: string | symbol,
    maybeParameterIndex?: number,
  ) {
    if (typeof maybeName === "string" || maybeName === undefined) {
      return function decorate(
        target: object,
        propertyKey: string | symbol,
        parameterIndex: number,
      ) {
        addParameterMetadata(
          target,
          maybeName as string,
          propertyKey,
          parameterIndex,
          type,
          false,
        );
      };
    } else {
      addParameterMetadata(
        maybeName,
        null,
        maybePropertyKey,
        maybeParameterIndex,
        type,
        false,
      );
    }
  };
}

function createRequestValueParameterDecorator(type: string) {
  return function (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    addParameterMetadata(target, type, propertyKey, parameterIndex, type, true);
  };
}

function addParameterMetadata(
  target: object,
  maybeName: string,
  propertyKey: string | symbol,
  parameterIndex: number,
  type: string,
  all: boolean,
): void {
  const routes = Reflect.getMetadata(routesSym, target) || {};
  const name = maybeName || getName(target, propertyKey, parameterIndex);
  if (!routes[propertyKey]) {
    routes[propertyKey] = { parameters: [] };
  }
  routes[propertyKey].parameters.unshift({ type, name, all });
  Reflect.defineMetadata(routesSym, routes, target);
}

function getName(
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number,
): string {
  let functionSource: string = target[propertyKey].toString();
  if (functionSource.startsWith("async")) {
    functionSource = `async function ${functionSource.substring(6)}`;
  } else {
    functionSource = `function ${functionSource}`;
  }
  const ast = parse(functionSource, { ecmaVersion: "latest" }) as any;
  return ast.body[0].params[parameterIndex].name;
}

function ErrorHandler(
  targetOrErrorCode: string | any,
  propertyKey?: string | ClassMethodDecoratorContext,
  _?: PropertyDescriptor,
) {
  if (typeof targetOrErrorCode === "string") {
    return function errorHandlerDecorator(
      target,
      propertyKey: string | ClassMethodDecoratorContext,
      _: PropertyDescriptor,
    ) {
      const key =
        typeof propertyKey === "string"
          ? propertyKey
          : (propertyKey as ClassMethodDecoratorContext).name;
      addErrorHandlerMetadata(
        target,
        key,
        targetOrErrorCode,
        propertyKey as ClassMethodDecoratorContext,
      );
      return typeof propertyKey == "string" ? undefined : target;
    };
  } else {
    const key =
      typeof propertyKey === "string"
        ? propertyKey
        : (propertyKey as ClassMethodDecoratorContext).name;
    addErrorHandlerMetadata(
      targetOrErrorCode,
      key,
      null,
      propertyKey as ClassMethodDecoratorContext,
    );
    return typeof propertyKey == "string" ? undefined : targetOrErrorCode;
  }
}

function addErrorHandlerMetadata(
  target: any,
  propertyKey: string | symbol,
  errorCode: string | null,
  context: ClassMethodDecoratorContext,
): void {
  if (errorCode == null) {
    const errorHandler = {
      handlerFunction: target[propertyKey],
      errorCode: "__NONE",
      handlerName: propertyKey,
    };
    setMetadata(fallbackErrorHandlerSym, errorHandler, target, context);
  } else {
    const errorHandlers = getMetadata(errorHandlersSym, target) || {};
    if (errorHandlers[propertyKey]) {
      errorHandlers[propertyKey].handlerFunction = target[propertyKey];
      errorHandlers[propertyKey].errorCode = errorCode;
      errorHandlers[propertyKey].handlerName = propertyKey;
    } else {
      errorHandlers[propertyKey] = {
        handlerFunction: target[propertyKey],
        errorCode,
        handlerName: propertyKey,
      };
    }
    setMetadata(errorHandlersSym, errorHandlers, target, context);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function ResponseStatus(statusCode: number): Function {
  return function responseStatusDecorator(
    target,
    propertyKey: string | ClassMethodDecoratorContext,
    _: PropertyDescriptor,
  ) {
    const errorHandlers = getMetadata(errorHandlersSym, target) ?? {};
    const key =
      typeof propertyKey === "string"
        ? propertyKey
        : (propertyKey as ClassMethodDecoratorContext).name;
    if (errorHandlers[key]) {
      errorHandlers[key].statusCode = statusCode;
    } else {
      errorHandlers[key] = { statusCode };
    }
    setMetadata(
      errorHandlersSym,
      errorHandlers,
      target,
      propertyKey as ClassMethodDecoratorContext,
    );
  };
}

export class ErrorHandlerDefinition {
  handlerFunction: (
    error: Error,
    request: RevaneRequest,
    response: RevaneResponse,
  ) => Promise<any>;
  errorCode: string;
  statusCode?: number;
  handlerName: string;
}

const Query = createRequestSubValueParameterDecorator("query");
const Param = createRequestSubValueParameterDecorator("params");
const Cookie = createRequestSubValueParameterDecorator("cookies");
const Header = createRequestSubValueParameterDecorator("headers");

export { Query, Param, Cookie, Header };

const Response = createRequestSubValueParameterDecorator("reply");
const Request = createRequestSubValueParameterDecorator("request");

export { Response, Request };

const Cookies = createRequestValueParameterDecorator("cookies");
const Params = createRequestValueParameterDecorator("params");
const QueryParameters = createRequestValueParameterDecorator("query");
const Body = createRequestValueParameterDecorator("body");
const Headers = createRequestValueParameterDecorator("headers");
const Log = createRequestValueParameterDecorator("log");

export { Cookies, Params, Headers, Log, QueryParameters, Body };

const Get = createMethodDecorator("GET");
const Post = createMethodDecorator("POST");
const Put = createMethodDecorator("PUT");
const Delete = createMethodDecorator("DELETE");
const Patch = createMethodDecorator("PATCH");
const Head = createMethodDecorator("HEAD");
const Options = createMethodDecorator("OPTIONS");
const All = createMethodDecorator([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "HEAD",
  "DELETE",
  "OPTIONS",
]);

export { Get, Post, Put, Delete, Patch, Head, Options, All };

export { ErrorHandler, ResponseStatus };
