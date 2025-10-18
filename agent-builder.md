Agents
======

Learn how to build, deploy, and optimize agent workflows with AgentKit.

Agents are systems that intelligently accomplish tasks—from simple goals to complex, open-ended workflows. OpenAI provides models with agentic strengths, a toolkit for agent creation and deploys, and dashboard features for monitoring and optimizing agents.

AgentKit
--------

AgentKit is a modular toolkit for building, deploying, and optimizing agents.

[

![Build](https://cdn.openai.com/API/docs/images/build.png)

Build

Create workflows with Agent Builder, a visual canvas with starter templates

](/docs/guides/agent-builder)[

![Deploy](https://cdn.openai.com/API/docs/images/chatkit-1.png)

Deploy

Use ChatKit to embed your agent workflows in your frontend

](/docs/guides/chatkit)[

![Optimize](https://cdn.openai.com/API/docs/images/deploy.png)

Optimize

Build robust evals to observe and improve agent performance

](/docs/guides/agent-evals)

How to build an agent
---------------------

Building an agent is a process of designing workflows and connecting pieces of the OpenAI platform to meet your goals. Agent Builder brings all these primitives into one UI.

|Goal|What to use|Description|
|---|---|---|
|Build an agent workflow|Agent Builder|Visual canvas for creating agent workflows. Brings models, tools, knowledge, and logic all into one place.|
|Connect to LLMs|OpenAI models|Core intelligence capable of reasoning, making decisions, and processing data. Select your model in Agent Builder.|
|Equip your agent|Tools, guardrails|Access to third-party services with connectors and MCP, search vector stores, and prevent misuse.|
|Provide knowledge and memory|Vector stores, file search, embeddings|External and persistent knowledge for more relevant information for your use case, hosted by OpenAI.|
|Add control-flow logic|Logic nodes|Custom logic for how agents work together, handle conditions, and route to other agents.|
|Write your own code|Agents SDK|Build agentic applications, with tools and orchestration, instead of using Agent Builder as the backend.|

To build a voice agent that understands audio and responds in natural language, see the [voice agents docs](/docs/guides/voice-agents). Voice agents are not supported in Agent Builder.

Deploy agents in your product
-----------------------------

When you're ready to bring your agent to production, use ChatKit to bring the agent workflow into your product UI, with an embeddable chat connected to your agentic backend.

|Goal|What to use|Description|
|---|---|---|
|Embed your agent|ChatKit|Customizable UI component. Paste your workflow ID to embed your agent workflow in your product.|
|Get more customization|Advanced ChatKit|Run ChatKit on your own infrastructure. Use widgets and connect to any agentic backend with SDKs.|

Optimize agent performance
--------------------------

Use the OpenAI platform to evaluate agent performance and automate improvements.

|Goal|What to use|Description|
|---|---|---|
|Evaluate agent performance|Evals features|Full evaluation platform, including support for external model evaluation.|
|Automate trace grading|Trace grading|Develop, deploy, monitor, and improve agents.|
|Build and track evals|Datasets|A collaborative interface to build agent-level evals in a test environment.|
|Optimize prompts|Prompt optimizer|Measure agent performance, identify areas for improvement, and refine your agents.|

Get started
-----------

Design an agent workflow with [Agent Builder](/docs/guides/agent-builder) →

Was this page useful?







Agent Builder

Beta

=====================

Visually assemble, debug, and export multi-step agent workflows from the playground.

**Agent Builder** is a visual canvas for building multi-step agent workflows.

You can start from templates, drag and drop nodes for each step in your workflow, provide typed inputs and outputs, and preview runs using live data. When you're ready to deploy, embed the workflow into your site with ChatKit, or download the SDK code to run it yourself.

Use this guide to learn the process and parts of building agents.

Agents and workflows
--------------------

To build useful agents, you create workflows for them. A **workflow** is a combination of agents, tools, and control-flow logic. A workflow encapsulates all steps and actions involved in handling your tasks or powering your chats, with working code you can deploy when you're ready.

[Open Agent Builder](/agent-builder)  
  

There are three main steps in building agents to handle tasks:

1.  Design a workflow in [Agent Builder](/agent-builder). This defines your agents and how they'll work.
2.  Publish your workflow. It's an object with an ID and versioning.
3.  Deploy your workflow. Pass the ID into your [ChatKit](/docs/guides/chatkit) integration, or download the Agents SDK code to deploy your workflow yourself.

Compose with nodes
------------------

In Agent Builder, insert and connect nodes to create your workflow. Each connection between nodes becomes a typed edge. Click a node to configure its inputs and outputs, observe the data contract between steps, and ensure downstream nodes receive the properties they expect.

### Examples and templates

Agent Builder provides templates for common workflow patterns. Start with a template to see how nodes work together, or start from scratch.

Here's a homework helper workflow. It uses agents to take questions, reframe them for better answers, route them to other specialized agents, and return an answer.

![prompts chat](https://cdn.openai.com/API/docs/images/homework-helper2.png)

### Available nodes

Nodes are the building blocks for agents. To see all available nodes and their configuration options, see the [node reference documentation](/docs/guides/node-reference).

### Preview and debug

As you build, you can test your workflow by using the **Preview** feature. Here, you can interactively run your workflow, attach sample files, and observe the execution of each node.

### Safety and risks

Building agent workflows comes with risks, like prompt injection and data leakage. See [safety in building agents](/docs/guides/agent-builder-safety) to learn about and help mitigate the risks of agent workflows.

### Evaluate your workflow

Run [trace graders](/docs/guides/trace-grading) inside of Agent Builder. In the top navigation, click **Evaluate**. Here, you can select a trace (or set of traces) and run custom graders to assess overall workflow performance.

Publish your workflow
---------------------

Agent Builder autosaves your work as you go. When you're happy with your workflow, publish it to create a new major version that acts as a snapshot. You can then use your workflow in [ChatKit](/docs/guides/chatkit), an OpenAI framework for embedding chat experiences.

You can create new versions or specify an older version in your API calls.

Deploy in your product
----------------------

When you're ready to implement the agent workflow you created, click **Code** in the top navigation. You have two options for implementing your workflow in production:

**ChatKit**: Follow the [ChatKit quickstart](/docs/guides/chatkit) and pass in your workflow ID to embed this workflow into your application. If you're not sure, we recommend this option.

**Advanced integration**: Copy the workflow code and use it anywhere. You can run ChatKit on your own infrastructure and use the Agents SDK to build and customize agent chat experiences.

Next steps
----------

Now that you've created an agent workflow, bring it into your product with ChatKit.

*   [ChatKit quickstart](/docs/guides/chatkit) →
*   [Advanced integration](/docs/guides/custom-chatkit) →







Using tools
===========

Use tools like remote MCP servers or web search to extend the model's capabilities.

When generating model responses, you can extend capabilities using built‑in tools and remote MCP servers. These enable the model to search the web, retrieve from your files, call your own functions, or access third‑party services.

Web search

Include web search results for the model response

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    tools: [
        { type: "web_search" },
    ],
    input: "What was a positive news story from today?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    tools=[{"type": "web_search"}],
    input="What was a positive news story from today?"
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "tools": [{"type": "web_search"}],
        "input": "what was a positive news story from today?"
    }'
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateWebSearchTool());

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What was a positive news story from today?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

File search

Search your files in a response

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4.1",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

Function calling

Call your own function

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const tools = [
    {
        type: "function",
        name: "get_weather",
        description: "Get current temperature for a given location.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City and country e.g. Bogotá, Colombia",
                },
            },
            required: ["location"],
            additionalProperties: false,
        },
        strict: true,
    },
];

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        { role: "user", content: "What is the weather like in Paris today?" },
    ],
    tools,
});

console.log(response.output[0].to_json());
```

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia",
                }
            },
            "required": ["location"],
            "additionalProperties": False,
        },
        "strict": True,
    },
]

response = client.responses.create(
    model="gpt-5",
    input=[
        {"role": "user", "content": "What is the weather like in Paris today?"},
    ],
    tools=tools,
)

print(response.output[0].to_json())
```

```csharp
using System.Text.Json;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFunctionTool(
        functionName: "get_weather",
        functionDescription: "Get current temperature for a given location.",
        functionParameters: BinaryData.FromObjectAsJson(new
        {
            type = "object",
            properties = new
            {
                location = new
                {
                    type = "string",
                    description = "City and country e.g. Bogotá, Colombia"
                }
            },
            required = new[] { "location" },
            additionalProperties = false
        }),
        strictModeEnabled: true
    )
);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is the weather like in Paris today?")
    ])
], options);

Console.WriteLine(JsonSerializer.Serialize(response.OutputItems[0]));
```

```bash
curl -X POST https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {"role": "user", "content": "What is the weather like in Paris today?"}
    ],
    "tools": [
      {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and country e.g. Bogotá, Colombia"
            }
          },
          "required": ["location"],
          "additionalProperties": false
        },
        "strict": true
      }
    ]
  }'
```

Remote MCP

Call a remote MCP server

```bash
curl https://api.openai.com/v1/responses \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer $OPENAI_API_KEY" \ 
-d '{
  "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/sse",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/sse",
            "require_approval": "never",
        },
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateMcpTool(
    serverLabel: "dmcp",
    serverUri: new Uri("https://dmcp-server.deno.dev/sse"),
    toolCallApprovalPolicy: new McpToolCallApprovalPolicy(GlobalMcpToolCallApprovalPolicy.NeverRequireApproval)
));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Roll 2d4+1")
    ])
], options);

Console.WriteLine(response.GetOutputText());
```

Available tools
---------------

Here's an overview of the tools available in the OpenAI platform—select one of them for further guidance on usage.

[

Function calling

Call custom code to give the model access to additional data and capabilities.

](/docs/guides/function-calling)[

Web search

Include data from the Internet in model response generation.

](/docs/guides/tools-web-search)[

Remote MCP servers

Give the model access to new capabilities via Model Context Protocol (MCP) servers.

](/docs/guides/tools-remote-mcp)[

File search

Search the contents of uploaded files for context when generating a response.

](/docs/guides/tools-file-search)[

Image generation

Generate or edit images using GPT Image.

](/docs/guides/tools-image-generation)[

Code interpreter

Allow the model to execute code in a secure container.

](/docs/guides/tools-code-interpreter)[

Computer use

Create agentic workflows that enable a model to control a computer interface.

](/docs/guides/tools-computer-use)

Usage in the API
----------------

When making a request to generate a [model response](/docs/api-reference/responses/create), you can enable tool access by specifying configurations in the `tools` parameter. Each tool has its own unique configuration requirements—see the [Available tools](/docs/guides/tools#available-tools) section for detailed instructions.

Based on the provided [prompt](/docs/guides/text), the model automatically decides whether to use a configured tool. For instance, if your prompt requests information beyond the model's training cutoff date and web search is enabled, the model will typically invoke the web search tool to retrieve relevant, up-to-date information.

You can explicitly control or guide this behavior by setting the `tool_choice` parameter [in the API request](/docs/api-reference/responses/create).

### Function calling

In addition to built-in tools, you can define custom functions using the `tools` array. These custom functions allow the model to call your application's code, enabling access to specific data or capabilities not directly available within the model.

Learn more in the [function calling guide](/docs/guides/function-calling).

Was this page useful?







