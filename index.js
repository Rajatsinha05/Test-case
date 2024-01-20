const express = require('express');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const connecton = require('./db');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

const testResultSchema = new mongoose.Schema({
  githubLink: String,
  success: Boolean,
  testResults: String,
});

const TestResult = mongoose.model('TestResult', testResultSchema);

app.use(express.json());

const runTests = async (githubLink, repoPath) => {
  try {
    // Clone repository
    const gitClone = spawn('git', ['clone', githubLink, repoPath], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      gitClone.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git clone process exited with code ${code}`));
        }
      });
    });

    // Change directory
    process.chdir(repoPath);

    // Install dependencies
    const npmCi = spawn('npm', ['ci'], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      npmCi.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm ci process exited with code ${code}`));
        }
      });
    });

    // Run tests
    const npmTest = spawn('npm', ['test', '--', '--watchAll', '--ci=true'], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      npmTest.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm test process exited with code ${code}`));
        }
      });
    });

    return { success: true, testResults: 'Tests completed successfully' };
  } catch (error) {
    throw new Error(`Error running tests: ${error.message}`);
  }
};

app.post('/runtests', async (req, res) => {
  const { githubLink } = req.body;
  const repoPath = `./temp/${Date.now()}`;

  try {
    const { success, testResults } = await runTests(githubLink, repoPath);

    const testResult = new TestResult({ githubLink, success, testResults });
    await testResult.save();

    res.status(200).json({ success, testResults });
  } catch (error) {
    const testResult = new TestResult({ githubLink, success: false, testResults: error.message });
    await testResult.save();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await fs.promises.rm(repoPath, { recursive: true });
  }
});

app.get('/testresults', async (req, res) => {
  try {
    const results = await TestResult.find();
    res.json({ testResults: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connecton();
});
