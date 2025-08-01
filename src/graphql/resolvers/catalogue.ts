import { pagify } from "../../utils/index.js";
import { checkAuthentication } from "../../lib/auth.js";

import type DataApi from "../../dataApi/api.js";
import type { Catalogue } from "../../typings/catalogue.js";

export const resolvers = {
  Query: {
    catalogues: async (
      _: any,
      { pageSize, after, filter }: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // checkAuthentication({ user });
      // _checkWriterRole(ctx);
      //NOTE: catalogues need to be filtered based on their role
      // admins get everyone, others get their own org catalogues
      // if (!_catalogueIsAdmin(ctx)) {
      // 	const organisationId = ctx?.catalogue?.organisation_id ?? '-1';
      // 	filter.push(['organisation_id', '=', organisationId]);
      // }
      const { items, cursor, hasMore } = await pagify(
        pageSize,
        after,
        filter,
        dataApi.catalogue.getCatalogues,
      );
      return {
        catalogues: items.map((item: Catalogue) => ({
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

    catalogue: async (
      _: any,
      { id }: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // _checkAuthentication(ctx);
      const result = await dataApi.catalogue.getCatalogue({ id });
      return result;
    },

    randomCatalogue: async (
      _: any,
      {}: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      // _checkAuthentication(ctx);
      const result = await dataApi.catalogue.getRandomCatalogue();
      return result;
    },
  },
};
