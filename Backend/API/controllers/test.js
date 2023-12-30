const tokenStore = new Map();

exports.storeToken = (userId, token) => {
    const expiration = Date.now() + 1000 * 60 * 60; // 60 minutes
    tokenStore.set(token, { userId, expiration });
};

exports.verifyToken = (token) => {
    const tokenData = tokenStore.get(token);

    if (tokenData && tokenData.expiration > Date.now()) {
        return tokenData.userId;
    } else {
        tokenStore.delete(token); // Nettoyage
        return null;
    }
};

exports.cleanupExpiredTokens = () => {
    const now = Date.now();
    tokenStore.forEach((value, key) => {
        if (value.expiration <= now) {
            tokenStore.delete(key);
        }
    });
};
