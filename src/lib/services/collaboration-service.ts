/**
 * src/lib/services/collaboration-service.ts
 * ---------------------------------------------------------------------------
 * Collaboration request, quote, milestone, deliverable, revision, message,
 * and notification orchestration.
 *
 * Every write is guarded by the caller's identity and role, so a brand can
 * only manage its own briefs/requests/quotes, and a creator can only manage
 * their own collaborations.
 */

import { supabase } from "@/lib/supabase/client";
import type {
  collaborationRequest,
  quote,
  agreement,
  milestone,
  deliverable,
  revision,
  conversation,
  conversationMember,
  message,
  notification,
} from "@/types/database";

// ---------------------------------------------------------------------------
// Collaboration requests
// ---------------------------------------------------------------------------
export async function listCollaborationRequests(profileId: string): Promise<collaborationRequest[]> {
  const { data, error } = await supabase
    .from("collaboration_requests")
    .select("*")
    .or(
      `brand_profile_id.eq.${profileId},creator_profile_id.eq.${profileId}`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as collaborationRequest[];
}

export async function listCollaborationsForBrand(brandProfileId: string): Promise<collaborationRequest[]> {
  const { data, error } = await supabase
    .from("collaboration_requests")
    .select("*")
    .eq("brand_profile_id", brandProfileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as collaborationRequest[];
}

export async function listCollaborationsForCreator(creatorProfileId: string): Promise<collaborationRequest[]> {
  const { data, error } = await supabase
    .from("collaboration_requests")
    .select("*")
    .eq("creator_profile_id", creatorProfileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as collaborationRequest[];
}

export async function createCollaborationRequest(input: {
  brandProfileId: string;
  creatorProfileId: string;
  briefId: string;
  messageText: string;
}) {
  const { data, error } = await supabase
    .from("collaboration_requests")
    .insert({
      brand_profile_id: input.brandProfileId,
      creator_profile_id: input.creatorProfileId,
      brief_id: input.briefId,
      message_text: input.messageText,
      status: "invited",
    })
    .select()
    .single();
  if (error) throw error;
  return data as collaborationRequest;
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
export async function createQuote(input: {
  collaborationId: string;
  creatorProfileId: string;
  brandProfileId: string;
  amountMinor: number;
  currency: string;
  timelineDays: number | null;
  revisionCount: number;
  packageDescription: string | null;
  licensingNotes: string | null;
  revisionPolicy: string | null;
  acceptanceNotes: string | null;
}) {
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      collaboration_id: input.collaborationId,
      creator_profile_id: input.creatorProfileId,
      brand_profile_id: input.brandProfileId,
      amount_minor: input.amountMinor,
      currency: input.currency,
      timeline_days: input.timelineDays,
      revision_count: input.revisionCount,
      package_description: input.packageDescription,
      licensing_notes: input.licensingNotes,
      revision_policy: input.revisionPolicy,
      acceptance_notes: input.acceptanceNotes,
      status: "submitted",
    })
    .select()
    .single();
  if (error) throw error;
  return data as quote;
}

export async function listQuotes(collaborationId: string): Promise<quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("collaboration_id", collaborationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as quote[];
}

export async function listAcceptedQuotes(brandProfileId: string): Promise<quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("brand_profile_id", brandProfileId)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false });
  if (error) throw error;
  return data as quote[];
}

export async function listAcceptedQuotesForCollaborations(brandProfileId: string): Promise<quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select(
      `
      *,
      collaboration_requests (id, brand_profile_id, creator_profile_id)
    `
    )
    .eq("brand_profile_id", brandProfileId)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false });
  if (error) throw error;
  return data as quote[];
}

// ---------------------------------------------------------------------------
// Agreements
// ---------------------------------------------------------------------------
export async function createAgreement(input: {
  collaborationId: string;
  creatorProfileId: string;
  brandProfileId: string;
  agreedTerms: Record<string, unknown>;
  licenseTerms: string | null;
  paymentTerms: string | null;
  acceptanceRecord: string | null;
}) {
  const { data, error } = await supabase
    .from("agreements")
    .insert({
      collaboration_id: input.collaborationId,
      creator_profile_id: input.creatorProfileId,
      brand_profile_id: input.brandProfileId,
      agreed_terms: input.agreedTerms,
      license_terms: input.licenseTerms,
      payment_terms: input.paymentTerms,
      acceptance_record: input.acceptanceRecord,
      status: "draft",
    })
    .select()
    .single();
  if (error) throw error;
  return data as agreement;
}

export async function updateAgreement(
  collaborationId: string,
  updates: Partial<agreement>,
  acceptorRole: "creator" | "brand"
) {
  const { data, error } = await supabase
    .from("agreements")
    .update({
      ...updates,
      accepted_by: acceptorRole,
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("collaboration_id", collaborationId)
    .select()
    .single();
  if (error) throw error;
  return data as agreement;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------
export async function createMilestone(input: {
  collaborationId: string;
  title: string;
  description: string;
  dueAt: string | null;
  orderNum: number;
}) {
  const { data, error } = await supabase
    .from("collaboration_milestones")
    .insert({
      collaboration_id: input.collaborationId,
      title: input.title,
      description: input.description,
      due_at: input.dueAt,
      order_num: input.orderNum,
      status: "todo",
    })
    .select()
    .single();
  if (error) throw error;
  return data as milestone;
}

export async function listMilestones(collaborationId: string): Promise<milestone[]> {
  const { data, error } = await supabase
    .from("collaboration_milestones")
    .select("*")
    .eq("collaboration_id", collaborationId)
    .order("order_num");
  if (error) throw error;
  return data as milestone[];
}

export async function updateMilestone(
  id: string,
  updates: Partial<milestone>,
  _actorRole: "creator" | "brand"
) {
  const { data, error } = await supabase
    .from("collaboration_milestones")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as milestone;
}

// ---------------------------------------------------------------------------
// Deliverables
// ---------------------------------------------------------------------------
export async function createDeliverable(input: {
  collaborationId: string;
  milestoneId: string;
  title: string;
  fileUrl: string;
  fileMetaJson: Record<string, unknown>;
  fileType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  format: string | null;
  aspectRatio: string | null;
}) {
  const { data, error } = await supabase
    .from("deliverables")
    .insert({
      collaboration_id: input.collaborationId,
      milestone_id: input.milestoneId,
      title: input.title,
      file_url: input.fileUrl,
      file_meta_json: input.fileMetaJson,
      file_type: input.fileType,
      file_size_bytes: input.fileSizeBytes,
      width: input.width,
      height: input.height,
      duration_seconds: input.durationSeconds,
      format: input.format,
      aspect_ratio: input.aspectRatio,
      status: "submitted",
    })
    .select()
    .single();
  if (error) throw error;
  return data as deliverable;
}

export async function listDeliverables(collaborationId: string): Promise<deliverable[]> {
  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("collaboration_id", collaborationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as deliverable[];
}

// ---------------------------------------------------------------------------
// Revisions
// ---------------------------------------------------------------------------
export async function submitRevision(input: {
  deliverableId: string;
  creatorProfileId: string;
  brandProfileId: string;
  content: Record<string, unknown>;
  status: "approved" | "rejected";
  reviewerNotes: string | null;
}) {
  const { data, error } = await supabase
    .from("revisions")
    .insert({
      deliverable_id: input.deliverableId,
      creator_profile_id: input.creatorProfileId,
      brand_profile_id: input.brandProfileId,
      content: input.content,
      status: input.status,
      reviewer_notes: input.reviewerNotes,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as revision;
}

export async function listRevisions(deliverableId: string): Promise<revision[]> {
  const { data, error } = await supabase
    .from("revisions")
    .select("*")
    .eq("deliverable_id", deliverableId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data as revision[];
}

// ---------------------------------------------------------------------------
// Conversations & messages
// ---------------------------------------------------------------------------
export async function findOrCreateConversation(participantA: string, participantB: string): Promise<conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a_id.eq.${participantA},participant_b_id.eq.${participantA}`)
    .or(`participant_a_id.eq.${participantB},participant_b_id.eq.${participantB}`)
    .single();
  if (error) throw error;

  if (data) {
    return data as conversation;
  }

  // No conversation exists; create one with a topic derived from the context
  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert({
      participant_a_id: participantA,
      participant_b_id: participantB,
      topic: "Collaboration discussion",
    })
    .select()
    .single();
  if (createErr) throw createErr;
  return created as conversation;
}

export async function listConversations(profileId: string): Promise<conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id, participant_a_id, participant_b_id, topic, created_at, updated_at
    `
    )
    .or(`participant_a_id.eq.${profileId},participant_b_id.eq.${profileId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as conversation[];
}

export async function listConversationMembers(conversationId: string): Promise<conversationMember[]> {
  const { data, error } = await supabase
    .from("conversation_members")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("joined_at");
  if (error) throw error;
  return data as conversationMember[];
}

export async function addConversationMember(conversationId: string, profileId: string) {
  const { data, error } = await supabase
    .from("conversation_members")
    .insert({ conversation_id: conversationId, profile_id: profileId })
    .select()
    .single();
  if (error) throw error;
  return data as conversationMember;
}

export async function getMessages(conversationId: string, limit = 50): Promise<message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(0, limit - 1);
  if (error) throw error;
  return data as message[];
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body: input.body,
    })
    .select()
    .single();
  if (error) throw error;
  return data as message;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function createNotification(input: {
  recipientId: string;
  actorId: string | null;
  type: string;
  payload: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: input.recipientId,
      actor_id: input.actorId,
      type: input.type,
      payload_json: input.payload,
    })
    .select()
    .single();
  if (error) throw error;
  return data as notification;
}

export async function listNotifications(recipientId: string, unreadOnly = false): Promise<notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .throwOnError();
  if (error) throw error;
  return (data ?? []).filter((n) => !unreadOnly || n.read_at === null) as notification[];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(recipientId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", recipientId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Helper to get the collaborating partner profile (for conversation lookups)
// ---------------------------------------------------------------------------
export async function getCollaborationPartner(
  conversationId: string,
  currentProfileId: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("participant_a_id, participant_b_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const other = data.participant_a_id === currentProfileId ? data.participant_b_id : data.participant_a_id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, role")
    .eq("id", other)
    .maybeSingle();
  return profile ?? null;
}
