import type DataApi from "../../dataApi/api.js";

export const resolvers = {
  Query: {
    tags: async (
      _: any,
      {}: any,
      { user, dataApi }: { user: any; dataApi: typeof DataApi },
    ) => {
      const tags = await dataApi.tag.getTags();
      const collection = {};

      for (const tag of tags) {
        const category = tag.category || "";
        const obj = { tag: tag.tag, count: tag.occurrence_count };
        collection[category] = collection[category] || [];
        collection[category].push(obj);
      }
      // Convert object to array of entries
      const result = Object.entries(collection).map(([category, tags]) => ({
        category,
        tags,
      }));
      return result;
    },
  },
};
