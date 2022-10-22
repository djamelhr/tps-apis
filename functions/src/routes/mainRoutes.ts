import { Router, Request, Response } from "express";
import { scrape } from "../trueApi/scraper";
const router = Router();

router.post("/tps", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const results = await scrape(name);
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
});

export default router;
