import Hashids from "hashids";
import { hashSecret } from "../lib/config.js";

//NOTE: This file only exports a cached object of hashids

function createHashIds() {
  return new Hashids(hashSecret, 10); // pad to length 10
}

const hashids = createHashIds();

export { hashids };
