export type {
  Item,
  UserBehaviorEvent,
  AvatarStatus,
  AssistantConfig,
  AssistantCallbacks,
  AssistantState,
  Recommendation,
  LiveAgentHandoff,
  LangGraphNode,
  GraphActionStatus,
  LangGraphStreamEvent,
  ApprovalDecision,
} from "./types";

export { AVATAR_STATE_TRANSITIONS, resolveAvatarStatus, describeAvatarStatus, type AvatarTransition } from "./stateMachine";

export { createLangGraphRuntime, type LangGraphRuntime, type InvokePayload } from "./runtime/client";

export {
  AiAssistantProvider,
  buildLiveAgentHandoff,
  type AiAssistantProviderProps,
  type AiAssistantContextValue,
} from "./context/AiAssistantProvider";

export { useAiAssistant } from "./hooks/useAiAssistant";

export { ProposalCard, calculateProposalTotal } from "./components/ProposalCard";

export { ExplainabilityPanel } from "./components/ExplainabilityPanel";

export { Avatar } from "./components/Avatar";
