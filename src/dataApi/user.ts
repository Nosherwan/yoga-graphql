import bcrypt from "bcryptjs";
import type { DataFilter } from "./common.js";
import type Common from "./common.js";
import type { User } from "../typings/user.js";

const tableName = "app_user";

function User(common: typeof Common) {
  function createUser({ user }: { user: User }) {
    return common.create({ tableName, data: user });
  }

  function updateUser({ id, user }: { id: number; user: User }) {
    return common.update({ tableName, id, data: user });
  }

  function updateProfileInfo({
    email,
    user,
  }: {
    email: string;
    user: User;
    dataApi: typeof Common;
  }): Promise<User> {
    email = email.toLowerCase();
    const data = common.lowerCaseColumnValues(user);

    const query = common
      .store(tableName)
      .where({ email })
      .update(data)
      .then(() => common.store(tableName).where({ email }).first());
    return query;
  }

  function getUser({ id }: any) {
    return common.get({ tableName, id });
  }

  function getUserByEmail({ email }: { email: string }): any {
    email = email.toLowerCase();
    const query = common
      .store(tableName)
      .where({ deleted: false, email })
      .first();
    return query;
  }

  function getUserByUniqId({ uniqid }: any): any {
    const query = common
      .store(tableName)
      .where({ deleted: false, uniqid })
      .first();
    return query;
  }

  function getUserByRefreshToken({ refreshToken }: any): any {
    const query = common
      .store(tableName)
      .where({ deleted: false })
      .whereRaw("? = ANY(refresh_tokens)", refreshToken)
      .first();
    return query;
  }

  async function getUsers({
    offset,
    limit,
    filter,
  }: {
    offset: number;
    limit: number;
    filter: DataFilter[];
  }) {
    let componentQuery = common.store(tableName).where({ deleted: false });

    const forCount = componentQuery.clone();
    componentQuery = componentQuery.orderBy("id", "desc");

    componentQuery = common.applyAndFilter(componentQuery, filter).select("*");

    if (offset > 0) componentQuery.offset(offset);
    if (limit > 0) componentQuery.limit(limit);

    const countQuery = common.applyAndFilter(
      forCount.count({ count: "id" }),
      filter,
    );

    // console.log('query:', componentQuery.toQuery());

    const [items, [{ count }]] = await Promise.all([
      componentQuery,
      countQuery,
    ]);
    return { items, count };
  }

  async function validateEmailPassword({
    email,
    password,
  }: any): Promise<[boolean, any]> {
    email = email.toLowerCase();
    const user = await common
      .store(tableName)
      .where({ deleted: false, email })
      .first();
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password);
      return [isMatch, user];
    }
    return [false, null];
  }

  return {
    createUser,
    updateUser,
    updateProfileInfo,
    getUser,
    getUsers,
    getUserByEmail,
    getUserByUniqId,
    getUserByRefreshToken,
    validateEmailPassword,
  };
}

export const createUser = User;
