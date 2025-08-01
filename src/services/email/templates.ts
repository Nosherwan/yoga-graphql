import { readFileSync } from "fs";
import mustache from "mustache";

export enum TemplateNames {
  ACCOUNT_APPROVED = "accountApproved",
  FORGOT_PASSWORD = "forgotPassword",
}

type IHtmlTemplates = { [key: string]: { value: string; file: string } };

const htmlTemplates: IHtmlTemplates = {
  [TemplateNames.ACCOUNT_APPROVED]: {
    value: "",
    file: "src/email/templates/account-approved.hbs",
  },
  [TemplateNames.FORGOT_PASSWORD]: {
    value: "",
    file: "src/email/templates/password-reset.hbs",
  },
};

export function cacheTemplates(): IHtmlTemplates {
  function _cacheTemplates(templates: IHtmlTemplates) {
    try {
      for (const [key, { file }] of Object.entries(templates)) {
        templates[key].value = readFileSync(file, "utf8");
        mustache.parse(templates[key].value);
      }
    } catch (error) {
      console.log("Mustrache unable to parse template: ", error);
    }
  }
  _cacheTemplates(htmlTemplates);

  return { ...htmlTemplates };
}

export function getEmailTemplateHtml(
  templateName: TemplateNames,
  details: unknown,
) {
  if (!htmlTemplates[templateName]) {
    throw Error(`No template by the name ${templateName} exists`);
  }
  return mustache.render(htmlTemplates[templateName].value, { details });
}
