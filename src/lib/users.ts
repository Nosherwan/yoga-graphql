import { v4 as uuidv4 } from "uuid";
// import { getUserByEmail, updateUser } from '../dataApi/user';
import {
  capitalizeFirstLetter,
  getCreatePasswordLinkText,
} from "../utils/index.js";
import { sendEmail } from "../services/email/index.js";
import {
  getEmailTemplateHtml,
  TemplateNames,
} from "../services/email/templates.js";

import type DataApi from "../dataApi/api.js";

const SENDING_EMAIL_ADDRESS = "Admin <admin@mindfullist.com.au>";

export async function approveRegistration(
  email: string,
  status: string,
  dataApi: typeof DataApi,
) {
  const uuid = uuidv4();
  const registrationLink = getCreatePasswordLinkText(uuid);
  const existingUser = await dataApi.user.getUserByEmail({ email });

  if (!existingUser) {
    return {
      success: true,
      message: "Existing user not found",
    };
  }

  const roles = ["user"];

  await dataApi.user.updateUser({
    id: existingUser.id,
    user: {
      status,
      uniqid: uuid,
      modified_on: new Date(),
      roles,
    },
  });

  if (status !== "approved") {
    return {
      success: true,
      message: "Register request rejected",
    };
  }

  const html = getEmailTemplateHtml(TemplateNames.ACCOUNT_APPROVED, {
    email,
    first_name: capitalizeFirstLetter(existingUser.first_name),
    last_name: capitalizeFirstLetter(existingUser.last_name),
    pageUrl: registrationLink,
  });
  // Send email to create password
  const mailSent: any = await sendEmail({
    fields: {
      from: SENDING_EMAIL_ADDRESS,
      to: email,
      subject: "Create a password & complete registration",
      html,
    },
  });
  return mailSent?.id
    ? {
        success: true,
        message: "Register request emailed",
      }
    : {
        success: false,
        message: "Register request email failed",
      };
}
