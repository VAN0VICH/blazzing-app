/**
 * Learn more about Honeypot protection:
 * @see https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#form-honeypot
 */
import { Honeypot, SpamError } from "remix-utils/honeypot/server";

export function checkHoneypot(formData: FormData, encryptionSeed: string) {
	const honeypot = new Honeypot({
		encryptionSeed,
	});
	try {
		honeypot.check(formData);
	} catch (err: unknown) {
		if (err instanceof SpamError) {
			throw new Response("Form not submitted properly", { status: 400 });
		}
		throw err;
	}
}
