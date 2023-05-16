const express = require("express")
const app = express()
const bodyP = require("body-parser")
const compiler = require("compilex")
const path = require('path')
const options = { stats: true }
compiler.init(options)
app.use(bodyP.json())
app.use("/codemirror-5.65.12", express.static(path.join(__dirname + "/codemirror-5.65.12")))
app.get("/", function (req, res) {
    compiler.flush(function () {
        console.log("deleted")
    })
    res.sendFile(path.join(__dirname + "/index.html"))
})
// app.post("/api", function(req, res) {
//     // console.log(req.body.api.questions[0].testCases)
//     // testCases = req.body.api.questions[0].testCases
//     res.sendStatus(200);
// })
app.post("/submit/:questionId", function (req, res) {
    const questionId = req.params.questionId;
    const testCases = req.body.api.questions.find(q => q.id == questionId).testCases;
    console.log(testCases);
    
    // const testCases = [
    //     {
    //         input: "2\n3\n",
    //         expectedOutput: "5\n"
    //     },
    //     {
    //         input: "10\n20\n",
    //         expectedOutput: "30\n"
    //     },
    //     {
    //         input: "0\n0\n",
    //         expectedOutput: "0\n"
    //     },
    //     // add more test cases as needed
    // ];
    
      
    let code = req.body.code.code
    console.log(code)
    // let input = req.body.input.replace(/\s+/g, '\n');
    let lang = req.body.code.lang
    console.log(lang)
    // console.log(req.body.code.questionid)
    try {
        if (lang == "Python") { 
            const maxScore = 100; // set the maximum score for the contest
            let passedCount = 0;
            let testResults = []; // to store the results of each test case
            let testCount = testCases.length;
            
            for (const testCase of testCases) {
                const input = testCase.input;
                const expectedOutput = testCase.expectedOutput;
                let envData = { OS: "windows" };
                
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        const actualOutput = data.output.trim();
                        if (actualOutput === expectedOutput.trim()) {
                            console.log(`Test case passed: input=${input}, output=${actualOutput}`);
                            passedCount++;
                            testResults.push("Passed");
                        } else {
                            console.error(`Test case failed: input=${input}, expected=${expectedOutput.trim()}, actual=${actualOutput}`);
                            testResults.push("Failed");
                        }
                    } else {
                        console.error(`Compilation error: ${data.error}`);
                        testResults.push("Compilation Error");
                    }
                    
                    // check if all test cases have been processed
                    if (testResults.length == testCount) {
                        const percentage = passedCount / testCases.length * 100;
                        const score = percentage / 100 * maxScore;
                        console.log(`Percentage passed: ${percentage.toFixed(2)}%`);
                        console.log(`Current score: ${score.toFixed(2)}`);
                        
                        // send the response with the score and test results
                        res.send({score: score, testResults: testResults});
                    }
                });
            }
        }
        
        else if(lang == "Cpp" || lang == "C") {
            for (const testCase of testCases) {
                const input = testCase.input;
                const expectedOutput = testCase.expectedOutput;
                let envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        const actualOutput = data.output.trim();
                        if (actualOutput === expectedOutput.trim()) {
                            console.log(`Test case passed: input=${input}, output=${actualOutput}`);
                        } else {
                            console.error(`Test case failed: input=${input}, expected=${expectedOutput.trim()}, actual=${actualOutput}`);
                        }
                    } else {
                        console.error(`Compilation error: ${data.error}`);
                    }
                });
            }
        }
        else if(lang == "Java")
        {
            for (const testCase of testCases) {
                const input = testCase.input;
                const expectedOutput = testCase.expectedOutput;
                let envData = { OS: "windows" };
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    console.log("came")
                    if (data.output) {
                        const actualOutput = data.output.trim();
                        if (actualOutput === expectedOutput.trim()) {
                            console.log(`Test case passed: input=${input}, output=${actualOutput}`);
                        } else {
                            console.error(`Test case failed: input=${input}, expected=${expectedOutput.trim()}, actual=${actualOutput}`);
                        }
                    } else {
                        console.error(`Compilation error: ${data.error}`);
                    }
                });
            }
        }
    }
    catch (e) {
        console.log(e)
    }

})
app.post("/compile", function (req, res) {
    let code = req.body.code
    let input = req.body.input.replace(/\s+/g, '\n');
    let lang = req.body.lang
    console.log(req.body.questionid)
    try {

        if (lang == "Cpp" || lang=="C") {
            if (!input) {
                let envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                compiler.compileCPP(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
            else {
                let envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
        }
        else if (lang == "Java") {
            if (!input) {
                let envData = { OS: "windows" };
                compiler.compileJava(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                })
            }
            else {
                //if windows  
                let envData = { OS: "windows" };
                //else
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                })
            }
        }
        else if (lang == "Python") {
            
            if (!input) {
                let envData = { OS: "windows" };
                compiler.compilePython(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
            else {
                let envData = { OS: "windows" };
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
        }
    }
    catch (e) {
        console.log("error")
    }
})

app.listen(8000, () => {
    console.log(`Server running on port 8000 `);
})