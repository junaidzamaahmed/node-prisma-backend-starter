import { db } from "@/utils/db";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bycript from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/utils/generateJWT";
import { addMinutes } from "date-fns";
import { Resend } from "resend";
import { generatePasswordResetEmailHTML } from "@/utils/generateEmail";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY);

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Invalid credentials", data: null });
    } else {
      const passwordMatch = await bycript.compare(password, user.password);
      if (passwordMatch) {
        const { password, ...userWithoutPassword } = user;
        const accessToken = generateAccessToken(userWithoutPassword);
        const refreshToken = generateRefreshToken(userWithoutPassword);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.status(200).json({
          error: null,
          data: {
            accessToken,
            isVerified: user.isVerified,
          },
        });
      } else {
        res.status(401).json({ error: "Invalid credentials", data: null });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const verifyUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { email, verificationCode } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email: email as string,
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        verificationCode: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
    } else {
      if (user.isVerified) {
        res.status(200).json({
          error: null,
          data: {
            message: "User is already verified",
          },
        });
      } else {
        if (user.verificationCode !== verificationCode) {
          res.status(401).json({
            error: "Invalid verification code",
            data: null,
          });
        } else {
          const updatedUser = await db.user.update({
            where: {
              email: email as string,
            },
            data: {
              isVerified: true,
            },
            select: {
              id: true,
              email: true,
              isVerified: true,
            },
          });
          res.status(200).json({
            error: null,
            data: {
              message: "User has been verified",
            },
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const refreshToken: any = async (req: Request, res: Response) => {
  const refreshTokenVar = req.cookies.refreshToken;
  if (!refreshTokenVar) {
    return res.status(401).json({ error: "Unauthorized", data: null });
  }
  try {
    let verifiedToken: any = null;
    try {
      verifiedToken = jwt.verify(
        refreshTokenVar,
        process.env.REFRESH_SECRET_KEY!
      );
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized", data: null });
    }
    const { email } = verifiedToken;
    if (!email) {
      return res.status(401).json({ error: "Unauthorized", data: null });
    }
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", data: null });
    }
    const accessToken = generateAccessToken(user);
    res.status(200).json({
      error: null,
      data: {
        accessToken,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

const generateToken = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
      },
    });

    if (!user) {
      res.status(200).json({
        error: null,
        data: {
          message:
            "A password reset email has been sent. It will expire within 24 hours.",
        },
      });
    } else {
      const resetToken = generateToken().toString();
      const resetTokenExpiry = addMinutes(new Date(), 1440);
      const currentTime = new Date();

      const updatedUser = await db.user.update({
        where: {
          email,
        },
        data: {
          resetToken,
          resetTokenExpiry,
        },
        select: {
          name: true,
          email: true,
        },
      });
      const { data, error } = await resend.emails.send({
        from: "Unilink <unilink@softyse.com>",
        to: [email],
        subject: "Password Reset Request",
        html: generatePasswordResetEmailHTML({
          name: updatedUser.name,
          code: resetToken,
          link: `${process.env.CLIENT_URL}/${email}/reset-password/${resetToken}`,
        }),
      });

      res.status(200).json({
        error: null,
        data: {
          resetToken,
          resetTokenExpiry,
          currentTime,
          message:
            "A password reset email has been sent. It will expire within 24 hours.",
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { resetToken } = req.query;
  const { email, password } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ error: "Invalid token or token has expired", data: null });
    } else {
      const isTokenValid = user.resetToken === resetToken;
      const isTokenExpired = new Date(user.resetTokenExpiry!) < new Date();
      if (isTokenValid && !isTokenExpired) {
        const hashedPassword = await bycript.hash(
          password,
          Number(process.env.BYCRYPT_SALT_ROUNDS)!
        );
        const updatedUser = await db.user.update({
          where: {
            email,
          },
          data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
          },
          select: {
            email: true,
          },
        });
        next();
      } else {
        res.status(401).json({
          error: "Invalid token or token has expired",
          data: null,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};
