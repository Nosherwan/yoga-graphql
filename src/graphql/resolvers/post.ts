import { pagify } from "../../utils/index.js";
import { checkAuthentication } from "../../lib/auth.js";

import type DataApi from "../../dataApi/api.js";
import type { Post } from "../../typings/post.js";

export const resolvers = {
  Query: {
    posts: async (
      _: any,
      { pageSize, after, filter }: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // checkAuthentication({ user });
      // _checkWriterRole(ctx);
      //NOTE: posts need to be filtered based on their role
      // admins get everyone, others get their own org posts
      // if (!_postIsAdmin(ctx)) {
      // 	const organisationId = ctx?.post?.organisation_id ?? '-1';
      // 	filter.push(['organisation_id', '=', organisationId]);
      // }
      const { items, cursor, hasMore } = await pagify(
        pageSize,
        after,
        filter,
        dataApi.post.getPosts,
      );
      return {
        posts: items.map((item: Post) => ({
          ...item,
          created_on: item.created_on
            ? Math.floor(item.created_on.getTime() / 1000)
            : null,
          modified_on: item.modified_on
            ? Math.floor(item.modified_on.getTime() / 1000)
            : null,
          published_on: item.published_on
            ? Math.floor(item.published_on.getTime() / 1000)
            : null,
        })),
        cursor,
        hasMore,
      };
    },

    post: async (
      _: any,
      { slug }: { slug: string },
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // _checkAuthentication(ctx);
      let result = await dataApi.post.getPostBySlug({ slug });
      result = {
        ...result,
        created_on: Math.floor(result.created_on.getTime() / 1000),
        modified_on: Math.floor(result.modified_on.getTime() / 1000),
        published_on: Math.floor(result.published_on.getTime() / 1000),
      };
      return result;
    },
  },
};
