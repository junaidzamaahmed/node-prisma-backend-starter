import { db } from "@/utils/db";
import { NextFunction, Request, RequestHandler, Response } from "express";
import bycript from "bcrypt";
import { Role } from "@prisma/client";
import { Resend } from "resend";
import { generateVerificationEmailHTML } from "@/utils/generateEmail";

export const getUsers: RequestHandler = async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isVerified: true,
      },
    });
    res.status(200).json({ error: null, data: users });
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const getUserById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const notAuthorized =
    req.user?.role !== Role.ADMIN && Number(req.user?.id) !== Number(id);
  if (notAuthorized || !id || parseInt(id) < 0 || isNaN(parseInt(id))) {
    res.status(400).json({ error: "Invalid ID", data: null });
    return;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
    } else {
      res.status(200).json({ error: null, data: user });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);
const generateToken = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const createUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, image } = req.body;
  try {
    const hashedPassword = await bycript.hash(
      password,
      Number(process.env.BYCRYPT_SALT_ROUNDS)
    );
    const isExisting = await db.user.findFirst({
      where: {
        email,
      },
    });
    if (isExisting) {
      res.status(409).json({ error: "User already exists", data: null });
    } else {
      const verificationCode = generateToken().toString();

      const user = await db.user.create({
        data: {
          name,
          email,
          image: image || "",
          password: hashedPassword,
          verificationCode,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });

      // Send email to user for email verification
      const { data, error } = await resend.emails.send({
        from: "Unilink <unilink@softyse.com>",
        to: [email],
        subject: "Email Verification Code",
        html: generateVerificationEmailHTML({
          name: user.name,
          code: verificationCode,
          link: `${process.env.CLIENT_URL}/`,
        }),
      });

      next();
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const updateUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const values = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
    } else {
      const updatedUser = await db.user.update({
        where: {
          id: parseInt(id),
        },
        data: {
          ...values,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      });
      res.status(200).json({ error: null, data: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};

export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const user = await db.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
    } else {
      await db.user.delete({
        where: {
          id: parseInt(id),
        },
      });
      res.status(200).json({ error: null, data: "User deleted" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred", data: null });
  }
};
