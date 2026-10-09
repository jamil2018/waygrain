import { z } from 'zod';
export const conditions = ['browser-only', 'notes-folder', 'waygrain'];
export const cases = ['cold', 'warm', 'changed'];
export const observations = [
  { screen: 'members', role: 'admin' },
  { screen: 'members', role: 'viewer' },
  { screen: 'settings', role: 'admin' },
  { screen: 'settings', role: 'viewer' },
  { screen: 'detail', role: 'admin' },
];
// Questions are public; the oracle is never supplied to the model.
export const tasks = [
  [
    'invite-label',
    'feature',
    'What is the admin Members invitation button label?',
    0,
  ],
  [
    'viewer-invite',
    'feature',
    'Does viewer Members show an invitation button?',
    1,
  ],
  ['active-tab', 'feature', 'Which Members tab is selected?', 0],
  ['admin-save', 'feature', 'Is admin Settings Save enabled?', 2],
  ['viewer-save', 'feature', 'Is viewer Settings Save enabled?', 3],
  [
    'invite-preparation',
    'journey',
    'Which observed button would start admin invitation? No action has been executed.',
    0,
  ],
  [
    'remove-preparation',
    'journey',
    'Does admin Member detail expose Remove member?',
    4,
  ],
  [
    'persistence-proof',
    'journey',
    'Do these screen observations prove durable backend persistence?',
    0,
  ],
  [
    'rename-change',
    'change',
    'Compared with declared v1 Invite, is the current invitation label renamed?',
    0,
  ],
  [
    'remove-change',
    'change',
    'Compared with declared v1 Remove member, is that control absent now?',
    4,
  ],
].map(([id, group, question, observation]) => ({
  id,
  group,
  question,
  observation,
}));
export const answerValues = [
  'Invite',
  'Invite member',
  'yes',
  'no',
  'Active',
  'enabled',
  'disabled',
  'unproven',
];
export const answerSchema = z.strictObject({
  answers: z
    .array(
      z.strictObject({
        id: z.enum(tasks.map((t) => t.id)),
        value: z.enum(answerValues),
        observation: z.number().int().min(0).max(4),
      }),
    )
    .length(tasks.length),
});
export const jsonSchema = z.toJSONSchema(answerSchema);
export function expected(version) {
  return [
    'Invite' + (version === 2 ? ' member' : ''),
    'no',
    'Active',
    'enabled',
    'disabled',
    'Invite' + (version === 2 ? ' member' : ''),
    version === 2 ? 'no' : 'yes',
    'unproven',
    version === 2 ? 'yes' : 'no',
    version === 2 ? 'yes' : 'no',
  ];
}
export function grade(value, version) {
  const parsed = answerSchema.safeParse(value);
  if (
    !parsed.success ||
    new Set(parsed.data.answers.map((a) => a.id)).size !== tasks.length
  )
    return tasks.map((t) => ({
      id: t.id,
      correct: false,
      grounded: false,
      failure: 'invalid_response',
    }));
  return tasks.map((t, i) => {
    const a = parsed.data.answers.find((a) => a.id === t.id);
    const correct = a.value === expected(version)[i];
    const grounded =
      t.id === 'persistence-proof' || a.observation === t.observation;
    return {
      id: t.id,
      correct,
      grounded,
      failure: correct && grounded ? null : 'incorrect_or_uncited',
    };
  });
}
export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
