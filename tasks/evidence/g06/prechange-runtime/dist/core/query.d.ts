import { type Responses } from '../contracts/index.js';
import { Store } from '../store/database.js';
export interface Selection {
    ids: string[];
    exhausted: boolean;
    guards: string[];
    applicability: 'unconditional' | 'conditional' | 'requires_check';
}
export declare const graphEdgesSql = "\n SELECT source_id a,target_id b FROM relations\n UNION SELECT capture_id a,target_id b FROM evidence_links\n UNION SELECT id a,json_extract(payload_json,'$.state_id') b FROM graph_records WHERE kind='action'\n UNION SELECT id a,json_extract(payload_json,'$.control_id') b FROM graph_records WHERE kind='action'\n UNION SELECT id a,json_extract(payload_json,'$.action_id') b FROM graph_records WHERE kind IN ('action_event','transition')\n UNION SELECT id a,json_extract(payload_json,'$.before_capture_id') b FROM graph_records WHERE kind IN ('action_event','transition')\n UNION SELECT id a,json_extract(payload_json,'$.after_capture_id') b FROM graph_records WHERE kind IN ('action_event','transition')\n UNION SELECT id a,json_extract(payload_json,'$.source_state_id') b FROM graph_records WHERE kind='transition'\n UNION SELECT id a,json_extract(payload_json,'$.target_state_id') b FROM graph_records WHERE kind='transition'\n UNION SELECT id a,json_extract(payload_json,'$.action_event_id') b FROM graph_records WHERE kind='transition'\n";
export declare function query(store: Store, input: unknown, now?: number): Responses['wg_query'];
