export const LIFECYCLE_TOOLS = [
    'wg_browser_open',
    'wg_browser_status',
    'wg_browser_snapshot',
    'wg_browser_navigate',
    'wg_browser_act',
    'wg_browser_close',
];
export const capabilities = {
    ownership: 'ephemeral_owned',
    headed: true,
    persistent_authentication: false,
    actions: ['click', 'fill', 'select', 'check', 'uncheck', 'scroll', 'key'],
    navigation_keys: ['Tab', 'Shift+Tab', 'ArrowUp', 'ArrowDown', 'Escape'],
};
export class BrowserError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
    }
    toJSON() {
        return {
            schema_version: 1,
            error: {
                code: this.code,
                message: 'Contract request rejected',
                field_paths: [],
            },
        };
    }
}
