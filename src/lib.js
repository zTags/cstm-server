const crypto = require("crypto");

function hash(input) {
    return crypto.createHash("sha256").update(input).digest("hex");  
}

exports.hash = hash;