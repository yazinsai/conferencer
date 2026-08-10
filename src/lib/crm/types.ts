export const CRM_PIPELINE_STAGES = [
  "researching",
  "contacted",
  "in_discussion",
  "confirmed",
  "declined",
] as const;

export type CrmPipelineStage = (typeof CRM_PIPELINE_STAGES)[number];

export const CRM_STAGE_LABELS: Record<CrmPipelineStage, string> = {
  researching: "Researching",
  contacted: "Contacted",
  in_discussion: "In discussion",
  confirmed: "Confirmed",
  declined: "Declined",
};

export type CrmSegmentFilter = {
  q?: string;
  company?: string;
  jobTitle?: string;
  tagId?: string;
  stage?: CrmPipelineStage | "all";
};

export function isCrmPipelineStage(value: string): value is CrmPipelineStage {
  return (CRM_PIPELINE_STAGES as readonly string[]).includes(value);
}
