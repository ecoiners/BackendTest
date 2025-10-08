import { MailtrapClient } from "mailtrap";
import {  ENV } from "../config/env.js";

const TOKEN = ENV.MAILTRAP_TOKEN;
const ENDPOINT = ENV.MAILTRAP_ENDPOINT;

export const mailtrapClient = new MailtrapClient({
	endpoint: ENDPOINT,
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "A.L.I.E",
};
