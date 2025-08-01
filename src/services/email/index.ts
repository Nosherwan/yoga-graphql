import formData from "form-data";
import Mailgun from "mailgun.js";
import {
  mailgunApiKey as key,
  mailgunDomain as domain,
} from "../../lib/config.js";
import type { MailgunMessageData } from "mailgun.js/Types/Messages";
import { readFileSync } from "fs";

type Attachment = { location: string; fileName: string };

function isAttachment(
  attachment: Attachment | undefined,
): attachment is Attachment {
  return typeof attachment === "object" && !!attachment.location;
}

const mailgun = new (Mailgun as any)(formData).client({ username: "api", key });

export async function sendEmail({
  fields,
  attachment,
}: {
  fields: MailgunMessageData;
  attachment?: Attachment;
}) {
  try {
    if (isAttachment(attachment)) {
      const file = {
        data: readFileSync(attachment.location),
        filename: attachment.fileName,
      };
      fields.attachment = file;
    }
    return await mailgun.messages.create(domain, fields);
  } catch (error) {
    console.log("Error:SendEmail", error);
    return null;
  }
}
