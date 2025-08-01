import { pagify } from "../../utils/index.js";
import { checkAuthentication } from "../../lib/auth.js";

import type DataApi from "../../dataApi/api.js";
import type { User } from "../../typings/user.js";

export const resolvers = {
  Query: {
    users: async (
      _: any,
      { pageSize, after, filter }: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      checkAuthentication({ user });
      // _checkWriterRole(ctx);
      //NOTE: users need to be filtered based on their role
      // admins get everyone, others get their own org users
      // if (!_userIsAdmin(ctx)) {
      // 	const organisationId = ctx?.user?.organisation_id ?? '-1';
      // 	filter.push(['organisation_id', '=', organisationId]);
      // }
      const { items, cursor, hasMore } = await pagify(
        pageSize,
        after,
        filter,
        dataApi.user.getUsers,
      );
      return {
        users: items.map((item: User) => ({
          ...item,
          created_on: item.created_on
            ? Math.floor(item.created_on.getTime() / 1000)
            : null,
          modified_on: item.modified_on
            ? Math.floor(item.modified_on.getTime() / 1000)
            : null,
        })),
        cursor,
        hasMore,
      };
    },

    user: async (
      _: any,
      { id }: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // _checkAuthentication(ctx);
      const result = await dataApi.user.getUser({ id });
      return result;
    },
  },
};
