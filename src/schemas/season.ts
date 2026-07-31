import { z } from "zod";

export const seasonFormSchema = z
  .object({
    name: z.string().min(2, "Please enter a season name."),
    startDate: z.string().min(1, "Please enter a start date."),
    endDate: z.string().min(1, "Please enter an end date."),
    description: z.string().trim().optional(),
    objectives: z.string().trim().optional(),
    competitionCategory: z.string().trim().optional(),
    budget: z.coerce.number().min(0, "Budget can't be negative.").optional(),
    colorPrimary: z.string().optional(),
    colorSecondary: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export type SeasonFormInput = z.infer<typeof seasonFormSchema>;
