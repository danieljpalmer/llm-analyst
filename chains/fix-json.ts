import { defineChain } from "@relevanceai/chain";

export default defineChain({
  title: 'Fix JSON',
  publiclyTriggerable: true,
  params: {
    brokenJsonString: {
      type: 'string'
    }
  },
  setup({ params, step }) {
    const { brokenJsonString } = params;

    const { answer: fixedJsonString } = step('prompt_completion', {
      prompt: `This JSON string is broken: ${brokenJsonString}. Fix it and return the fixed JSON code.`,
      system_prompt: 'You are a Javascript developer who fixes broken JSON code. You must respond with valid JSON code. You do not respond with any explanations or descriptions, only the fixed JSON code.'
    });

    return {
      fixedJsonString
    }
  }
})