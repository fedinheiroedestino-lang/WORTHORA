import fs from 'fs';
import path from 'path';

const root = process.cwd();
const modelFile = path.join(root, 'data', 'learned_model.json');
const signalFile = path.join(root, 'data', 'learning_signals.json');
const model = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
const signals = fs.existsSync(signalFile) ? JSON.parse(fs.readFileSync(signalFile, 'utf8')) : {};
let helpful = 0, unhelpful = 0;
for (const value of Object.values(signals) as any[]) { helpful += Number(value.helpful || 0); unhelpful += Number(value.unhelpful || 0); }
const total = helpful + unhelpful;
model.version = `4.0.0-feedback-${new Date().toISOString().slice(0, 10)}`;
model.learnedAt = new Date().toISOString();
(model as any).feedbackSummary = { helpful, unhelpful, total, helpfulRate: total ? helpful / total : null, source: 'anonymous article feedback; not used as factual evidence' };
(model as any).learningGuardrails = ['Feedback changes structure and prioritization only.', 'Feedback never creates product facts, ratings, prices, tests or winners.', 'A human editor must approve evidence before publication.'];
fs.writeFileSync(modelFile, JSON.stringify(model, null, 2) + '\n');
console.log(JSON.stringify((model as any).feedbackSummary));
