import Jwt from "jsonwebtoken";
import { jwtSecret } from "./config.js";
import { isCookieExpired } from "../utils/index.js";
import dataApi from "../dataApi/api.js";
import { User } from "../typings/user.js";
import { YogaInitialContext } from "graphql-yoga";
import { CustomRequest } from "../utils/cookiePlugin.js";

export interface GraphQLContext extends YogaInitialContext {
  user?: User;
  request: Request;
  dataApi: typeof dataApi;
  refreshToken: string | undefined;
}

export async function enhanceContext(
  params: YogaInitialContext,
): Promise<GraphQLContext> {
  const { request } = params;
  const { cookies } = <CustomRequest>request;
  //TODO: below line was added to bypass cors error on
  // any client making a request.
  //specify a whitelist of ip addresses to make secure

  // res.set('access-control-allow-origin', req.headers.origin);

  const defaultContext: GraphQLContext = {
    ...params,
    user: {} as User,
    request,
    dataApi,
    refreshToken: undefined,
  };

  try {
    // const customHeader = request.headers.get('x-csrf-token');
    const accessCookie = cookies.inbound.get("access_token");
    const refreshToken = cookies.inbound.get("refresh_token");

    console.log("🆕 👶🏼 refresh-token", refreshToken);
    console.log("👮‍♀️🫸 access-token", accessCookie);

    // const bypassUser: {
    // 	id: 1;
    // 	first_name: 'Nosh';
    // 	last_name: 'Ghazanfar';
    // 	email: 'nosherwan@gmail.com';
    // };

    if (!accessCookie && refreshToken) {
      return {
        ...defaultContext,
        refreshToken,
      };
    }

    if (!refreshToken) {
      return defaultContext;
    }

    const accessToken = JSON.parse(accessCookie);

    if (accessToken.expires_on && isCookieExpired(+accessToken.expires_on)) {
      return defaultContext;
    }

    const decodedToken = Jwt.verify(accessToken.token, jwtSecret);

    if (typeof decodedToken !== "string") {
      return {
        ...params,
        user: {
          ...(decodedToken?.user ?? {}),
          isExpired: isCookieExpired(+accessToken.expires_on),
        } as User,
        request,
        dataApi,
        refreshToken,
      };
    }

    return defaultContext;

    // TODO: For future;
    // Validate header for access token in case of mobile apps;
    // const accessToken = headers?.authorization?.split?.(' ')?.[1] ?? '';
    // const clientId = (headers.authorization && headers.client_id) || '';
    // if (accessToken && clientId) fetch user info; populate & add to context
  } catch (error) {
    console.error(error);
    return defaultContext;
  }
}
