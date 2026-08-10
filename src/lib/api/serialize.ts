import type { schema } from "@/lib/db";

function parseJson(value: string | null | undefined, fallback: unknown = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function serializeEvent(row: typeof schema.events.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    slug: row.slug,
    type: row.type,
    websiteUrl: row.websiteUrl,
    location: row.location,
    timezone: row.timezone,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    theme: row.theme,
    logoUrl: row.logoUrl,
    accentColor: row.accentColor,
    status: row.status,
    agendaPublishedAt: row.agendaPublishedAt,
    enableAcceptance: row.enableAcceptance,
    allowWithdrawal: row.allowWithdrawal,
    portalPendingLabel: row.portalPendingLabel,
    portalAcceptedLabel: row.portalAcceptedLabel,
    createdAt: row.createdAt,
  };
}

export function serializeSubmission(row: typeof schema.submissions.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    formId: row.formId,
    kind: row.kind,
    status: row.status,
    title: row.title,
    description: row.description,
    trackId: row.trackId,
    formatId: row.formatId,
    level: row.level,
    language: row.language,
    locationId: row.locationId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    capacity: row.capacity,
    submitterContactId: row.submitterContactId,
    answers: parseJson(row.answers),
    isDraft: row.isDraft,
    withdrawnAt: row.withdrawnAt,
    withdrawReason: row.withdrawReason,
    approvalStatus: row.approvalStatus,
    notifiedAt: row.notifiedAt,
    averageScore: row.averageScore,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeContact(row: typeof schema.contacts.$inferSelect) {
  return {
    id: row.id,
    orgId: row.orgId,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    headshotUrl: row.headshotUrl,
    biography: row.biography,
    jobTitle: row.jobTitle,
    company: row.company,
    pronouns: row.pronouns,
    phone: row.phone,
    linkedinUrl: row.linkedinUrl,
    twitterUrl: row.twitterUrl,
    facebookUrl: row.facebookUrl,
    websiteUrl: row.websiteUrl,
    dietary: row.dietary,
    tshirtSize: row.tshirtSize,
    salutation: row.salutation,
    honorific: row.honorific,
    gender: row.gender,
    custom: parseJson(row.custom),
    createdAt: row.createdAt,
  };
}

export function serializeEventContact(
  row: typeof schema.eventContacts.$inferSelect,
) {
  return {
    id: row.id,
    eventId: row.eventId,
    contactId: row.contactId,
    status: row.status,
    speakerStatus: row.speakerStatus,
    createdAt: row.createdAt,
  };
}

export function serializeParticipant(
  row: typeof schema.submissionParticipants.$inferSelect,
) {
  return {
    id: row.id,
    submissionId: row.submissionId,
    contactId: row.contactId,
    role: row.role,
    acceptanceStatus: row.acceptanceStatus,
    sortOrder: row.sortOrder,
  };
}

export function serializeForm(row: typeof schema.submissionForms.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    title: row.title,
    pageHeading: row.pageHeading,
    welcomeMessage: row.welcomeMessage,
    showWelcome: row.showWelcome,
    collects: row.collects,
    collectParticipants: row.collectParticipants,
    opensAt: row.opensAt,
    closesAt: row.closesAt,
    submissionLimit: row.submissionLimit,
    allowDrafts: row.allowDrafts,
    allowMultipleDrafts: row.allowMultipleDrafts,
    successMessage: row.successMessage,
    autoRedirectToPortal: row.autoRedirectToPortal,
    redirectSeconds: row.redirectSeconds,
    sendConfirmationEmail: row.sendConfirmationEmail,
    status: row.status,
    trackRouting: parseJson(row.trackRouting),
    createdAt: row.createdAt,
  };
}

export function serializeTrack(row: typeof schema.tracks.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

export function serializeFormat(row: typeof schema.formats.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
    durationMinutes: row.durationMinutes,
  };
}

export function serializeRoom(row: typeof schema.rooms.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

export function serializeTask(row: typeof schema.tasks.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    description: row.description,
    descriptionFieldId: row.descriptionFieldId,
    type: row.type,
    target: row.target,
    linkUrl: row.linkUrl,
    linkFieldId: row.linkFieldId,
    formId: row.formId,
    acceptedTypes: row.acceptedTypes,
    maxSizeMb: row.maxSizeMb,
    createdAt: row.createdAt,
  };
}

export function serializeTaskAssignment(
  row: typeof schema.taskAssignments.$inferSelect,
) {
  return {
    id: row.id,
    taskId: row.taskId,
    eventId: row.eventId,
    contactId: row.contactId,
    submissionId: row.submissionId,
    dueAt: row.dueAt,
    extendedDueAt: row.extendedDueAt,
    isRequired: row.isRequired,
    lockOnComplete: row.lockOnComplete,
    status: row.status,
    formAnswers: parseJson(row.formAnswers),
    completedAt: row.completedAt,
    createdAt: row.createdAt,
  };
}

export function serializeEvaluationPlan(
  row: typeof schema.evaluationPlans.$inferSelect,
) {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    instructions: row.instructions,
    isOpen: row.isOpen,
    opensAt: row.opensAt,
    closesAt: row.closesAt,
    scoringMethod: row.scoringMethod,
    mode: row.mode,
    anonymize: row.anonymize,
    showOtherScores: row.showOtherScores,
    allowAbstain: row.allowAbstain,
    requireAbstainReason: row.requireAbstainReason,
    createdAt: row.createdAt,
  };
}

export function serializeReview(row: typeof schema.reviews.$inferSelect) {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    answers: parseJson(row.answers),
    score: row.score,
    comment: row.comment,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeUpload(row: typeof schema.uploads.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    taskAssignmentId: row.taskAssignmentId,
    submissionId: row.submissionId,
    contactId: row.contactId,
    filename: row.filename,
    contentType: row.contentType,
    size: row.size,
    storageKey: row.storageKey,
    version: row.version,
    uploadedByUserId: row.uploadedByUserId,
    createdAt: row.createdAt,
  };
}

export function serializeEmail(row: typeof schema.emailMessages.$inferSelect) {
  return {
    id: row.id,
    eventId: row.eventId,
    toEmail: row.toEmail,
    toContactId: row.toContactId,
    subject: row.subject,
    bodyHtml: row.bodyHtml,
    templateKey: row.templateKey,
    status: row.status,
    providerId: row.providerId,
    error: row.error,
    sentAt: row.sentAt,
    createdAt: row.createdAt,
  };
}
