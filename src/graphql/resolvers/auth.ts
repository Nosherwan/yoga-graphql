import Jwt from "jsonwebtoken";
import {
  cookieDomain as domain,
  jwtSecret,
  nodeEnv,
} from "../../lib/config.js";
import { approveRegistration } from "../../lib/users.js";
import { addDays, compareAsc } from "date-fns";
import bcrypt from "bcryptjs";

import { v4 as uuidv4, validate, NIL } from "uuid";
// uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
import type {
  CustomRequest,
  OutboundCookieMap,
} from "../../utils/cookiePlugin.js";
import type { SerializeOptions } from "cookie";
import DataApi from "../../dataApi/api.js";
import type { User } from "../../typings/user.js";
import { checkAuthentication } from "../../lib/auth.js";
import { DecodedToken } from "../../typings/decodedToken.js";
import {
  capitalizeFirstLetter,
  getCreatePasswordLinkText,
} from "../../utils/index.js";
import { sendEmail } from "../../services/email/index.js";
import {
  getEmailTemplateHtml,
  TemplateNames,
} from "../../services/email/templates.js";
import { decode } from "querystring";
const IS_DEV = nodeEnv === "development";
const LOGIN_SUCCESS_MESSAGE = "Login successfull cookie sent.";
const LOGIN_FAILURE_MESSAGE =
  "Provided email & password combination is incorrect, please try again.";
const EMAIL_NOT_FOUND_MESSAGE =
  "Provided email does not exist, please try again.";
const USER_NOT_FOUND_MESSAGE =
  "User related to this refresh_token does not exist, please login.";
const INTERNAL_ERROR_MESSAGE = "An internal error has occured.";
const EXPIRES_IN = "3m";
const SENDING_EMAIL_ADDRESS = "Admin <admin@mindfullist.com.au>";

const _logPayload = (token: string) => {
  console.log(
    "💼 Payload: ",
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("ascii")),
  );
};

const _baseCookieOptions = (expires: Date): SerializeOptions => ({
  sameSite: IS_DEV ? "lax" : "none",
  secure: !IS_DEV,
  expires,
  path: "/",
  httpOnly: true,
  ...(IS_DEV ? {} : { domain }),
});

export const resolvers = {
  Query: {
    logout: async (
      _: any,
      _resp: any,
      {
        request,
        user,
        dataApi,
      }: { request: any; user: User; dataApi: typeof DataApi },
    ) => {
      checkAuthentication({ user });
      //required to send outbound cookies
      const outbound: OutboundCookieMap = request.cookies.outbound;

      const baseCookie = _baseCookieOptions(new Date("1970"));

      outbound.set("refresh_token", {
        data: "",
        options: { ...baseCookie, httpOnly: true },
      });

      // 2nd secure cookie has access token
      outbound.set("access_token", {
        data: "",
        options: { ...baseCookie, httpOnly: true },
      });

      // 3rd cookie can be read client side has xcsrfToken
      outbound.set("xcsrf_token", {
        data: "",
        options: { ...baseCookie, httpOnly: false },
      });

      outbound.set("user_info", {
        data: "",
        options: { ...baseCookie, httpOnly: false },
      });
      return {
        success: true,
        message: "User logged out.",
      };
    },

    login: async (
      _: any,
      { email, password }: any,
      { request, dataApi }: { request: any; dataApi: typeof DataApi },
    ) => {
      //required to send outbound cookies
      const outbound: OutboundCookieMap = request.cookies.outbound;

      const [isMatch, user]: any = await dataApi.user.validateEmailPassword({
        email,
        password,
      });

      if (!user) {
        return {
          success: false,
          message: EMAIL_NOT_FOUND_MESSAGE,
        };
      }

      if (!isMatch) {
        return {
          success: false,
          message: LOGIN_FAILURE_MESSAGE,
        };
      }
      const { title, first_name, last_name, roles, status, phone_number } =
        user;
      const _user = {
        title,
        first_name,
        last_name,
        email,
        roles,
        status,
        phone_number,
      };
      const token = Jwt.sign({ user: _user }, jwtSecret, {
        expiresIn: EXPIRES_IN,
      });
      const decoded = Jwt.verify(token, jwtSecret) as DecodedToken;

      if (typeof decoded === "string") throw new Error("Invalid JWT token");

      _logPayload(token);

      console.log("Decoded Token: ", decoded);
      // Created JWT expiry is being used rather than specify again
      // multiply unix time stamp seconds by 1000 to convert to milliseconds
      const expires = new Date(decoded.exp * 1000);
      const baseCookie = _baseCookieOptions(expires);

      const userInfo = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        exp: decoded.exp,
        roles: user.roles,
        title: user.title,
        phone_number: user.phone_number,
      };

      const accessData = { expires_on: decoded.exp, token };

      const refreshTokenValue = uuidv4();
      const xcsrfTokenValue = uuidv4();

      // Fix: Handle undefined refresh_tokens
      const refresh_tokens = (user.refresh_tokens || []).concat(
        refreshTokenValue,
      );

      dataApi.user.updateUser({
        id: user.id,
        user: { refresh_tokens },
      });

      //expiration for refresh_token is long
      const refreshBaseCookie = _baseCookieOptions(new Date("2030"));
      // First secure cookie has refresh token
      outbound.set("refresh_token", {
        data: refreshTokenValue,
        options: { ...refreshBaseCookie, httpOnly: true },
      });

      // 2nd secure cookie has access token
      outbound.set("access_token", {
        data: accessData,
        options: { ...baseCookie, httpOnly: true },
      });

      // 3rd cookie can be read client side has xcsrfToken
      outbound.set("xcsrf_token", {
        data: xcsrfTokenValue,
        options: { ...baseCookie, httpOnly: false },
      });

      outbound.set("user_info", {
        data: {
          first_name,
          last_name,
          email,
          roles,
          exp: decoded.exp,
          // Avoid including sensitive data like phone number unless needed
        },
        options: { ...baseCookie, httpOnly: false },
      });

      return {
        userInfo,
        success: true,
        message: LOGIN_SUCCESS_MESSAGE,
      };
    },
  },
  Mutation: {
    refreshAccessToken: async (
      _: any,
      _resp: any,
      {
        request,
        dataApi,
        refreshToken,
      }: {
        request: CustomRequest;
        dataApi: typeof DataApi;
        refreshToken: string;
      },
    ) => {
      if (!refreshToken) {
        return {
          success: false,
          message: "No refresh token sent in secure cookie",
        };
      }
      const user = await dataApi.user.getUserByRefreshToken({ refreshToken });

      if (!user) {
        return {
          success: false,
          message: USER_NOT_FOUND_MESSAGE,
        };
      }
      //required to send outbound cookies
      const outbound: OutboundCookieMap = request.cookies.outbound;

      const {
        title,
        first_name,
        last_name,
        email,
        roles,
        status,
        phone_number,
      } = user;
      const _user = {
        title,
        first_name,
        last_name,
        email,
        roles,
        status,
        phone_number,
      };
      //User data refresh token logic
      const token = Jwt.sign({ user: _user }, jwtSecret, {
        expiresIn: EXPIRES_IN,
      });
      const decoded = Jwt.verify(token, jwtSecret) as DecodedToken;

      if (typeof decoded === "string") throw new Error("Invalid JWT token");

      // multiply unix time stamp seconds by 1000 to convert to milliseconds
      const expires = new Date(decoded.exp * 1000);
      const baseCookie = _baseCookieOptions(expires);

      const accessData = { expires_on: decoded.exp, token };
      const xcsrfTokenValue = uuidv4();

      // Resend secure cookie has access token
      outbound.set("access_token", {
        data: accessData,
        options: { ...baseCookie, httpOnly: true },
      });

      // 3rd cookie can be read client side has xcsrfToken
      outbound.set("xcsrf_token", {
        data: xcsrfTokenValue,
        options: { ...baseCookie, httpOnly: false },
      });

      outbound.set("user_info", {
        data: {
          first_name,
          last_name,
          email,
          roles,
          exp: decoded.exp,
          // Avoid including sensitive data like phone number unless needed
        },
        options: { ...baseCookie, httpOnly: false },
      });

      return {
        success: true,
        message: "Access token successfully refreshed.",
      };
    },

    registerRequest: async (
      _: any,
      { email, firstName, lastName }: any,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { dataApi }: { dataApi: typeof DataApi },
    ) => {
      try {
        const existingUser = await dataApi.user.getUserByEmail({ email });
        if (existingUser) {
          if (existingUser.registered) {
            return {
              success: false,
              message: "Provided email address is already registered.",
            };
          }

          await dataApi.user.updateUser({
            id: existingUser.id,
            user: {
              first_name: firstName,
              last_name: lastName,
              status: "requested",
              modified_on: new Date(),
            },
          });
        } else {
          await dataApi.user.createUser({
            user: {
              email,
              first_name: firstName,
              last_name: lastName,
              status: "requested",
            },
          });
        }
        //TODO: automate approval at some point maybe open to
        // anyone being able to randomly create an account
        approveRegistration(email, "approved", dataApi);

        return {
          success: true,
          message: "Account request successfully emailed",
        };
      } catch (error) {
        console.log("error:registerRequest:", error);
        throw error;
      }
    },

    createPassword: async (
      _: any,
      { passwordInput: { uniqid, password } }: any,
      { dataApi }: any,
    ) => {
      if (!validate(uniqid)) {
        return {
          success: false,
          message: "Invalid UUID provided.",
          user: null,
        };
      }
      const found = await dataApi.user.getUserByUniqId({ uniqid });

      if (found) {
        // Allows user one day to click the link & create password
        const expiry = addDays(new Date(found.modified_on), 1);
        const expired = compareAsc(new Date(), expiry) === 1;

        if (expired) {
          return {
            success: false,
            message:
              "This registration link has expired please send another request",
            user: found,
          };
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const result = await dataApi.user.updateUser({
          id: found.id,
          user: {
            password: hash,
            registered: true,
            uniqid: NIL,
          },
        });
        return {
          success: true,
          message: "password created",
          user: result,
        };
      }

      return {
        success: false,
        message: "Please send account creation request first",
        user: found,
      };
    },

    forgotPassword: async (_: any, { email }: any, { dataApi }: any) => {
      try {
        const uuid = uuidv4();
        const resetPasswordLink = getCreatePasswordLinkText(uuid);
        // const emailText = `Hi,\nPlease visit the following link to reset & create a new password for yourself:\n${specsStationUrl}?uuid=${uuid}`;
        const existingUser = await dataApi.user.getUserByEmail({ email });

        if (existingUser && existingUser.status === "approved") {
          const updateUser = await dataApi.user.updateUser({
            id: existingUser.id,
            user: {
              uniqid: uuid,
              modified_on: new Date(),
            },
          });

          const html = getEmailTemplateHtml(TemplateNames.FORGOT_PASSWORD, {
            email,
            first_name: capitalizeFirstLetter(existingUser.first_name),
            last_name: capitalizeFirstLetter(existingUser.last_name),
            pageUrl: resetPasswordLink,
          });

          const mailSent: any = await sendEmail({
            fields: {
              from: SENDING_EMAIL_ADDRESS,
              to: email,
              subject: "Create a new password to reset",
              html,
            },
          });

          if (mailSent.id) {
            return {
              success: true,
              message: "Password reset request emailed",
            };
          }
          return {
            success: false,
            message: "unable to send password reset email. Please try again",
          };
        }
        return {
          success: false,
          message: "email not found.",
        };
      } catch (error) {
        console.log("error:registerRequest:", error);
        throw error;
      }
    },
  },
};
