const jwt = require("jsonwebtoken");

function validateTokenn2(req, resp, next) {
    console.log("********");

    const full_token = req.headers['authorization'];

    if (!full_token) {
        return resp.status(401).json({ status: false, msg: "No token provided" });
    }

    const parts = full_token.split(" ");

    if (parts.length !== 2) {
        return resp.status(401).json({ status: false, msg: "Invalid token format" });
    }

    const actualToken = parts[1];

    try {
        const decoded = jwt.verify(actualToken, process.env.SEC_KEY);

        console.log(decoded);

        req.user = decoded; 
        next();

    } catch (err) {
        return resp.status(401).json({ status: false, msg: "Invalid token" });
    }
}

module.exports = { validateTokenn2 };