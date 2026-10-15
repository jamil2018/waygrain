import { McpServer } from '@modelcontextprotocol/server';
import { Store } from '../store/database.js';
import { BrowserSession } from '../browser/session.js';
export declare function knowledgeServer(store: Store, browser?: BrowserSession): McpServer;
