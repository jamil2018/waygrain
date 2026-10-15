import type { Requests, Responses } from '../contracts/index.js';
import { BrowserDriver } from './driver.js';
type Receipt = Responses['wg_browser_act']['data'];
type Snapshot = Responses['wg_browser_snapshot']['data'];
export declare class BrowserActions {
    private readonly driver;
    private choices;
    private prepared;
    constructor(driver: BrowserDriver);
    private releaseChoices;
    decorate(snapshot: Snapshot): Promise<void>;
    private authorize;
    prepare(q: Requests['wg_browser_act']): Promise<Receipt>;
    act(execution: string): Promise<Receipt>;
}
export {};
