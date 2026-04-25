// Email validation: real-looking address + disposable-domain block.
// Used on register and login forms before any auth call.

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "sharklasers.com",
  "grr.la",
  "mailinator.com",
  "mailinator.net",
  "trashmail.com",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.io",
  "tmpmail.org",
  "throwawaymail.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "maildrop.cc",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "spambox.us",
  "spamgourmet.com",
  "discard.email",
  "dispostable.com",
  "emailondeck.com",
  "fakemail.net",
  "harakirimail.com",
  "inboxbear.com",
  "mailcatch.com",
  "mailnesia.com",
  "mytemp.email",
  "mytrashmail.com",
  "tempr.email",
  "throwam.com",
  "wegwerfmail.de",
]);

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateEmail(rawEmail: string): EmailValidationResult {
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return { valid: false, reason: "Email is required." };
  }

  if (email.length > 254) {
    return { valid: false, reason: "Email address is too long." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: "Please enter a valid email address." };
  }

  const [localPart, domain] = email.split("@");

  if (!localPart || localPart.length > 64) {
    return { valid: false, reason: "The part before @ is invalid." };
  }

  if (!domain) {
    return { valid: false, reason: "The domain is missing." };
  }

  // Domain must contain a TLD of at least 2 letters.
  const tld = domain.split(".").pop() || "";
  if (tld.length < 2 || !/^[a-z]{2,24}$/.test(tld)) {
    return { valid: false, reason: "The domain looks invalid." };
  }

  // Block disposable / temporary addresses.
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason:
        "Disposable email addresses aren't allowed. Please use a real email.",
    };
  }

  // Common typo guard: gmial / gnail / hotnail / yaho.
  const typoMap: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gnail.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmai.com": "gmail.com",
    "hotnail.com": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "yaho.com": "yahoo.com",
    "yhoo.com": "yahoo.com",
    "outlok.com": "outlook.com",
  };
  if (typoMap[domain]) {
    return {
      valid: false,
      reason: `Did you mean ${localPart}@${typoMap[domain]}?`,
    };
  }

  return { valid: true };
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email).valid;
}
