import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';

class SubscribeDto {
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    source?: string;
}

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
    constructor(private readonly resources: ResourcesService) { }

    @Get()
    @ApiOperation({ summary: 'List published resource articles' })
    list() {
        return this.resources.list();
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get a single resource article by slug' })
    getOne(@Param('slug') slug: string) {
        return this.resources.getBySlug(slug);
    }

    @Post('subscribe')
    @ApiOperation({ summary: 'Subscribe to the newsletter' })
    subscribe(@Body() body: SubscribeDto) {
        return this.resources.subscribe(body.email, body.source);
    }
}
