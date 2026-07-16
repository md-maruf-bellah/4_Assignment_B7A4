import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/AppError";
import { prisma } from "../lib/prisma";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "TENANT" | "LANDLORD";
}

const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: input.role,
    },
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  const { password, ...safeUser } = user;
  return { user: safeUser, token };
};

const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === "BANNED") {
    throw new ForbiddenError("Your account has been banned. Contact support.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError("User not found");
  }
  const { password, ...safeUser } = user;
  return safeUser;
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
};
