import { type Page } from 'playwright';
import type { PageBinding } from './protocol.js';
export declare function openBrowser(value: PageBinding, onLost: () => void): Promise<{
    browser: import("playwright").Browser;
    context: import("playwright").BrowserContext;
    page: Page;
}>;
