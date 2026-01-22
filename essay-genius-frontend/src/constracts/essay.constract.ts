import {
  pageableRequestSchema,
  pageableResponseSchema,
} from "@/lib/schemas/page.schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const isBrowser = typeof window !== "undefined";

export const uploadFileBodySchema = z.object({
  file: isBrowser
    ? z.instanceof(File).refine((mFile) => mFile.size < 20 * 1024 * 1024, {
        message: "File size should be less than 20 MB",
      })
    : z.any(),
});
export type UploadFileBodySchema = z.infer<typeof uploadFileBodySchema>;

// =================== SCHEMAS ===================

export const correctionSchema = z.object({
  mistake: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
});
export type Correction = z.infer<typeof correctionSchema>;

export const scoreDetailSchema = z.object({
  band: z.number(),
  explanation: z.string(),
});
export type ScoreDetail = z.infer<typeof scoreDetailSchema>;

export const scoresSchema = z.object({
  taskResponse: scoreDetailSchema,
  coherenceAndCohesion: scoreDetailSchema,
  lexicalResource: scoreDetailSchema,
  grammaticalRangeAndAccuracy: scoreDetailSchema,
});
export type Scores = z.infer<typeof scoresSchema>;

export const essayTaskTwoScoreResponseSchema = z.object({
  scores: scoresSchema,
  overallBand: z.number(),
  overallFeedback: z.string(),
  corrections: z.array(correctionSchema),
  improvementTips: z.array(z.string()),
  rewrittenParagraph: z.string(),
});
export type EssayTaskTwoScoreResponse = z.infer<
  typeof essayTaskTwoScoreResponseSchema
>;

export const essayTaskTwoScoringRequestSchema = z.object({
  essayPrompt: z.string(),
  essayText: z.string(),
});
export type EssayTaskTwoScoringRequest = z.infer<
  typeof essayTaskTwoScoringRequestSchema
>;

export const essayResponseWrapperObjectSchema = z.object({
  valid: z.boolean(),
  result: z.union([essayTaskTwoScoreResponseSchema, z.string()]), // if invalid result is just a string
});
export type EssayResponseWrapperObject = z.infer<
  typeof essayResponseWrapperObjectSchema
>;

export const essayResponseWrapperScoreSchema = z.object({
  valid: z.boolean(),
  result: essayTaskTwoScoreResponseSchema,
});
export type EssayResponseWrapperScore = z.infer<
  typeof essayResponseWrapperScoreSchema
>;

export const essaySaveRequestSchema = z.object({
  essayText: z.string(),
  promptText: z.string(),
  essayTaskTwoScoreResponse: essayResponseWrapperScoreSchema,
  visibility: z.string(),
});
export type EssaySaveRequestSchema = z.infer<typeof essaySaveRequestSchema>;

export const essayDetailSchema = essaySaveRequestSchema.extend({
  band: z.number(),
});
export type EssayDetail = z.infer<typeof essayDetailSchema>;

export const essayResponseWrapperStringSchema = z.object({
  valid: z.boolean(),
  result: z.string(),
});
export type EssayResponseWrapperString = z.infer<
  typeof essayResponseWrapperStringSchema
>;

export const commonResponseSchema = z.object({
  errorCode: z.string(),
  message: z.string(),
  results: z.any(),
  errors: z.any(),
});
export type CommonResponse = z.infer<typeof commonResponseSchema>;

// Replace z.any() with real schema if available
export const essaySaveResponseSchema = z.any();
export type EssaySaveResponseSchema = z.infer<typeof essaySaveResponseSchema>;

export const listEssayRequestSchema = pageableRequestSchema.extend({
  promptText: z.string().optional(),
  bandFrom: z.number().min(0).max(9).optional(),
  bandTo: z.number().min(0).max(9).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  createdBy: z.string().optional(),
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
  isDeleted: z.boolean().optional(),
  ownByCurrentUser: z.boolean().optional(),
});
export type ListEssayRequest = z.infer<typeof listEssayRequestSchema>;

export const userInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});
export type UserInfo = z.infer<typeof userInfoSchema>;

export const reactedInfoSchema = z.object({
  isReacted: z.boolean(),
  reactionId: z.string().nullable().optional(),
  reactionType: z
    .enum(["STAR", "LOVE", "HAHA", "WOW", "FIRE", "SAD"])
    .nullable()
    .optional(),
});
export const essayScoredResponseSchema = z.object({
  id: z.string(),
  user: userInfoSchema,
  essayText: z.string(),
  promptText: z.string(),
  band: z.number(),
  createdAt: z.string(),
  stars: z.number(),
  comments: z.number(),
  reactedInfo: reactedInfoSchema,
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});
export type EssayScoredResponse = z.infer<typeof essayScoredResponseSchema>;

export const listEssayResponseSchema = pageableResponseSchema(
  essayScoredResponseSchema,
);
export type ListEssayResponse = z.infer<typeof listEssayResponseSchema>;

export const generateEssayPromptRequestSchema = z.object({
  topics: z.array(z.string()),
});
export type GenerateEssayPromptRequest = z.infer<
  typeof generateEssayPromptRequestSchema
>;
// =================== ROUTER CONTRACT ===================

export const essayContract = c.router({
  scoring: {
    method: "POST",
    path: "/essay/scoring-essay",
    body: essayTaskTwoScoringRequestSchema,
    responses: {
      200: essayResponseWrapperObjectSchema,
    },
  },
  saveEssay: {
    method: "POST",
    path: "/essay/save-essay",
    body: essaySaveRequestSchema,
    responses: {
      201: commonResponseSchema,
    },
  },
  generateEssayPrompt: {
    method: "POST",
    path: "/essay/generate-essay-prompt",
    body: generateEssayPromptRequestSchema,
    responses: {
      200: essayResponseWrapperStringSchema,
    },
  },
  getEssays: {
    method: "GET",
    path: "/essay/",
    query: listEssayRequestSchema,
    responses: {
      200: listEssayResponseSchema,
    },
  },
  hello: {
    method: "GET",
    path: "/essay/hello",
    responses: {
      200: z.string(),
    },
  },
  getEssay: {
    method: "GET",
    path: "/essay/get-essay/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: essayDetailSchema,
    },
  },
  deleteEssay: {
    method: "DELETE",
    path: "/essay/delete-essay/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: commonResponseSchema,
    },
  },
});
