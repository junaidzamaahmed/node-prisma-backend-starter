import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({ error: "Unauthorized", data: null });
        return;
      }
      let verifiedToken: any = null;
      try {
        verifiedToken = jwt.verify(token as string, process.env.SECRET_KEY!);
      } catch (error) {
        res.status(401).json({ error: "Unauthorized", data: null });
        return;
      }
      const { email, role } = verifiedToken;
      if (!email || !role) {
        res.status(401).json({ error: "Unauthorized", data: null });
        return;
      }
      req.user = verifiedToken;
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        res.status(403).json({ error: "Forbidden", data: null });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
