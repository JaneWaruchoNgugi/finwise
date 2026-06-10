import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1000,
    messages: [
        {
            role: "user",
            content: "What should I do financially to invest more ?"
        }
    ]
});
console.log(message.content);