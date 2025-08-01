import { createServer } from "http";
import { typeDefs } from "./graphql/type-defs/index.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { enhanceContext, GraphQLContext } from "./lib/context.js";
import { createYoga, createSchema } from "graphql-yoga";
import { cookiePlugin } from "./utils/cookiePlugin.js";
import { useCSRFPrevention } from "@graphql-yoga/plugin-csrf-prevention";
import { v4 as uuidv4 } from "uuid";
import { cacheTemplates } from "./services/email/templates.js";
import { nodeEnv, appBaseUrl } from "./lib/config.js";

const IS_DEV = nodeEnv === "development";
//all templates need to be cached before app starts
cacheTemplates();

const defaultCsrfToken = uuidv4();

function main() {
  const yoga = createYoga<GraphQLContext>({
    cors: {
      // origin below is the url of the front-end app
      // for CORS requests
      origin: IS_DEV ? "http://localhost:3000" : appBaseUrl,
      credentials: true,
      allowedHeaders: ["content-type", "x-csrf-token", "cookie"],
      methods: ["GET", "POST", "OPTIONS"],
    },
    // graphqlEndpoint: Specify pathname to graphql uri
    // protocol://hostname:port/pathname
    graphiql: IS_DEV,
    graphqlEndpoint: "/graphql",
    schema: createSchema<GraphQLContext>({
      typeDefs,
      resolvers,
    }),
    context: enhanceContext,
    plugins: [
      cookiePlugin(),
      useCSRFPrevention({ requestHeaders: ["x-csrf-token"] }),
    ],
  });

  const server = createServer(yoga);
  server.listen(4000, () =>
    console.info("🚀 Server running on http://localhost:4000/graphql"),
  );
}

main();
