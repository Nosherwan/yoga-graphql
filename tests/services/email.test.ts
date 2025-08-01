import { sendEmail } from "../../src/services/email";
import {
  cacheTemplates,
  getEmailTemplateHtml,
  TemplateNames,
} from "../../src/services/email/templates";

const email = "nosherwan@gmail.com";

const fields = {
  from: "Test User <admin@mindfullist.com.au>",
  to: email,
  subject: "Hello Test",
  text: "Testing some Mailgun awesomeness!",
};

const templateFields = {
  email,
  first_name: "Nosh",
  last_name: "Ghazanfar",
  pageUrl: "https://www.google.com",
};

//NOTE: if variable name starts with mock; babel ignores its behaviour
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockCreate = jest.fn(async (x, y) => ({
  status: 200,
  id: "<fake@mindfullist.com.au>",
  message: "Fake Queued. Thank you.",
}));

//NOTE:  mock the whole mailgun.js package.

jest.mock("mailgun.js", () =>
  jest.fn().mockImplementation(() => ({
    _esmodule: true,
    client: jest.fn(() => ({
      messages: {
        //NOTE: direct assignment  of mockFn throws error
        // for uninitialised mockCreate variable at compile time.
        // hence enclosed in a function
        create: (x: any, y: any) => mockCreate(x, y),
      },
    })),
  })),
);

test("💌 Send email with regular fields", async () => {
  await sendEmail({
    fields,
  });

  expect(mockCreate).toHaveBeenCalled();

  expect(typeof mockCreate.mock.calls[0][0]).toBeTruthy();
});

test("💌 Send email with attachement", async () => {
  await sendEmail({
    fields,
    attachment: {
      location: "./tmp/hello.txt",
      fileName: "well-hello.txt",
    },
  });

  expect(mockCreate).toHaveBeenCalled();

  expect(
    Buffer.isBuffer(mockCreate.mock.calls[0][1].attachment.data),
  ).toBeTruthy();
});

test("💌 Email templates are cached", async () => {
  const result = cacheTemplates();
  let pass = true;

  const resultString = getEmailTemplateHtml(
    TemplateNames.ACCOUNT_APPROVED,
    templateFields,
  );

  for (const [key, { value }] of Object.entries(result)) {
    if (!value.length) {
      pass = false;
      break;
    }
  }

  expect(pass).toBeTruthy();
});

test("💌 Email templates are cached", async () => {
  const result = cacheTemplates();

  const resultString = getEmailTemplateHtml(
    TemplateNames.ACCOUNT_APPROVED,
    templateFields,
  );

  expect(resultString).toMatch(new RegExp(email));
});
