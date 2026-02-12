import { Message } from "@langchain/langgraph-sdk";

// Define our graph state type
export interface ChatState {
    messages: Message[];
}

// Define type bag for interrupts and config
export interface ChatBag {
    // Interrupt data structure from your backend
    InterruptType: {
        type: 'initial_handoff' | 'handoff';
        reason: string;
        instruction: string;
        query: string;
    };

    // Configurable options
    ConfigurableType: {
        userId?: string;
    };
}
