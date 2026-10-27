import assert from "node:assert/strict";
import test from "node:test";
import { buildContactEmail, validateContact } from "../lib/contact.ts";

const ok = {
  name: "Kovács Emma",
  email: "emma@pelda.hu",
  phone: "",
  message: "Szia!",
  consents: { tajekoztato: true, adatkezeles: true },
};

test("valid contact passes, phone optional", () => {
  const { contact, error } = validateContact(ok);
  assert.equal(error, undefined);
  assert.deepEqual(contact, { name: "Kovács Emma", email: "emma@pelda.hu", phone: "", message: "Szia!" });
});

test("required fields and consents are enforced", () => {
  assert.ok(validateContact({ ...ok, name: " " }).error);
  assert.ok(validateContact({ ...ok, email: "nem-email" }).error);
  assert.ok(validateContact({ ...ok, message: "" }).error);
  assert.ok(validateContact({ ...ok, phone: "abc" }).error);
  assert.ok(validateContact({ ...ok, consents: { tajekoztato: true } }).error);
  assert.ok(validateContact(null).error);
});

test("email html escapes user input", () => {
  const mail = buildContactEmail({ ...ok, name: "<b>x</b>", message: "<script>alert(1)</script>" });
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
  assert.ok(mail.subject.includes("<b>x</b>"));
});
