import { useMutation } from "@tanstack/react-query";
import { api, type InsertSurveyResult } from "@shared/routes";

export function useSubmitSurvey() {
  return useMutation({
    mutationFn: async (data: InsertSurveyResult) => {
      const res = await fetch(api.survey.submit.path, {
        method: api.survey.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to submit survey");
      }

      return api.survey.submit.responses[201].parse(await res.json());
    },
  });
}
