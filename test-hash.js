const crypto = require('crypto');

const token = "DktEeiyUkXshO8sT0zWGZviPHueVrpGD"; // This is what we saw in the DB
console.log("Token length:", token.length);

// Let's try to see if it's a hash of something
// But we don't know the input.

// Wait, what if the token in the cookie is something else?
// Let's see if we can generate a 32-char string from a hash.
const hash = crypto.createHash('sha256').update("test").digest('base64url');
console.log("SHA256 base64url length:", hash.length);
