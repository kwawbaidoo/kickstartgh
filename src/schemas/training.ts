import { z } from "zod";

import { trainingFocusOptions } from "@/config/training";
import type { TrainingFocus } from "@/mock/attendance";

export const trainingFormSchema = z
  .object({
    title: z.string().min(2, "Please enter a session title."),
    date: z.string().min(1, "Please select a date."),
    startTime: z.string().min(1, "Please select a start time."),
    endTime: z.string().min(1, "Please select an end time."),
    venue: z.string().min(2, "Please enter a venue."),
    description: z.string().trim().optional(),
    focus: z.enum(trainingFocusOptions as [TrainingFocus, ...TrainingFocus[]]).optional(),
    equipment: z.array(z.string()).optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export type TrainingFormInput = z.infer<typeof trainingFormSchema>;
