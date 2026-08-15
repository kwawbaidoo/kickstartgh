import { z } from "zod";

export const seasonFormSchema = z
  .object({
    name: z.string().min(2, "Please enter a season name."),
    start_date: z.string().min(1, "Please enter a start date."),
    end_date: z.string().min(1, "Please enter an end date."),
    description: z.string().trim().optional(),
    objectives: z.string().trim().optional(),
    competition_category: z.string().trim().optional(),
    budget: z.coerce.number().min(0, "Budget can't be negative.").optional(),
    color_primary: z.string().optional(),
    color_secondary: z.string().optional(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after the start date.",
    path: ["end_date"],
  });

export type SeasonFormInput = z.infer<typeof seasonFormSchema>;
