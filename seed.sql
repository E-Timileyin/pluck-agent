-- Pluck Sales Promoter Training — seed data
-- Apply:  npx wrangler d1 execute pluck-training --remote --file=./seed.sql
-- Local:  npx wrangler d1 execute pluck-training --local  --file=./seed.sql
--
-- Every question below is drawn from an UNAMBIGUOUS slide. Four topics were
-- deliberately excluded because the deck contradicts itself — see notes at the bottom.

-- ---------------------------------------------------------------------------
-- Settings (paste your real Drive links in /admin/settings after deploy)
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO settings (id, video_url, slides_url, min_tutorial_seconds, pass_mark, updated_at)
VALUES (1, NULL, NULL, 45, 80, datetime('now'));

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
DELETE FROM questions;

INSERT INTO questions (id, prompt, options, correct_index, order_index, is_active, created_at) VALUES

-- Commission (slides 6, 7)
('q01', 'What is the base commission for each smartphone you sell?',
 '["₦2,500","₦4,500","₦7,000","₦8,000"]', 3, 1, 1, datetime('now')),

('q02', 'What is the base commission for each solar energy system you sell?',
 '["₦4,500","₦7,000","₦8,000","₦10,000"]', 1, 2, 1, datetime('now')),

('q03', 'What is the base commission for each motorcycle you sell?',
 '["₦7,000","₦8,000","₦10,000","₦12,000"]', 2, 3, 1, datetime('now')),

('q04', 'When do you earn your base commission on a sale?',
 '["As soon as the customer signs the form","Once the customer is approved, onboarded and activated","After the customer finishes all repayments","At the end of the month, regardless of outcome"]', 1, 4, 1, datetime('now')),

('q05', 'You sell 6 smartphones in a week and your customers keep above a 90% payment rate. What target commission do you earn per phone, on top of your base?',
 '["₦1,500","₦2,500","₦4,500","₦8,000"]', 2, 5, 1, datetime('now')),

('q06', 'What minimum customer payment rate must you maintain to qualify for target commission?',
 '["70%","80%","90%","100%"]', 2, 6, 1, datetime('now')),

-- Compliance (slide 14) — the two that matter most
('q07', 'A customer offers to send you their daily payment directly so you can pass it on. What do you do?',
 '["Accept it and transfer it to Pluck the same day","Accept it only if the customer is someone you know well","Refuse, and direct them to pay into the company-approved account only","Accept it and log it in your notebook"]', 2, 7, 1, datetime('now')),

('q08', 'Pluck asks for your help recovering an asset from a customer who has stopped paying. Which action is permitted?',
 '["Take the asset back yourself if the customer refuses to hand it over","Bring people with you so the customer feels pressured","Follow the company-approved recovery procedure only","Hold the customer''s ID until they pay"]', 2, 8, 1, datetime('now')),

('q09', 'What can happen if you breach customer data?',
 '["Nothing, as long as no customer complains","A warning on your first offence only","Penalties, and severe violations may lead to legal action","Your commission is delayed by one week"]', 2, 9, 1, datetime('now')),

-- Credit assessment (slide 11)
('q10', 'Which of these is a GREEN FLAG when assessing a customer?',
 '["Recently moved into the community","Lives and works in the same area with stable income","Already financing two other assets","Self-employed with no records"]', 1, 10, 1, datetime('now')),

('q11', 'Which of these is a RED FLAG that means you should NOT push the sale?',
 '["Variable or seasonal income","Only one guarantor available","Customer avoids questions about payments and has poor repayment history","Customer is new to daily payment products"]', 2, 11, 1, datetime('now')),

('q12', 'Why does a bad sale hurt you personally?',
 '["It does not — the company absorbs the loss","It raises NPL, which cuts your commission, your promotion chances and your team''s performance","It only affects your team lead","It delays the customer''s delivery"]', 1, 12, 1, datetime('now')),

-- Career progression (slides 8, 9)
('q13', 'What is the minimum time you must be active as an SP3 before you can be promoted to SP2?',
 '["1 month","3 months","6 months","12 months"]', 1, 13, 1, datetime('now')),

('q14', 'Which tier is responsible for community leadership, partner relations and performance oversight?',
 '["SP3","SP2","SP1","All tiers equally"]', 2, 14, 1, datetime('now'));

-- ---------------------------------------------------------------------------
-- Compliance questions. The pass rule is score >= pass_mark% AND every one of
-- these correct: an agent who scores 12/14 but got "can I take customer
-- payments myself?" wrong has not passed.
-- ---------------------------------------------------------------------------
UPDATE questions SET is_critical = 1 WHERE id IN ('q07','q08','q09');

-- ---------------------------------------------------------------------------
-- DELIBERATELY EXCLUDED — the deck is not consistent on these.
-- Fix the deck first, then add them in /admin/questions.
--
--  1. Monthly earning figures. Slide 7 shows ₦75,000/week from 6 phones
--     (₦8,000 + ₦4,500 each). The speaker notes on the same slide say 50 phones
--     a month earns ₦125,000 — that is ₦2,500 per phone, and it also cites an
--     "NPL Quality Bonus" and a "quarterly retention bonus" that appear nowhere
--     in the slides. The notes' own total (₦196,667) does not match its parts
--     (₦195,000). Looks like leftovers from an earlier version.
--
--  2. Motorcycle repayment amount. Slide 5 lists ₦7,290 under a column headed
--     "Daily/Weekly" over a 300–480 day tenure. As a daily figure that totals
--     ₦2.2m–3.5m; as weekly it totals roughly ₦312k. Neither reads as a
--     motorcycle price. Confirm which, and split that column in two.
--
--  3. Target commission entry threshold. Slide 6's lower tier reads
--     "over 90% payment rate within the first days of every sale" — a number is
--     missing. The upper tier says 14 days.
--
--  4. SP2 → SP1 team requirement. Slide 9 asks for both "team size of at least
--     5 SP3" and "brings at least 5 SP3 onboard". If those are one requirement,
--     say it once; if two, say why they differ.
-- ---------------------------------------------------------------------------
