import { typeDefs as commonTypeDefs } from "./common.js";
// import { typeDefs as authTypeDefs } from "./auth.js";
// import { typeDefs as productTypeDefs } from "./product.js";
// import { typeDefs as userTypeDefs } from "./user.js";
// import { typeDefs as cognitoTypeDefs } from "./cognito.js";
import { typeDefs as catalogueTypeDefs } from "./catalogue.js";
import { typeDefs as postTypeDefs } from "./post.js";
import { typeDefs as tagTypeDefs } from "./tag.js";

const typeDefs = [
  commonTypeDefs,
  // authTypeDefs,
  // productTypeDefs,
  // userTypeDefs,
  // cognitoTypeDefs,
  catalogueTypeDefs,
  postTypeDefs,
  tagTypeDefs,
];

export { typeDefs };
