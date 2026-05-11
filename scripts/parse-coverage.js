const fs = require('node:fs');
const path = require('node:path');

const reportPath = path.join(process.cwd(), 'coverage', 'coverage.txt');
if (!fs.existsSync(reportPath)) {
  console.error('coverage/coverage.txt not found. Run: node --experimental-test-coverage tests/budget-core.test.js');
  process.exit(1);
}

const text = fs.readFileSync(reportPath, 'utf8');
const match = text.match(/# all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
if (!match) {
  console.error('Unable to parse overall coverage from coverage.txt');
  process.exit(1);
}

const summary = {
  generatedAt: new Date().toISOString(),
  metrics: {
    line: Number(match[1]),
    branch: Number(match[2]),
    functions: Number(match[3]),
  },
  threshold: {
    line: 80,
  },
};
summary.passed = summary.metrics.line >= summary.threshold.line;

const summaryPath = path.join(process.cwd(), 'coverage', 'summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
console.log(`Saved ${summaryPath}`);
console.log(`Line coverage: ${summary.metrics.line}%`);
console.log(summary.passed ? 'Coverage threshold PASSED.' : 'Coverage threshold FAILED.');
if (!summary.passed) process.exit(1);
