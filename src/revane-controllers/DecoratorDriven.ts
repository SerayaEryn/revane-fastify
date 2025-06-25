import {
  FastifyInstance,
  RouteOptions,
  FastifyPluginCallback,
  RouteHandlerMethod,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { ErrorHandlerDefinition } from "./Decorators.js";
import { RevaneFastifyResponse } from "../RevaneFastifyReponse.js";
import { RevaneFastifyRequest } from "../RevaneFastifyRequest.js";
import {
  decoratorDrivenSym,
  errorHandlersSym,
  fallbackErrorHandlerSym,
  routesSym,
} from "../Symbols.js";
import { Parameter, ParameterType } from "./Parameter.js";
import { ModelAttributeConverter } from "../revane-modelattribute/ModelAttributeProvider.js";
import { BeanAndMethod } from "../revane-modelattribute/BeanAndMethod.js";
import { modelAttributConvertersForParameters } from "../revane-modelattribute/ModelAttributSupplier.js";
import { Routes } from "./Route.js";
import { getMetadata } from "../revane-util/Metadata.js";

export function isDecoratorDriven(target): boolean {
  return getMetadata(decoratorDrivenSym, target) === true;
}

export function buildPlugin(
  target,
  modelAttributeBeans: Map<string, BeanAndMethod>,
): FastifyPluginCallback {
  const routes: Routes = getMetadata(routesSym, target);
  const errorHandler = buildErrorHandler(target);
  const allOptions = [];
  for (const routeName in routes) {
    const route: any = routes[routeName];
    const options: RouteOptions = route.options ?? {};
    options.url = route.url;
    options.method = route.method;
    if (!options.url || !options.method) {
      continue;
    }
    const { parameters, handlerFunction } = route;
    const boundHandler: RouteHandlerMethod =
      target[handlerFunction].bind(target);
    if (parameters) {
      options.handler = buildHandler(
        parameters || [],
        boundHandler,
        modelAttributConvertersForParameters(parameters, modelAttributeBeans),
      );
    } else {
      options.handler = boundHandler;
    }
    if (errorHandler != null) {
      options.errorHandler = errorHandler;
    }
    allOptions.push(options);
  }
  function plugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
    next,
  ): void {
    allOptions.forEach((it) => fastify.route(it));
    next();
  }
  return fastifyPlugin(plugin);
}

type ErrorHandler = (
  error: NodeJS.ErrnoException,
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

export function buildGlobalErrorHandler(
  controllerAdvices: any[],
): ErrorHandler | null {
  const controllerAdvicesWithHandler = controllerAdvices.filter(
    (controllerAdvice) => isErrorHandler(controllerAdvice),
  );
  if (controllerAdvicesWithHandler.length > 0) {
    return buildErrorHandler(controllerAdvicesWithHandler[0]);
  } else {
    return null;
  }
}

function isErrorHandler(controllerAdvice: any): unknown {
  return (
    getMetadata(errorHandlersSym, controllerAdvice) != null ||
    getMetadata(fallbackErrorHandlerSym, controllerAdvice) != null
  );
}

export function buildErrorHandler(target): ErrorHandler | null {
  const errorHandlers: Record<string, ErrorHandlerDefinition> =
    getMetadata(errorHandlersSym, target) || {};
  const fallbackErrorHandler: ErrorHandlerDefinition = getMetadata(
    fallbackErrorHandlerSym,
    target,
  );
  if (Object.keys(errorHandlers).length > 0 || fallbackErrorHandler != null) {
    return async function errorHander(
      error: NodeJS.ErrnoException,
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      for (const key of Object.keys(errorHandlers)) {
        const errorHandler = errorHandlers[key];
        if (errorHandler.errorCode === error.code) {
          reply.status(errorHandler.statusCode || 500);
          return errorHandler.handlerFunction.bind(target)(
            error,
            new RevaneFastifyRequest(request),
            new RevaneFastifyResponse(reply),
          );
        }
      }
      if (fallbackErrorHandler != null) {
        reply.status(
          fallbackErrorHandler.statusCode ||
            errorHandlers[fallbackErrorHandler.handlerName]?.statusCode ||
            500,
        );
        return fallbackErrorHandler.handlerFunction.bind(target)(
          error,
          new RevaneFastifyRequest(request),
          new RevaneFastifyResponse(reply),
        );
      }
      throw error;
    };
  }
  return null;
}

function buildHandler(
  parameters: Parameter[],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handler: Function,
  modelAttributeConverters: Map<string, ModelAttributeConverter>,
): RouteHandlerMethod {
  if (parameters.length === 0) {
    return async function route(
      _request: FastifyRequest,
      _reply: FastifyReply,
    ) {
      return await handler();
    };
  }
  if (
    parameters.length === 1 &&
    parameters[0].type === ParameterType.RESPONSE
  ) {
    return async function route(_request: FastifyRequest, reply: FastifyReply) {
      return await handler.apply(this, [new RevaneFastifyResponse(reply)]);
    };
  }
  if (parameters.length === 1 && parameters[0].type === ParameterType.REQUEST) {
    return async function route(request: FastifyRequest, _reply: FastifyReply) {
      return await handler.apply(this, [new RevaneFastifyRequest(request)]);
    };
  }
  return async function route(request: FastifyRequest, reply: FastifyReply) {
    const args = [];
    for (const parameter of parameters) {
      if (parameter.type === ParameterType.RESPONSE) {
        args.push(new RevaneFastifyResponse(reply));
      } else if (parameter.type === ParameterType.REQUEST) {
        args.push(new RevaneFastifyRequest(request));
      } else if (parameter.type === ParameterType.MODEL_ATTRIBUTE) {
        args.push(
          await modelAttributeConverters.get(parameter.name).convert(request),
        );
      } else {
        args.push(applyParameter(request, parameter));
      }
    }
    return await handler.apply(this, args);
  };
}

export function applyParameter(
  request: FastifyRequest,
  parameter: Parameter,
): any {
  if (parameter.all) {
    return request[parameter.type];
  } else {
    return request[parameter.type][parameter.name];
  }
}
