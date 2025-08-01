import type { DataFilter } from "./common.js";
import Common from "./common.js";
import type { Post } from "../typings/post.js";

const tableName = "post";

function Post(common: typeof Common) {
  function createPost({ post }: { post: Post }) {
    return common.create({ tableName, data: post });
  }

  function updatePost({ id, post }: { id: number; post: Post }) {
    return common.update({ tableName, id, data: post });
  }

  function getPostBySlug({ slug }: { slug: string }) {
    let componentQuery = common.store(tableName);
    return componentQuery.where("slug", "=", slug).first();
  }

  async function getPosts({
    offset,
    limit,
    filter,
  }: {
    offset: number;
    limit: number;
    filter: DataFilter[];
  }) {
    let componentQuery = common.store(tableName);

    const forCount = componentQuery.clone();
    componentQuery = componentQuery.orderBy("id", "desc");
    const commonWhereClause = { deleted: false } as any;

    componentQuery = common
      .applyOrFilter(componentQuery, filter, commonWhereClause)
      .select("*");

    if (offset > 0) componentQuery.offset(offset);
    if (limit > 0) componentQuery.limit(limit);

    const countQuery = common.applyOrFilter(
      forCount.count({ count: "id" }),
      filter,
      commonWhereClause,
    );

    const [items, [{ count }]] = await Promise.all([
      componentQuery,
      countQuery,
    ]);
    return { items, count };
  }

  return {
    createPost,
    updatePost,
    getPostBySlug,
    getPosts,
  };
}

export const createPost = Post;
