-- Demo data. Apply AFTER seed.sql, and before presenting — not during.
--   npx wrangler d1 execute pluck-training --local --file=./demo.sql
--
-- A dashboard with one row proves nothing. This gives you:
--   · five promoters across three tiers, so the tier column has a job
--   · one perfect, two passes, one fail on a compliance question, one repeat
--     attempt showing improvement — the repeat is what sells the concept,
--     because it shows the tool measuring improvement rather than a number
--   · q01 (commission) missed by three of five, so the most-missed tile has
--     something to say. Commission is the right one to fake, because the deck
--     genuinely contradicts itself there.

DELETE FROM answers  WHERE attempt_id LIKE 'demo-%';
DELETE FROM attempts WHERE id LIKE 'demo-%';
DELETE FROM promoters WHERE id LIKE 'demo-%';

INSERT INTO promoters (id, name, phone, tier, email, created_at) VALUES
  ('demo-p1', 'Chinedu Okafor',  '+2348031112221', 'SP1', NULL, datetime('now','-21 days')),
  ('demo-p2', 'Amaka Eze',       '+2348032223332', 'SP2', NULL, datetime('now','-18 days')),
  ('demo-p3', 'Tunde Bello',     '+2348033334443', 'SP3', NULL, datetime('now','-14 days')),
  ('demo-p4', 'Blessing Yusuf',  '+2348034445554', 'SP3', NULL, datetime('now','-11 days')),
  ('demo-p5', 'Ibrahim Musa',    '+2348035556665', 'SP3', NULL, datetime('now','-9 days'));

INSERT INTO attempts
  (id, promoter_id, tutorial_mode, tutorial_started_at, started_at, attested_at, submitted_at, score, total, passed) VALUES
  ('demo-a1',  'demo-p1', 'slides', datetime('now','-20 days'), datetime('now','-20 days'), datetime('now','-20 days','+12 minutes'), datetime('now','-20 days','+12 minutes'), 14, 14, 1),
  ('demo-a2',  'demo-p2', 'slides', datetime('now','-17 days'), datetime('now','-17 days'), datetime('now','-17 days','+14 minutes'), datetime('now','-17 days','+14 minutes'), 13, 14, 1),
  ('demo-a3',  'demo-p3', 'video',  datetime('now','-13 days'), datetime('now','-13 days'), datetime('now','-13 days','+21 minutes'), datetime('now','-13 days','+21 minutes'), 12, 14, 1),
  -- 12/14 is above the pass mark, but a missed compliance question fails it anyway.
  ('demo-a4',  'demo-p4', 'slides', datetime('now','-10 days'), datetime('now','-10 days'), datetime('now','-10 days','+16 minutes'), datetime('now','-10 days','+16 minutes'), 12, 14, 0),
  -- Same promoter, two attempts, visible improvement.
  ('demo-a5a', 'demo-p5', 'slides', datetime('now','-8 days'),  datetime('now','-8 days'),  datetime('now','-8 days','+11 minutes'),  datetime('now','-8 days','+11 minutes'),   9, 14, 0),
  ('demo-a5b', 'demo-p5', 'slides', datetime('now','-2 days'),  datetime('now','-2 days'),  datetime('now','-2 days','+18 minutes'),  datetime('now','-2 days','+18 minutes'),  13, 14, 1);

-- Answers are generated from the live questions and stored with the same
-- snapshot shape the app writes, so the review screens render identically.

-- One statement per attempt: D1 caps how many terms a compound SELECT may have,
-- so this stays flat rather than UNION-ing the attempts together.

INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a1', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       q.correct_index, 1,
       datetime('now','-20 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;

INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a2', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       CASE WHEN q.id IN ('q01') THEN (q.correct_index + 1) % json_array_length(q.options) ELSE q.correct_index END,
       CASE WHEN q.id IN ('q01') THEN 0 ELSE 1 END,
       datetime('now','-17 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;

INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a3', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       CASE WHEN q.id IN ('q01','q05') THEN (q.correct_index + 1) % json_array_length(q.options) ELSE q.correct_index END,
       CASE WHEN q.id IN ('q01','q05') THEN 0 ELSE 1 END,
       datetime('now','-13 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;

-- Decent score, one compliance question missed: the pass rule fails this one.
INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a4', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       CASE WHEN q.id IN ('q01','q08') THEN (q.correct_index + 1) % json_array_length(q.options) ELSE q.correct_index END,
       CASE WHEN q.id IN ('q01','q08') THEN 0 ELSE 1 END,
       datetime('now','-10 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;

INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a5a', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       CASE WHEN q.id IN ('q02','q05','q06','q11','q13') THEN (q.correct_index + 1) % json_array_length(q.options) ELSE q.correct_index END,
       CASE WHEN q.id IN ('q02','q05','q06','q11','q13') THEN 0 ELSE 1 END,
       datetime('now','-8 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;

INSERT INTO answers (id, attempt_id, question_id, question_snapshot, selected_index, is_correct, answered_at)
SELECT lower(hex(randomblob(16))), 'demo-a5b', q.id,
       json_object('prompt', q.prompt, 'options', json(q.options), 'correctIndex', q.correct_index,
                   'isCritical', json(CASE WHEN q.is_critical = 1 THEN 'true' ELSE 'false' END)),
       CASE WHEN q.id IN ('q13') THEN (q.correct_index + 1) % json_array_length(q.options) ELSE q.correct_index END,
       CASE WHEN q.id IN ('q13') THEN 0 ELSE 1 END,
       datetime('now','-2 days','+' || q.order_index || ' minutes')
FROM questions q WHERE q.is_active = 1;
