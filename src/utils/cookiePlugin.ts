import * as cookie from "cookie";

// Custom cookie plugin implementation
// utilising minimal cookie npm package

// Type represents Request Interface provided by Fetch API +
// below cookies function
export type CustomRequest = Request & { cookies: ReturnType<typeof cookies> };

/**
 * The value stored in the outbound cookie map.
 */
interface IOutboundCookieMapValue {
  data: any;
  options: cookie.SerializeOptions;
}

/**
 * A map of outbound cookies to be sent with the response.
 */
export type OutboundCookieMap = Map<string, IOutboundCookieMapValue>;

/**
 * The following cookies functional class provides incoming cookies in an inbound
 * map; & any new created cookie objects to outbound map. The objects to the outbound
 * map can be assigned from resolvers
 * Returns an object with functions for managing incoming and outgoing cookies.
 * @param inputStringCookie - The input parameter is a string representation of a cookie.
 * @returns An object with `inbound`, `outbound`, and `cookieStrings` properties.
 */
function cookies(inputStringCookie = "") {
  const serialisedInput = cookie.parse(inputStringCookie);
  //To store incoming cookies with the request
  const inbound =
    typeof serialisedInput !== "string"
      ? new Map(Object.entries(serialisedInput))
      : new Map();
  //To create and store any cookies that may need to be sent with
  //the response
  const outbound: OutboundCookieMap = new Map();

  /**
   * Helper function that returns a string array of serialised outbound cookies.
   * @returns An array of serialised outbound cookies.
   */
  function cookieStrings() {
    const list: string[] = [];

    if (outbound.size === 0) return list;

    for (const [key, value] of outbound) {
      const { options, data } = value;
      const content = typeof data === "string" ? data : JSON.stringify(data);
      list.push(cookie.serialize(key, content, options));
    }
    return list;
  }

  //return an object that can be stored onto the request header
  return {
    inbound,
    outbound,
    cookieStrings,
  };
}

export function cookiePlugin() {
  return {
    onRequest({ request }: { request: CustomRequest }) {
      request.cookies = cookies(request.headers.get("cookie") || "");
    },
    onResponse({
      request,
      response,
    }: {
      request: CustomRequest;
      response: any;
    }) {
      if (request.cookies?.outbound?.size ?? 0) {
        const cookieStrings = request.cookies.cookieStrings();
        response.headers.delete("Set-Cookie"); // Clear any existing cookies
        cookieStrings.forEach((cookieString) => {
          response.headers.append("Set-Cookie", cookieString);
        });
      }
    },
  };
}
