# Eval Framework for Tonk Widgets
This is a proof-of-concept implementation of deepeval and linting that auto-runs after you submit a prompt for the pinpin model.

## Setup
```
pip install -r requirements.txt
npm install
npm init @eslint/config@latest
```
API keys needed:
`GROQ_API_KEY`, `VITE_GROQ_API_KEY`

#### To execute:
```
npm run eval -- "your prompt here!"
```

## Motivations  

Right now, models often misinterpret the docs. There's no safety mechanism in place to stop their hallucinations breaking code and producing something incomprehensible. 

If the LLM can't use Tonk, then neither can the user. Giving people a smooth, uninterrupted coding experience is at the core of what will keep them coming back to the software.

## Current state

The proof-of-concept acts as a pipeline of tests:
- Models have access to all of the widget-creation tools, as well as the markdown documents which specify how to use keepsync, components, stores, etc.
- Once the widgets have been created, they are evaluated using a linter, highlighting possible structural errors.
- It is then passed to deepeval, which uses a different model to evaluate the code on its accuracy (how well it implements the request), modularity (whether the structure is intuitive for curious devs to look at and change), and correctness (how likely is this code to run without error). 

#### Changes to architecture
My implementation doesn't save widgets using keepsync, and instead uses a shim to save all files locally (see `shim.js`). This is just to simplify development; if the model successfully writes to a local file, then it will successfully write to keepsync. 

## Potential future directions
#### Integrating a bundled, lightweight eval framework which provides the model with live feedback on its code as the user requests it
- Evaluate code and prompt the model to re-generate if a % of tests are failed
- Encourage the user to alter their prompt after a number of failed regenerations
- Metrics:
  - pass@k and pass\^k for evaluating probability of correct output given k iterations 
  - codeBLEU for testing generated code against reference examples (templates etc)
#### Evaluate existing LLM prompts 
- Auto-eval any changes made to LLM prompts pushed on github
- Optimise prompts using iterative testing methods
