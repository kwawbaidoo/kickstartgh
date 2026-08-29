/**
 * Where an access request goes. There is no `POST /access-requests` endpoint
 * (BACKEND_GAPS.md §7.4), so the landing page composes the request and hands it to the
 * visitor's own WhatsApp or mail client rather than pretending it was submitted. Set
 * either variable to switch that channel on; with neither set the form still works and
 * offers "copy the details" instead.
 */
export const supportWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";
export const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";
export const hasSupportChannel = !!supportWhatsApp || !!supportEmail;
