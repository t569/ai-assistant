import type { AvatarStatus, GraphActionStatus, LangGraphNode } from "./types";

/** Single source of truth for §6's transition matrix. Add a row here when a node changes. */
export interface AvatarTransition {
  node: LangGraphNode | null;
  actionStatus: GraphActionStatus;
  avatarStatus: AvatarStatus;
  description: string;
}

export const AVATAR_STATE_TRANSITIONS: readonly AvatarTransition[] = [
  { node: null, actionStatus: "idle", avatarStatus: "idle", description: "Ambient breathing animation loop." },
  { node: "router_llm", actionStatus: "processing", avatarStatus: "thinking", description: "Micro-expressions indicating analysis." },
  { node: "prepare_proposal", actionStatus: "awaiting_shopper_approval", avatarStatus: "awaiting_approval", description: "Avatar presents the proposed selection to the user." },
  { node: "apply_changes", actionStatus: "syncing", avatarStatus: "syncing", description: "Affirmative reaction while the callback resolves." },
  { node: null, actionStatus: "failed", avatarStatus: "error", description: "Confused or apologetic gesture loop." },
  { node: null, actionStatus: "escalated", avatarStatus: "escalated", description: "Handing off to a live human agent." },
];

const STATUS_TO_AVATAR: Record<GraphActionStatus, AvatarStatus> = AVATAR_STATE_TRANSITIONS.reduce(
  (acc, { actionStatus, avatarStatus }) => {
    acc[actionStatus] = avatarStatus;
    return acc;
  },
  {} as Record<GraphActionStatus, AvatarStatus>,
);

/**
 * Deterministically maps a backend `actionStatus` to the frontend `AvatarStatus`.
 * Unknown/malformed statuses (untrusted network payload) fall back to 'idle' rather than throwing.
 */
export function resolveAvatarStatus(actionStatus: GraphActionStatus): AvatarStatus {
  return STATUS_TO_AVATAR[actionStatus] ?? "idle";
}

const AVATAR_STATUS_DESCRIPTIONS: Record<AvatarStatus, string> = AVATAR_STATE_TRANSITIONS.reduce(
  (acc, { avatarStatus, description }) => {
    acc[avatarStatus] = description;
    return acc;
  },
  {} as Record<AvatarStatus, string>,
);

/** The §6 description for a given `AvatarStatus`, used as the Avatar component's accessible label. */
export function describeAvatarStatus(status: AvatarStatus): string {
  return AVATAR_STATUS_DESCRIPTIONS[status];
}
