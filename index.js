// const express = require('express');
// const mongoose = require('mongoose');
// const execa = require('execa');
// const rimraf = require('rimraf');
// const connecton = require('./db');

// const app = express();
// const PORT = process.env.PORT || 3000;

// const testResultSchema = new mongoose.Schema({
//   githubLink: String,
//   success: Boolean,
//   testResults: String,
// });

// const TestResult = mongoose.model('TestResult', testResultSchema);

// app.use(express.json());

// const asyncMiddleware = (fn) => (req, res, next) => {
//   try {
//     fn(req, res, next).catch(next);
//   } catch (error) {
//     next(error);
//   }
// };

// app.post('/runtests', asyncMiddleware(async (req, res) => {
//   const { githubLink } = req.body;
//   const repoPath = `./temp/${Date.now()}`;
//   console.log('repoPath: ', repoPath);

//   try {
//     await execa('git', ['clone', githubLink, repoPath]);
//     process.chdir(repoPath);
//     await execa('npm', ['install']);
//     const { stdout } = await execa('npm', ['test']);
//     console.log('stdout: ', stdout);

//     const testResult = new TestResult({ githubLink, success: true, testResults: stdout });
//     console.log('testResult: ', testResult);
//     await testResult.save();

//     res.status(200).json({ success: true, testResults: stdout });
//   } catch (error) {
//     const testResult = new TestResult({ githubLink, success: false, testResults: error.message });
//     await testResult.save();
//     return res.status(500).json({ success: false, error: error.message });
//   } finally {
//     await rimraf(repoPath);
//   }
// }));

// app.get('/testresults', asyncMiddleware(async (req, res) => {
//   try {
//     const results = await TestResult.find();
//     res.json({ testResults: results });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }));

// // const gracefulShutdown = async () => {
// //   console.log('Server is gracefully shutting down.');
// //   await mongoose.connection.close();
// //   process.exit(0);
// // };

// // process.on('SIGINT', gracefulShutdown);
// // process.on('SIGTERM', gracefulShutdown);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   connecton();
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const execa = require('execa');
// const connecton = require('./db');
// const fs = require('fs').promises;

// const app = express();
// const PORT = process.env.PORT || 3000;

// const testResultSchema = new mongoose.Schema({
//   githubLink: String,
//   success: Boolean,
//   testResults: String,
// });

// const TestResult = mongoose.model('TestResult', testResultSchema);

// app.use(express.json());

// const asyncMiddleware = (fn) => (req, res, next) => {
//   try {
//     fn(req, res, next).catch(next);
//   } catch (error) {
//     next(error);
//   }
// };

// app.post('/runtests', asyncMiddleware(async (req, res) => {
//   const { githubLink } = req.body;
//   const repoPath = `./temp/${Date.now()}`;
//   console.log('repoPath: ', repoPath);

//   try {
//     await execa('git', ['clone', githubLink, repoPath]);
//     process.chdir(repoPath);

//     // Use npm ci for faster installations
//     await execa('npm', ['ci']);
//     const { stdout } = await execa('npm', ['test']);
//     console.log('stdout: ', stdout);

//     const testResult = new TestResult({ githubLink, success: true, testResults: stdout });
//     console.log('testResult: ', testResult);
//     await testResult.save();

//     res.status(200).json({ success: true, testResults: stdout });
//   } catch (error) {
//     const testResult = new TestResult({ githubLink, success: false, testResults: error.message });
//     await testResult.save();
//     return res.status(500).json({ success: false, error: error.message });
//   } finally {
//     // Use fs.promises.rmdir for asynchronous directory removal
//     await fs.rmdir(repoPath, { recursive: true });
//   }
// }));

// app.get('/testresults', asyncMiddleware(async (req, res) => {
//   try {
//     const results = await TestResult.find();
//     res.json({ testResults: results });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }));

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   connecton();
// });

// method 3

// const express = require('express');
// const mongoose = require('mongoose');
// const { spawn } = require('cross-spawn');
// const connecton = require('./db');
// const fs = require('fs').promises;

// const app = express();
// const PORT = process.env.PORT || 3000;

// const testResultSchema = new mongoose.Schema({
//   githubLink: String,
//   success: Boolean,
//   testResults: String,
// });

// const TestResult = mongoose.model('TestResult', testResultSchema);

// app.use(express.json());

// const asyncMiddleware = (fn) => (req, res, next) => {
//   try {
//     fn(req, res, next).catch(next);
//   } catch (error) {
//     next(error);
//   }
// };

// const runTests = async (githubLink, repoPath) => {
//   const gitClone = spawn('git', ['clone', githubLink, repoPath], { stdio: 'inherit' });

//   return new Promise((resolve, reject) => {
//     gitClone.on('close', async (code) => {
//       if (code !== 0) {
//         reject(new Error(`Git clone process exited with code ${code}`));
//         return;
//       }

//       process.chdir(repoPath);

//       try {
//         // Use npm ci for faster installations
//         const npmCi = spawn('npm', ['ci'], { stdio: 'inherit' });
//         await new Promise((resolve, reject) => {
//           npmCi.on('close', (code) => {
//             if (code !== 0) {
//               reject(new Error(`npm ci process exited with code ${code}`));
//               return;
//             }
//             resolve();
//           });
//         });

//         const npmTest = spawn('npm', ['test'], { stdio: 'inherit' });
//         await new Promise((resolve, reject) => {
//           npmTest.on('close', (code) => {
//             if (code !== 0) {
//               reject(new Error(`npm test process exited with code ${code}`));
//               return;
//             }
//             resolve();
//           });
//         });

//         return { success: true, testResults: 'Tests completed successfully' };
//       } catch (error) {
//         throw new Error(`Error running tests: ${error.message}`);
//       }
//     });
//   });
// };

// app.post('/runtests', asyncMiddleware(async (req, res) => {
//   const { githubLink } = req.body;
//   const repoPath = `./temp/${Date.now()}`;
//   console.log('repoPath: ', repoPath);

//   try {
//     const { success, testResults } = await runTests(githubLink, repoPath);

//     const testResult = new TestResult({ githubLink, success, testResults });
//     await testResult.save();

//     res.status(200).json({ success, testResults });
//   } catch (error) {
//     const testResult = new TestResult({ githubLink, success: false, testResults: error.message });
//     await testResult.save();
//     return res.status(500).json({ success: false, error: error.message });
//   } finally {
//     // Use fs.promises.rmdir for asynchronous directory removal
//     await fs.rmdir(repoPath, { recursive: true });
//   }
// }));

// app.get('/testresults', asyncMiddleware(async (req, res) => {
//   try {
//     const results = await TestResult.find();
//     res.json({ testResults: results });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }));

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
//   connecton();
// });






// method 4

const express = require('express');
const mongoose = require('mongoose');
const { spawn } = require('cross-spawn');
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

const asyncMiddleware = (fn) => (req, res, next) => {
  try {
    fn(req, res, next).catch(next);
  } catch (error) {
    next(error);
  }
};

const runTests = async (githubLink, repoPath) => {
  const gitClone = spawn('git', ['clone', githubLink, repoPath], { stdio: 'inherit' });

  return new Promise((resolve, reject) => {
    gitClone.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`Git clone process exited with code ${code}`));
        return;
      }

      process.chdir(repoPath);

      try {
        // Use npm ci for faster installations
        const npmCi = spawn('npm', ['ci'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
          npmCi.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`npm ci process exited with code ${code}`));
              return;
            }
            resolve();
          });
        });

        // Use npm test -- --ci=false to run tests non-interactively
        const npmTest = spawn('npm', ['test', '--', '--ci=false'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
          npmTest.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`npm test process exited with code ${code}`));
              return;
            }
            resolve();
          });
        });

        return { success: true, testResults: 'Tests completed successfully' };
      } catch (error) {
        throw new Error(`Error running tests: ${error.message}`);
      }
    });
  });
};

app.post('/runtests', asyncMiddleware(async (req, res) => {
  const { githubLink } = req.body;
  const repoPath = `./temp/${Date.now()}`;
  console.log('repoPath: ', repoPath);

  try {
    const { success, testResults } = await runTests(githubLink, repoPath);

    const testResult = new TestResult({ githubLink, success, testResults });
    console.log('testResult: ', testResult);
    await testResult.save();

    res.status(200).json({ success, testResults });
  } catch (error) {
    const testResult = new TestResult({ githubLink, success: false, testResults: error.message });
    await testResult.save();
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    // Use fs.promises.rmdir for asynchronous directory removal
    await fs.rmdir(repoPath, { recursive: true });
  }
}));

app.get('/testresults', asyncMiddleware(async (req, res) => {
  try {
    const results = await TestResult.find();
    res.json({ testResults: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connecton();
});
