import type { DataFilter } from "./common.js";
import Common from "./common.js";
import type { Catalogue } from "../typings/catalogue.js";

const tableName = "catalogue";

function Catalogue(common: typeof Common) {
  function createCatalogue({ catalogue }: { catalogue: Catalogue }) {
    return common.create({ tableName, data: catalogue });
  }

  function updateCatalogue({
    id,
    catalogue,
  }: {
    id: number;
    catalogue: Catalogue;
  }) {
    return common.update({ tableName, id, data: catalogue });
  }

  function updateProfileInfo({
    email,
    catalogue,
  }: {
    email: string;
    catalogue: Catalogue;
    dataApi: typeof Common;
  }): Promise<Catalogue> {
    email = email.toLowerCase();
    const data = common.lowerCaseColumnValues(catalogue);

    const query = common
      .store(tableName)
      .where({ email })
      .update(data)
      .then(() => common.store(tableName).where({ email }).first());
    return query;
  }

  function getCatalogue({ id }: any) {
    return common.get({ tableName, id });
  }

  function getRandomCatalogue() {
    return common
      .store(tableName)
      .where({ deleted: false }) // Assuming we want to exclude deleted records
      .orderByRaw("RANDOM()") // This works with PostgreSQL to randomize results
      .limit(1)
      .first(); // Get just the first record as an object instead of an array
  }

  async function getCatalogues({
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
    componentQuery = componentQuery.orderBy("id", "asc");
    const commonWhereClause = { deleted: false } as any;
    // TODO: applyOrFilter & potentially applyAndFilter
    // needs additional ['column-name','any','match-word'] support
    // this can be done after whereArgs are determined; instead of
    // "andWhere()" replace with ".andWHereRaw("? = ANY(tags)", [searchWord])"

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

    // console.log('query:', componentQuery.toQuery());

    const [items, [{ count }]] = await Promise.all([
      componentQuery,
      countQuery,
    ]);
    return { items, count };
  }

  return {
    createCatalogue,
    updateCatalogue,
    updateProfileInfo,
    getCatalogue,
    getCatalogues,
    getRandomCatalogue,
  };
}

export const createCatalogue = Catalogue;
