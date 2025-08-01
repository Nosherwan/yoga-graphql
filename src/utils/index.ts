import Axios from "axios";
import { captchaSecret, createPasswordUrl } from "../lib/config.js";
import type { DataFilter } from "../dataApi/common.js";
import { compareAsc, fromUnixTime } from "date-fns";

type ListGetter = ({
  offset,
  limit,
  filter,
}: {
  offset: number;
  limit: number;
  filter: DataFilter[];
}) => Promise<{ items: any[]; count: string | number }>;

export async function pagify(
  pageSize: number,
  after: number,
  filter: DataFilter[],
  listGetter: ListGetter,
) {
  after = !!after && after > 0 ? after : 0;
  pageSize = !!pageSize && pageSize > 0 ? pageSize : 5;

  const { items, count } = await listGetter({
    offset: after,
    limit: pageSize,
    filter,
  });

  const cursor = items.length !== 0 ? after + items.length : null;

  return { items, cursor, hasMore: !!cursor && cursor !== +count };
}

export function capitalizeFirstLetter(string: string) {
  if (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string;
}

export function valueIsNumericID(id: any): boolean {
  if (id === "" || id === null || id === true || isNaN(id)) {
    return false;
  }
  return true;
}

export function verifyReCaptcha({ token }: any) {
  const secret = captchaSecret;
  const url = "https://www.google.com/recaptcha/api/siteverify";

  return Axios({
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    params: {
      secret,
      response: token,
    },
  })
    .then((resp) => {
      // console.log('google recaptcha-3 response:', resp);
      return resp;
    })
    .catch((err) => {
      console.log("google recaptcha-3 error response:", err);
    });
}

export function getCreatePasswordLinkText(uuid: string): string {
  return `\n${createPasswordUrl}?uuid=${uuid}`;
}

export function isCookieExpired(expiredOn: number) {
  const result = compareAsc(new Date(), fromUnixTime(expiredOn));
  return result === 1 || result === 0 ? true : false;
}
export function toBool(item: any) {
  switch (typeof item) {
    case "boolean":
      return item;
    case "function":
      return true;
    case "number":
      return item > 0 || item < 0;
    case "object":
      return !!item;
    case "string":
      item = item.toLowerCase();
      return ["true", "1"].indexOf(item) >= 0;
    case "symbol":
      return true;
    case "undefined":
      return false;

    default:
      throw new TypeError("Unrecognised type: unable to convert to boolean");
  }
}
