import { z } from "zod";

import { matchTypeOptions } from "@/config/matches";
import type { MatchType } from "@/mock/matches";

export const matchFormSchema = z.object({
  opponent: z.string().min(2, "Please enter the opponent's name."),
  competition: z.string().min(2, "Please enter a competition."),
  matchType: z.enum(matchTypeOptions as [MatchType, ...MatchType[]], {
    error: "Please select a match type.",
  }),
  venue: z.string().min(2, "Please enter a venue."),
  homeAway: z.enum(["Home", "Away"], { error: "Please select home or away." }),
  date: z.string().min(1, "Please select a match date."),
  kickoffTime: z.string().min(1, "Please select a kickoff time."),
  referee: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  poster: z.string().optional(),
});

export type MatchFormInput = z.infer<typeof matchFormSchema>;
