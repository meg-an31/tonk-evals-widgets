import pytest
from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.models.base_model import DeepEvalBaseLLM
import os
from groq import Groq
import json
#from javascript import require

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

class GroqLlama(DeepEvalBaseLLM): 
    def __init__(self, model):
        self.model = model

    def load_model(self):
        return self.model
    
    def __setup_prompt(self, role, content, client):
        chat_completion = client.chat.completions.create(
            messages=[{ "role": role, "content": content,}],
            model=self.get_model_name(),
        )
        return chat_completion.choices[0].message.content

    
    def generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        return self.__setup_prompt("user", prompt, chat_model)

    async def a_generate(self, prompt: str) -> str:
        return self.generate(prompt)
    
    def get_model_name(self):
        return "llama-3.3-70b-versatile"



def test_case():
    my_model = GroqLlama(client)

    modularity_metric_component = GEval(
        name="ComponentModularity",
        criteria="Determine if the 'component output' is modular and easy to understand.",
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT],
        threshold=0.5,
        model=my_model,
    )
    accuracy_metric = GEval(
        name="Accuracy",
        criteria="Determine if the 'index output' and 'component ouptut' is an accurate implementation of the 'input'.",
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.INPUT],
        threshold=0.5,
        model=my_model,
    )
    correctness_metric = GEval(
        name="Correctness",
        criteria="Determine if the 'index output' and 'component ouptut' appear as though they would run without error when executed..",
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.INPUT],
        threshold=0.5,
        model=my_model,
    )
    #makeWidget = require("./eval-one.js")
    #print(makeWidget("make a pomodoro timer widget. IMPORTANT: ENSURE THE WIDGET INDEX FILE CAN BE ACCESSED THROUGH THE PATH: widgets/generated/pomodoro-timer/index.js AND THE COMPONENT FILE CAN BE ACCESSED THROUGH THE PATH widgets/generated/pomodoro-timer/component.jsx"))
    with open('data.json', 'r') as f:
        data = json.load(f)
    
    with open(data["indexPath"]) as f: index = f.read()
    with open(data["componentPath"]) as f: component = f.read()

    test_case = LLMTestCase(
        input=data["prompt"],
        # Replace this with the actual output from your LLM application
        actual_output="// component file:\n" + component + "\n// index file:\n" + index,
        #retrieval_context=["All customers are eligible for a 30 day full refund at no extra costs."]
    )
    assert_test(test_case, [modularity_metric_component, accuracy_metric, correctness_metric])


