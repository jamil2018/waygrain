import assert from 'node:assert/strict';
import test from 'node:test';
import {
  tasks,
  expected,
  grade,
  median,
  conditions,
  cases,
} from '../scripts/evaluation/protocol.mjs';
test('evaluation oracle rejects obsolete answers, wrong citations, duplicate tasks and invalid text', () => {
  const response = (version) => ({
    answers: tasks.map((t, i) => ({
      id: t.id,
      value: expected(version)[i],
      observation: t.observation,
    })),
  });
  assert(grade(response(1), 1).every((r) => r.correct && r.grounded));
  assert.equal(grade(response(1), 2).filter((r) => !r.correct).length, 5);
  const bad = response(2);
  bad.answers[0].observation = 4;
  assert.equal(grade(bad, 2)[0].grounded, false);
  bad.answers[0].id = bad.answers[1].id;
  assert(grade(bad, 2).every((r) => r.failure === 'invalid_response'));
  assert(
    grade({ answers: [{ secret: 'invalid' }] }, 1).every((r) => !r.correct),
  );
  assert.equal(tasks.length * conditions.length * cases.length * 3, 270);
  assert.deepEqual(
    new Set(tasks.map((t) => t.group)),
    new Set(['feature', 'journey', 'change']),
  );
  assert.equal(median([9, 1, 4, 2]), 3);
  assert.equal(median([]), null);
});

test('any supplied screen supports a qualified lack of backend proof', () => {
  const answers = tasks.map((t, i) => ({
    id: t.id,
    value: expected(1)[i],
    observation: t.observation,
  }));
  answers[7].observation = 2;
  assert.equal(grade({ answers }, 1)[7].grounded, true);
  answers[7].value = 'yes';
  assert.equal(grade({ answers }, 1)[7].correct, false);
});
