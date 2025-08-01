import { hashids } from "../utils/hashIds.js";
import { store } from "./index.js";
import type { Knex } from "knex";

export type DataFilter = [string, string, string | number];

const operators = [
  "=",
  "<=>",
  "<>",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
  "like",
  "ilike",
  "@>",
  "&&",
];

const filterCheck = (filter: unknown[]) =>
  Array.isArray(filter) && filter.length > 0;

const filterItemCheck = (item: DataFilter) =>
  Array.isArray(item) && item.length === 3 && operators.includes(item[1]);

const alphaNumericCheck = (value: unknown) =>
  typeof value === "string" ? /^[a-z0-9]+$/i.test(value) : false;

const columnIsIdCheck = (column: string) => column.includes("id");

function filterItemToWhereArgs(
  column: string,
  operator: string,
  value: string | number,
): [string, string, Knex.Value] {
  operator = operator.toLowerCase();
  let _value = forIDTypeColumnConvertValueToIntFromHash(column, value);
  _value = operator === "like" || operator === "ilike" ? `%${_value}%` : _value;
  return [column, operator, _value as Knex.Value];
}

const forIDTypeColumnConvertValueToIntFromHash = (
  column: string,
  value: string | number,
): string | number | bigint => {
  if (columnIsIdCheck(column) && alphaNumericCheck(value)) {
    const _value = hashids.decode(value as string)[0];
    return Number.isInteger(_value) ? _value : value;
  }
  return value;
};

function lowerCaseColumnValues<T extends object>(data: T): T {
  Object.keys(data).forEach((key: string) => {
    if (typeof data[key] === "string") {
      switch (key) {
        case "password":
          break;
        default:
          data[key] = data[key].toLowerCase();
      }
    }
  });
  return data;
}

function applyAndFilter(
  query: Knex.QueryBuilder,
  filter: DataFilter[],
): Knex.QueryBuilder {
  if (!filterCheck(filter)) {
    return query;
  }
  filter.forEach((item: DataFilter) => {
    if (filterItemCheck(item))
      query.andWhere(...filterItemToWhereArgs(...item));
  });
  return query;
}

function applyOrFilter(
  query: Knex.QueryBuilder,
  filter: DataFilter[],
  commonWhereClause: Knex.Raw<any>,
): Knex.QueryBuilder {
  if (!filterCheck(filter)) {
    return query.where(commonWhereClause);
  }
  filter.forEach((item: DataFilter, index: number) => {
    if (filterItemCheck(item)) {
      const whereArgs = filterItemToWhereArgs(...item);

      const nestedGroupWhereClause = (qb: Knex.QueryBuilder) =>
        qb.where(commonWhereClause).andWhere(...whereArgs);

      if (index === 0) {
        query.where(nestedGroupWhereClause);
      } else {
        query.orWhere(nestedGroupWhereClause);
      }
    }
  });
  return query;
}

function create<T extends object>({
  tableName,
  data,
  lowerCaseValues = true,
}: {
  tableName: string;
  data: T;
  lowerCaseValues?: boolean;
}): Promise<T> {
  data = lowerCaseValues ? lowerCaseColumnValues(data) : data;

  const query = store(tableName)
    .insert(data)
    .returning("id")
    .then(([{ id }]: any) => store(tableName).where({ id }).first());
  return query;
}

function update<T extends object>({
  tableName,
  id,
  data,
  lowerCaseValues = true,
}: {
  tableName: string;
  id: number;
  data: T;
  lowerCaseValues?: boolean;
}): Promise<T> {
  data = lowerCaseValues ? lowerCaseColumnValues(data) : data;

  const query = store(tableName)
    .where({ id })
    .update(data)
    .then(() => store(tableName).where({ id }).first());
  return query;
}

function get({ tableName, id }: any) {
  const query = store(tableName).where({ deleted: false, id }).first();
  return query;
}

async function getList({
  tableName,
  offset,
  limit,
  filter,
  orderBy = undefined,
}): Promise<{ items: any[]; count: any }> {
  let query = store(tableName).select("*").where({ deleted: false });
  // .orderBy('id', 'desc');

  query = orderBy ? query.orderBy(orderBy) : query.orderBy("id", "desc");

  query = applyAndFilter(query, filter);

  if (offset > 0) query.offset(offset);
  if (limit > 0) query.limit(limit);

  let countQuery = store(tableName)
    .where({ deleted: false })
    .count({ count: "id" });

  countQuery = applyAndFilter(countQuery, filter);
  // const str1 = query.toQuery();
  // console.log('one:', str1);

  const [items, [{ count }]] = await Promise.all([query, countQuery]);
  return { items, count };
}

async function createType({ tableName, typeName }: any) {
  let newType = null;
  const existing = await store(tableName).where({ name: typeName }).first();

  if (!existing) {
    const result = await store(tableName).insert({
      name: typeName.toLowerCase(),
    });

    newType = await store(tableName).where({ id: result[0] }).first();
  }
  return newType;
}

async function updateType({ tableName, id, typeName }: any) {
  let updatedType = null;
  const existing = await store(tableName).where({ id }).first();

  if (!existing) {
    return updatedType;
  }
  await store(tableName).where({ id }).update({ name: typeName.toLowerCase() });

  updatedType = await store(tableName).where({ id }).first();

  return updatedType;
}
//The same instance of store is being used
// and exported if requried by other
// modules
export default {
  store,
  lowerCaseColumnValues,
  applyAndFilter,
  applyOrFilter,
  create,
  update,
  get,
  getList,
  createType,
  updateType,
};
