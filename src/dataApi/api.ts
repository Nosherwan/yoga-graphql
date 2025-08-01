import common from "./common.js";
import { createUser } from "./user.js";
import { createCatalogue } from "./catalogue.js";
import { createPost } from "./post.js";
import { createTag } from "./tag.js";

//all data CRUD modules will be added to the default
//object below and passed on.
export default {
  user: createUser(common),
  catalogue: createCatalogue(common),
  post: createPost(common),
  tag: createTag(common),
};
