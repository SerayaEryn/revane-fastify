import { FastifyInstance, Plugin, RouteOptions, DefaultHeaders, DefaultBody, DefaultParams, DefaultQuery, RequestHandler, FastifyRequest, FastifyReply } from 'fastify'
import * as fastifyPlugin from 'fastify-plugin'
import { Server, IncomingMessage, ServerResponse } from 'http'

export type PluginOptions = {}

export type FastifyRouteOptions = RouteOptions<Server, IncomingMessage, ServerResponse, DefaultQuery, DefaultParams, DefaultHeaders, DefaultBody>
export type FastifyRequestHandler = RequestHandler<IncomingMessage, ServerResponse, DefaultQuery, DefaultParams, DefaultHeaders, DefaultBody>
export type Request = FastifyRequest<IncomingMessage, DefaultQuery, DefaultParams, DefaultHeaders, DefaultBody>
export type Reply = FastifyReply<ServerResponse>
export type FastifyPlugin = Plugin<Server, IncomingMessage, ServerResponse, PluginOptions>