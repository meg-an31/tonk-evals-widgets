# Eval Framework for Tonk Widgets!
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
### Changes to architecture
My implementation doesn't save widgets  using keepsync, and instead uses a shim to save all files localy (see `shim.js`). This is just to simplify development; if the model successfully writes to a local file, then it will successfully write to keepsync. 
