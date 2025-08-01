import merge from "lodash.merge";

import { resolvers as authResolvers } from "./auth.js";
import { resolvers as customResolvers } from "./custom.js";
import { resolvers as productResolvers } from "./product.js";
import { resolvers as userResolvers } from "./user.js";
import { resolvers as catalogueResolvers } from "./catalogue.js";
import { resolvers as postResolvers } from "./post.js";
import { resolvers as tagResolvers } from "./tag.js";

export const resolvers = merge(
  customResolvers,
  // authResolvers,
  // productResolvers,
  // userResolvers,
  catalogueResolvers,
  postResolvers,
  tagResolvers,
);
