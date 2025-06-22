export interface Parameter {
  type: ParameterType;
  name: string;
  all: boolean;
}

export enum ParameterType {
  RESPONSE = "reply",
  REQUEST = "request",
  MODEL_ATTRIBUTE = "model-attribute",
  COOKIES = "cookies",
  PARAMS = "params",
  QUERY = "query",
  LOG = "log",
  HEADERS = "headers",
  BODY = "body",
}
