import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  company?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a user and their default workspace.
   * Note: Better Auth handles password storage in the Account model.
   * This is used for workspace provisioning after sign-up.
   */
  async create(data: CreateUserData): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          company: data.company,
        },
      });

      // Create a default personal workspace for them
      const defaultWorkspaceName = data.company
        ? `${data.company} Workspace`
        : `${data.name}'s Workspace`;
      const workspaceSlug = defaultWorkspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Handle slug collisions by appending random string if needed
      let slug = workspaceSlug;
      const existingWorkspace = await tx.workspace.findUnique({
        where: { slug },
      });
      if (existingWorkspace) {
        slug = `${workspaceSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }

      await tx.workspace.create({
        data: {
          name: defaultWorkspaceName,
          slug,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      return user;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
