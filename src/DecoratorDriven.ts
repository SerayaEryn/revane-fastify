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
import { RevaneFastifyResponse } from "./RevaneFastifyReponse.js";
import { RevaneFastifyRequest } from "./RevaneFastifyRequest.js";
import {
  decoratorDrivenSym,
  errorHandlersSym,
  fallbackErrorHandlerSym,
  routesSym,
} from "./Symbols.js";
import { getMetadata } from "./revane-util/Metadata.js";
import { Parameter } from "./Parameter.js";
import { ModelAttributeProvider } from "./revane-modelattribute/ModelAttributeProvider.js";
import { BeanAndMethod } from "./revane-modelattribute/BeanAndMethod.js";

export function isDecoratorDriven(target): boolean {
  return Reflect.getMetadata(decoratorDrivenSym, target) === true;
}

export function extractModelAttributProviders(
  target,
  sourceMethodName: string,
  modelAttributeBeans: Map<string, BeanAndMethod>,
): Map<string, ModelAttributeProvider> {
  const routes: any[] | null = getMetadata(routesSym, target);

  if (routes == null) {
    return new Map();
  }
  const routeName = Object.keys(routes).filter(
    (key) => routes[key].handlerFunction === sourceMethodName,
  )[0];
  if (routeName == null) {
    return new Map();
  }
  const modelAttribteProviders = new Map<string, ModelAttributeProvider>();

  Array.from(routes[routeName].parameters)
    .filter((parameter: Parameter) => parameter.type === "model-attribute")
    .forEach((parameter: Parameter) => {
      const bean = modelAttributeBeans.get(parameter.name).bean;
      const targetMethodName = modelAttributeBeans.get(parameter.name).method;

      const routes = Reflect.getMetadata(routesSym, bean);
      modelAttribteProviders.set(
        parameter.name,
        new ModelAttributeProvider(
          routes[targetMethodName].parameters as Parameter[],
          bean[targetMethodName].bind(bean),
        ),
      );
    });
  return modelAttribteProviders;
}

export function buildPlugin(
  target,
  modelAttributeBeans: Map<string, BeanAndMethod>,
): FastifyPluginCallback {
  const routes = Reflect.getMetadata(routesSym, target);
  const errorHandler = buildErrorHandler(target);
  function plugin(
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
    next,
  ): void {
    for (const key in routes) {
      const route: any = routes[key];
      const options: RouteOptions = route.options || {};
      options.url = route.url;
      options.method = route.method;
      if (!options.url || !options.method) {
        continue;
      }
      const handlerFunction = route.handlerFunction;
      const boundHandler = target[handlerFunction].bind(target);
      if (route.parameters) {
        options.handler = buildHandler(
          route.parameters || [],
          boundHandler,
          extractModelAttributProviders(
            target,
            handlerFunction,
            modelAttributeBeans,
          ),
        );
      } else {
        options.handler = boundHandler as RouteHandlerMethod;
      }
      if (errorHandler != null) {
        options.errorHandler = errorHandler;
      }
      fastify.route(options);
    }
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
    Reflect.getMetadata(errorHandlersSym, controllerAdvice) != null ||
    Reflect.getMetadata(fallbackErrorHandlerSym, controllerAdvice) != null
  );
}

export function buildErrorHandler(target): ErrorHandler | null {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  const errorHandlers: { [cookieName: string]: ErrorHandlerDefinition } =
    Reflect.getMetadata(errorHandlersSym, target) || {};
  const fallbackErrorHandler: ErrorHandlerDefinition = Reflect.getMetadata(
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
  modelAttribteProviders: Map<string, ModelAttributeProvider>,
): RouteHandlerMethod {
  if (parameters.length === 0) {
    return async function route(
      _request: FastifyRequest,
      _reply: FastifyReply,
    ) {
      return await handler();
    };
  }
  if (parameters.length === 1 && parameters[0].type === "reply") {
    return async function route(_request: FastifyRequest, reply: FastifyReply) {
      return await handler.apply(this, [new RevaneFastifyResponse(reply)]);
    };
  }
  if (parameters.length === 1 && parameters[0].type === "request") {
    return async function route(request: FastifyRequest, _reply: FastifyReply) {
      return await handler.apply(this, [new RevaneFastifyRequest(request)]);
    };
  }
  return async function route(request: FastifyRequest, reply: FastifyReply) {
    const args = [];
    for (const parameter of parameters) {
      if (parameter.type === "reply") {
        args.push(new RevaneFastifyResponse(reply));
      } else if (parameter.type === "request") {
        args.push(new RevaneFastifyRequest(request));
      } else if (parameter.type === "model-attribute") {
        args.push(
          await valueFromModelAttributeProdider(
            request,
            parameter,
            modelAttribteProviders,
          ),
        );
      } else {
        if (parameter.all) {
          args.push(request[parameter.type]);
        } else {
          args.push(request[parameter.type][parameter.name]);
        }
      }
    }
    return await handler.apply(this, args);
  };

  async function valueFromModelAttributeProdider(
    request: FastifyRequest,
    parameter: Parameter,
    modelAttribteProviders: Map<string, ModelAttributeProvider>,
  ) {
    const modelAttributeArgs = [];
    for (const modelAttribteParameter of modelAttribteProviders.get(
      parameter.name,
    ).parameters) {
      if (modelAttribteParameter.all) {
        modelAttributeArgs.push(request[modelAttribteParameter.type]);
      } else {
        modelAttributeArgs.push(
          request[modelAttribteParameter.type][modelAttribteParameter.name],
        );
      }
    }
    return await modelAttribteProviders
      .get(parameter.name)
      .provider(...modelAttributeArgs);
  }
}
