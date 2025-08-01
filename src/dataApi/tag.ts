import type { DataFilter } from "./common.js";
import Common from "./common.js";
import type { TagWithCategory } from "../typings/tag.js";

const tableName = "tag_with_category";

function Tag(common: typeof Common) {
  function createTag({ tag }: { tag: TagWithCategory }) {
    return common.create({ tableName, data: tag });
  }

  function updateTag({ id, tag }: { id: number; tag: TagWithCategory }) {
    return common.update({ tableName, id, data: tag });
  }

  async function getTags(): Promise<TagWithCategory[]> {
    let componentQuery = common.store(tableName);

    try {
      return componentQuery
        .select("category", "tag", "occurrence_count")
        .where("deleted", false)
        .groupBy("category", "tag", "occurrence_count")
        .orderBy([
          { column: "category", order: "asc" },
          { column: "occurrence_count", order: "desc" },
          { column: "tag", order: "asc" },
        ]);
    } catch (error) {
      console.error("Error fetching tags with category:", error);
      throw error;
    }
  }

  return {
    createTag,
    updateTag,
    getTags,
  };
}

export const createTag = Tag;
