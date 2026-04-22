import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RESOURCE_ARTICLES, ResourceArticle } from './resources.data';

@Injectable()
export class ResourcesService {
    private readonly logger = new Logger(ResourcesService.name);

    constructor(private readonly prisma: PrismaService) { }

    list(): Omit<ResourceArticle, 'body'>[] {
        return RESOURCE_ARTICLES.map(({ body: _body, ...rest }) => rest);
    }

    getBySlug(slug: string): ResourceArticle {
        const article = RESOURCE_ARTICLES.find((a) => a.slug === slug);
        if (!article) {
            throw new NotFoundException(`Article not found: ${slug}`);
        }
        return article;
    }

    async subscribe(email: string, source = 'landing'): Promise<{ ok: true }> {
        const normalized = email.trim().toLowerCase();
        try {
            await this.prisma.newsletterSubscriber.create({
                data: { email: normalized, source },
            });
            this.logger.log(`📬 New subscriber: ${normalized} (${source})`);
            return { ok: true };
        } catch (e) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                // Already subscribed — treat as success (idempotent)
                return { ok: true };
            }
            throw new ConflictException('Could not subscribe at this time');
        }
    }
}
