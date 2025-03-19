import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from './prisma.service';

export interface TenantContext {
  tenantId: string | null;
}

// AsyncLocalStorage para armazenar o contexto do tenant na requisição
export const tenantContext = new AsyncLocalStorage<TenantContext>();

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  static use(prismaService: PrismaService) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Obter o tenant do subdomínio ou do header
      const subdomain = req.hostname.split('.')[0];
      let tenantId = null;

      if (subdomain && subdomain !== 'login' && subdomain !== 'api' && subdomain !== 'www') {
        // Buscar o tenant pelo subdomínio
        const tenant = await prismaService.tenant.findUnique({
          where: { subdomain },
          select: { id: true, status: true },
        });

        if (tenant && tenant.status === 'ACTIVE') {
          tenantId = tenant.id;
        }
      } else {
        // Para o portal central de autenticação, não é necessário um tenant
        tenantId = null;
      }

      // Executar a função no contexto do tenant
      tenantContext.run({ tenantId }, () => {
        next();
      });
    };
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Esse método não é utilizado diretamente
    next();
  }
}
