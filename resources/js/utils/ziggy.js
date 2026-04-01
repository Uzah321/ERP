export function safeRoute(name, params, absolute, config) {
    try {
        return route(name, params, absolute, config);
    } catch {
        return null;
    }
}

export function hasRoute(name) {
    try {
        return route().has(name);
    } catch {
        return false;
    }
}
