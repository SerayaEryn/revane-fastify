import "reflect-metadata";
import {
  decoratorDrivenSym,
  errorHandlersSym,
  fallbackErrorHandlerSym,
  routesSym,
} from "../Symbols.js";
import { RevaneRequest } from "../RevaneRequest.js";
import { RevaneResponse } from "../RevaneFastify.js";
import { getMetadata, setMetadata } from "../revane-util/Metadata.js";
import { parameterName } from "../revane-util/ParameterName.js";
import { Routes } from "./Route.js";
import { ParameterType } from "./Parameter.js";

function createMethodDecorator(method: string | string[]): ParameterDecorator {
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

function createRequestSubValueParameterDecorator(
  type: ParameterType,
): ParameterDecorator {
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

function createRequestValueParameterDecorator(type: ParameterType): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    addParameterMetadata(target, type, propertyKey, parameterIndex, type, true);
  };
}

export function addParameterMetadata(
  target: object,
  maybeName: string,
  propertyKey: string | symbol,
  parameterIndex: number,
  type: ParameterType,
  all: boolean,
): void {
  const routes: Routes = Reflect.getMetadata(routesSym, target) ?? {};
  const name = maybeName ?? parameterName(target, propertyKey, parameterIndex);
  if (!routes[propertyKey]) {
    routes[propertyKey] = { parameters: [] };
  }
  routes[propertyKey].parameters.unshift({ type, name, all });
  Reflect.defineMetadata(routesSym, routes, target);
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

const Query = createRequestSubValueParameterDecorator(ParameterType.QUERY);
const Param = createRequestSubValueParameterDecorator(ParameterType.PARAMS);
const Cookie = createRequestSubValueParameterDecorator(ParameterType.COOKIES);
const Header = createRequestSubValueParameterDecorator(ParameterType.HEADERS);

export { Query, Param, Cookie, Header };

const Response = createRequestSubValueParameterDecorator(
  ParameterType.RESPONSE,
);
const Request = createRequestSubValueParameterDecorator(ParameterType.REQUEST);

export { Response, Request };

const Cookies = createRequestValueParameterDecorator(ParameterType.COOKIES);
const Params = createRequestValueParameterDecorator(ParameterType.PARAMS);
const QueryParameters = createRequestValueParameterDecorator(
  ParameterType.QUERY,
);
const Body = createRequestValueParameterDecorator(ParameterType.BODY);
const Headers = createRequestValueParameterDecorator(ParameterType.HEADERS);
const Log = createRequestValueParameterDecorator(ParameterType.LOG);

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
