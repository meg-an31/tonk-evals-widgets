import {createTonkAgent} from './mastra/agent.js';
import { createRequire } from 'module';
//import { z } from "zod";
import { execSync } from 'child_process';
import { getWidgetPath } from './deterministic-tests.js';

const testAgent = await createTonkAgent();
//const evalAgent = await createTonkAgent();

export async function makeWidget(prompt) {
    const response = await testAgent.generate(
        [
          {
            role: "user",
            content:
              prompt,
          },
        ],
        {
          // Use experimental_output to enable both structured output and tool calls
          //experimental_output: schema,
        },
      );
   return response.text;    
}

// TO EXECUTE: npm eval -- prompt

// setting up the data object to be written to the json file
const data = {
  prompt: process.argv[2],
  indexPath: "",
  componentPath: "",
};

// call the llm to generate the widget
console.log(await makeWidget(data.prompt));

const require = createRequire(import.meta.url);
const fs = require('fs');



for (const path of getWidgetPath()) {
  // linter evaluation of the widget
  if (path.includes("index.js")) {
    data.indexPath = path;
  }
  else if (path.includes("component.tsx")) {
    data.componentPath = path;
  }
}

try{
  execSync(`npx eslint ${data.indexPath}`, { stdio: "inherit" });
  console.warn(`\n\n${data.indexPath} passed linter`);
}
catch (error) {
  console.error(`Error running linter: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

try{
  execSync(`npx eslint ${data.componentPath}`, { stdio: "inherit" });  
  console.warn(`\n\n${data.componentPath} passed linter`);
}
catch (error) {
  console.error(`Error running linter: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

//write to json file
try {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}
catch (error) {
  console.error(`Error writing to json file: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// make sure you are in the correct environment
execSync('source src/eval-mcp/bin/activate', { stdio: "inherit" });
// run the python script to evaluate the widget

try{
  execSync('deepeval test run src/eval-mcp/test_chatbot.py', { stdio: "inherit" });
  console.log("Evaluation complete");
}
catch (error) {
  console.error(`Error running evaluation: ${error instanceof Error ? error.message : 'Unknown error'}`);
}


