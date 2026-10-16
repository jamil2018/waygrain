import { z } from 'zod';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Store } from '../../store/database.js';
import { fixtureAccess, fixtureScopes, fixtureTargets } from '../fixture.js';
import {
  DescriptorError,
  DESCRIPTOR_LIMITS,
  boundedText,
  idSchema,
  parseDescriptor,
  writeRequestSchema,
  type DescriptorBundle,
} from '../contracts.js';
import { retrieveDescriptor, inspectSource } from '../retrieval.js';
import {
  authorizeAuthorBundle,
  previewImport,
  commitImport,
} from '../authoring.js';
import { readBundle, writeBundle, previewBundle } from '../store.js';
import { markFreshness } from '../freshness.js';
import { verifyClaim } from '../verification.js';
import {
  askConversation,
  loadConversation,
  latestConversation,
} from '../conversation.js';
import { deterministicProvider } from '../providers/deterministic.js';
import type { AnswerProvider } from '../providers/contracts.js';
import {
  exportDescriptor,
  previewRestore,
  commitRestore,
} from '../portable.js';

const assetRoot = new URL('../../../assets/descriptor-demo/', import.meta.url);
// dist/descriptor/http -> repository root requires three parents.
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};
const readerAssets = [
  'index.html',
  'app.mjs',
  'calculate.mjs',
  'style.css',
  'reader.mjs',
  'documentation.css',
];
const uiModules = [
  'adapter.js',
  'render.js',
  'component-panel.js',
  'page-panel.js',
  'source-inspector.js',
];
const authorAssets = [
  'editor.html',
  'editor.mjs',
  'editor-import.mjs',
  'editor-archive.mjs',
  'editor.css',
  'style.css',
];
const assetNames = [...new Set([...readerAssets, ...authorAssets])];
const send = (res: ServerResponse, status: number, data: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
};
function body(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0,
      failed = false;
    req.on('data', (chunk: Buffer) => {
      if (failed) return;
      bytes += chunk.length;
      if (bytes > DESCRIPTOR_LIMITS.requestBytes) {
        failed = true;
        chunks.length = 0;
        reject(new DescriptorError('LIMIT_EXCEEDED'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!failed) {
        try {
          resolve(
            JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown,
          );
        } catch {
          reject(new DescriptorError('INVALID_INPUT'));
        }
      }
    });
    req.on('error', () => reject(new DescriptorError('INVALID_INPUT')));
  });
}
function bind(server: Server, port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('LISTEN_FAILED'));
        return;
      }
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}
const closeServer = (server: Server) =>
  new Promise<void>((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });
/** Local single-user fixture trust boundary; not production identity/authentication. */
export async function startDescriptorService(
  store: Store,
  options: {
    port?: number;
    authorPort?: number;
    provider?: AnswerProvider;
  } = {},
) {
  const provider = options.provider ?? deterministicProvider();
  const project = store.location.configuration.project_id,
    app = store.location.configuration.apps[0]!.app_id;
  const contexts = fixtureScopes().map((scope, index) => ({
    key: String(index),
    label: `${scope.role ?? 'unknown role'} · v${scope.version ?? '?'} · ${scope.tenant} · ${scope.state}`,
    scope,
    context: fixtureAccess(project, app, scope),
  }));
  const author = {
    principal: 'local-author',
    author: true,
    grants: contexts.map((c) => c.context.grants[0]!),
  };
  const authorizeBundle = (b: DescriptorBundle) =>
    authorizeAuthorBundle(author, b);
  const assets = new Map(
    await Promise.all(
      assetNames.map(
        async (name) =>
          [
            name,
            await readFile(fileURLToPath(new URL(name, assetRoot))),
          ] as const,
      ),
    ),
  );
  let readURL = '',
    authorURL = '';
  const handler =
    (mode: 'read' | 'author') =>
    async (req: IncomingMessage, res: ServerResponse) => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      );
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      try {
        const origin = mode === 'read' ? readURL : authorURL;
        if (
          req.headers.host !== new URL(origin).host ||
          (req.headers.origin && req.headers.origin !== origin) ||
          req.headers['sec-fetch-site'] === 'cross-site'
        ) {
          send(res, 403, { error: 'ACCESS_DENIED' });
          return;
        }
        const url = new URL(req.url ?? '/', origin);
        if (url.pathname === '/favicon.ico') {
          res.writeHead(204).end();
          return;
        }
        if (
          req.method === 'GET' &&
          mode === 'read' &&
          uiModules.some((name) => url.pathname === '/ui/' + name)
        ) {
          const name = url.pathname.slice('/ui/'.length);
          res.writeHead(200, { 'Content-Type': types['.js']! });
          res.end(await readFile(new URL('../ui/' + name, import.meta.url)));
          return;
        }
        if (req.method === 'GET') {
          const assetName =
            url.pathname === '/'
              ? mode === 'read'
                ? 'index.html'
                : 'editor.html'
              : url.pathname.startsWith('/assets/descriptor-demo/')
                ? url.pathname.slice('/assets/descriptor-demo/'.length)
                : '';
          if (
            (mode === 'read' ? readerAssets : authorAssets).includes(
              assetName,
            ) &&
            assets.has(assetName)
          ) {
            const type = Object.entries(types).find(([ext]) =>
              assetName.endsWith(ext),
            )![1];
            res.writeHead(200, { 'Content-Type': type });
            const content = assets.get(assetName)!;
            res.end(
              assetName === 'index.html'
                ? content
                    .toString()
                    .replace(
                      '</header>',
                      `<a href="${authorURL}">Edit documentation</a></header>`,
                    )
                : content,
            );
            return;
          }
        }
        if (
          req.method === 'GET' &&
          url.pathname === '/api/bootstrap' &&
          !url.search
        ) {
          send(res, 200, {
            contexts: contexts.map(({ key, label, scope }) => ({
              key,
              label,
              scope,
            })),
            targets: fixtureTargets,
            mode,
            author_url: authorURL,
            provider_label: provider.label,
          });
          return;
        }
        if (
          req.method === 'GET' &&
          mode === 'read' &&
          ['/api/evidence', '/api/source'].includes(url.pathname)
        ) {
          const allowed =
            url.pathname === '/api/source'
              ? ['context', 'target', 'source']
              : ['context', 'target'];
          if (
            [...url.searchParams.keys()].some(
              (key) => !allowed.includes(key),
            ) ||
            allowed.some((key) => url.searchParams.getAll(key).length > 1)
          )
            throw new DescriptorError('INVALID_INPUT');
          const selected = contexts.find(
            (c) => c.key === (url.searchParams.get('context') ?? '0'),
          );
          if (!selected) throw new DescriptorError('ACCESS_DENIED');
          const request = {
            schema_version: 1,
            project_id: project,
            app_id: app,
            target_id: url.searchParams.get('target') ?? fixtureTargets.page,
            scope: selected.scope,
          };
          const data =
            url.pathname === '/api/source'
              ? inspectSource(
                  store,
                  selected.context,
                  request,
                  url.searchParams.get('source') ?? '',
                )
              : retrieveDescriptor(store, selected.context, request);
          send(res, 200, data);
          return;
        }
        if (
          mode === 'read' &&
          req.method === 'GET' &&
          url.pathname === '/api/conversation'
        ) {
          const allowed = ['context', 'target', 'page', 'id'];
          if (
            [...url.searchParams.keys()].some((k) => !allowed.includes(k)) ||
            allowed.some((k) => url.searchParams.getAll(k).length > 1)
          )
            throw new DescriptorError('INVALID_INPUT');
          const selected = contexts.find(
            (c) => c.key === (url.searchParams.get('context') ?? '0'),
          );
          if (!selected) throw new DescriptorError('ACCESS_DENIED');
          const input = {
            schema_version: 1,
            project_id: project,
            app_id: app,
            scope: selected.scope,
            target_id: url.searchParams.get('target') ?? fixtureTargets.page,
            page_id: url.searchParams.get('page') ?? fixtureTargets.page,
          };
          const id = url.searchParams.get('id');
          send(
            res,
            200,
            id
              ? loadConversation(store, selected.context, {
                  ...input,
                  conversation_id: id,
                })
              : latestConversation(store, selected.context, input),
          );
          return;
        }
        if (
          mode === 'read' &&
          req.method === 'POST' &&
          url.pathname === '/api/ask' &&
          !url.search
        ) {
          if (
            req.headers.origin !== readURL ||
            req.headers['content-type'] !== 'application/json'
          )
            throw new DescriptorError('ACCESS_DENIED');
          const input = parseDescriptor(
            z.strictObject({
              context: z.string().max(16),
              target_id: idSchema,
              page_id: idSchema,
              conversation_id: idSchema,
              expected_turn: z
                .number()
                .int()
                .min(0)
                .max(DESCRIPTOR_LIMITS.turns),
              question: boundedText(DESCRIPTOR_LIMITS.question).min(1),
            }),
            await body(req),
          );
          const selected = contexts.find((c) => c.key === input.context);
          if (!selected) throw new DescriptorError('ACCESS_DENIED');
          send(
            res,
            200,
            await askConversation(
              store,
              () => selected.context,
              {
                schema_version: 1,
                project_id: project,
                app_id: app,
                scope: selected.scope,
                target_id: input.target_id,
                page_id: input.page_id,
                conversation_id: input.conversation_id,
                expected_turn: input.expected_turn,
                question: input.question,
              },
              provider,
            ),
          );
          return;
        }
        if (
          mode === 'author' &&
          req.method === 'GET' &&
          url.pathname === '/api/archive' &&
          !url.search
        ) {
          send(res, 200, exportDescriptor(store, author, app));
          return;
        }
        if (
          mode === 'author' &&
          req.method === 'POST' &&
          ['/api/archive/preview', '/api/archive/commit'].includes(
            url.pathname,
          ) &&
          !url.search
        ) {
          if (
            req.headers.origin !== authorURL ||
            req.headers['content-type'] !== 'application/json'
          )
            throw new DescriptorError('ACCESS_DENIED');
          const input = await body(req);
          send(
            res,
            200,
            url.pathname.endsWith('/preview')
              ? previewRestore(store, author, input)
              : commitRestore(store, author, input),
          );
          return;
        }
        if (
          mode === 'author' &&
          req.method === 'POST' &&
          ['/api/import/preview', '/api/import/commit'].includes(
            url.pathname,
          ) &&
          !url.search
        ) {
          if (
            req.headers.origin !== authorURL ||
            req.headers['content-type'] !== 'application/json'
          )
            throw new DescriptorError('ACCESS_DENIED');
          const input = await body(req);
          send(
            res,
            200,
            url.pathname.endsWith('/preview')
              ? previewImport(store, author, input)
              : commitImport(store, author, input),
          );
          return;
        }
        if (
          mode === 'author' &&
          req.method === 'POST' &&
          url.pathname === '/api/verify' &&
          !url.search
        ) {
          if (
            req.headers.origin !== authorURL ||
            req.headers['content-type'] !== 'application/json'
          )
            throw new DescriptorError('ACCESS_DENIED');
          send(res, 200, verifyClaim(store, author, await body(req)));
          return;
        }
        if (
          mode === 'author' &&
          ['/api/bundle', '/api/validate'].includes(url.pathname) &&
          !url.search
        ) {
          if (req.method === 'GET' && url.pathname === '/api/bundle') {
            const bundle = readBundle(store, app);
            if (bundle) authorizeBundle(bundle);
            send(res, 200, { revision: store.revision, bundle });
            return;
          }
          if (req.method === 'POST') {
            if (
              req.headers.origin !== authorURL ||
              req.headers['content-type'] !== 'application/json'
            )
              throw new DescriptorError('ACCESS_DENIED');
            const input = await body(req);
            // Validate before checking all supplied scopes; no imported role can become a grant.
            const parsed = parseDescriptor(writeRequestSchema, input);
            authorizeBundle(parsed.bundle);
            parsed.bundle = markFreshness(
              readBundle(store, app),
              parsed.bundle,
            );
            send(
              res,
              200,
              url.pathname === '/api/validate'
                ? previewBundle(store, parsed)
                : writeBundle(store, parsed),
            );
            return;
          }
        }
        send(res, 404, { error: 'NOT_FOUND' });
      } catch (error) {
        const code =
          error && typeof error === 'object' && 'code' in error
            ? String(error.code)
            : 'INVALID_INPUT';
        const statuses: Record<string, number> = {
          INVALID_INPUT: 400,
          LIMIT_EXCEEDED: 413,
          CONFLICT: 409,
          ACCESS_DENIED: 403,
          NOT_FOUND: 404,
          STORE_BUSY: 409,
          PROVIDER_UNAVAILABLE: 503,
          INVALID_ANSWER: 502,
          STORAGE_LIMIT: 507,
          UNSUPPORTED_SCHEMA: 409,
        };
        send(res, statuses[code] ?? 500, {
          error: code in statuses ? code : 'SERVICE_UNAVAILABLE',
        });
      }
    };
  const reader = createServer((req, res) => {
    void handler('read')(req, res);
  });
  const writer = createServer((req, res) => {
    void handler('author')(req, res);
  });
  try {
    readURL = await bind(reader, options.port ?? 0);
    authorURL = await bind(writer, options.authorPort ?? 0);
  } catch (error) {
    await Promise.all([closeServer(reader), closeServer(writer)]);
    throw error;
  }
  return {
    readURL,
    authorURL,
    close: async () => {
      await Promise.all([closeServer(reader), closeServer(writer)]);
    },
  };
}
