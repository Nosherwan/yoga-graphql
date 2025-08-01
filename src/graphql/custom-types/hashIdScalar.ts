import { GraphQLScalarType, Kind } from "graphql";
import { hashids } from "../../utils/hashIds.js";

// -1 is equal to no value used through out the code base
// hence that needs to be passed on as that.
// The rest of the values if are not Hash values
// again -1 is returned. Otherwise decoded value is returned.
function decode(value: any) {
  try {
    if (value === "-1") return -1;
    const decoded = hashids.decode(value);
    if (decoded.length === 0) return -1;
    return decoded[0];
  } catch {
    return -1;
  }
}

const hashIDScalar = new GraphQLScalarType<unknown, unknown>({
  name: "HashID",
  description: "Hash ID custom scalar type",
  serialize(value) {
    if (typeof value === "number") {
      return hashids.encode(value); // Convert outgoing Integer to string for JSON
    }
    throw new Error("HashID scalar serializer expected a number");
  },
  parseValue(value) {
    // Convert incoming string to Integer
    return decode(value);
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      // Convert hard-coded AST string to Integer
      return decode(ast.value);
    }
    return -1; // Invalid hard-coded value (not an integer)
  },
});

export { hashIDScalar };
