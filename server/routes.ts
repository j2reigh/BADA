import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { searchCities } from "../lib/photon_client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // City search endpoint using Photon API
  app.get("/api/cities/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await searchCities(query, 8);
      res.json(results);
    } catch (error) {
      console.error("City search error:", error);
      res.status(500).json({ message: "Failed to search cities" });
    }
  });

  app.post(api.survey.submit.path, async (req, res) => {
    try {
      const input = api.survey.submit.input.parse(req.body);
      const result = await storage.createSurveyResult(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
