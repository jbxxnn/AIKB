import { fileSearchTool, Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// Tool definitions
const fileSearch = fileSearchTool([
  "vs_68f202fc56b881919132e9cae19cab17"
]);

const myAgent = new Agent({
  name: "My agent",
  instructions: "You are expected to answer the users questions from the document uploaded as your source.",
  model: "gpt-5",
  tools: [
    fileSearch
  ],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("re-circuit", async () => {
    const state = {};

    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: workflow.input_as_text
          }
        ]
      }
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_68f204cfa4bc81908759bc42e229b7870f2f74be939c193b"
      }
    });

    const myAgentResultTemp = await runner.run(
      myAgent,
      [
        ...conversationHistory
      ]
    );

    conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

    if (!myAgentResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
    }

    const myAgentResult = {
      output_text: myAgentResultTemp.finalOutput ?? ""
    };

    return myAgentResult;
  });
};
