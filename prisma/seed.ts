import { PrismaClient, TenantStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar plano básico
  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Básico',
      maxProjects: 2,
      maxUsers: 5,
      maxBeneficiaries: 5000,
      availableModules: JSON.stringify(['cadastro', 'atendimento']),
      price: 199.9,
    },
  });

  // Criar plano intermediário
  const intermediatePlan = await prisma.plan.create({
    data: {
      name: 'Intermediário',
      maxProjects: 6,
      maxUsers: 15,
      maxBeneficiaries: 10000,
      availableModules: JSON.stringify(['cadastro', 'atendimento', 'financeiro', 'saude']),
      price: 349.9,
    },
  });

  // Criar plano avançado
  const advancedPlan = await prisma.plan.create({
    data: {
      name: 'Avançado',
      maxProjects: 10,
      maxUsers: 30,
      maxBeneficiaries: 20000,
      availableModules: JSON.stringify([
        'cadastro',
        'atendimento',
        'financeiro',
        'saude',
        'marketing',
      ]),
      price: 599.9,
    },
  });

  // Criar papéis (roles)
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrador com acesso completo',
      isSystemRole: true,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'MANAGER',
      description: 'Gerente com acesso a todos os módulos',
      isSystemRole: true,
    },
  });

  const operatorRole = await prisma.role.create({
    data: {
      name: 'OPERATOR',
      description: 'Operador com acesso limitado',
      isSystemRole: true,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: 'VIEWER',
      description: 'Visualizador com acesso apenas de leitura',
      isSystemRole: true,
    },
  });

  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@integresocial.com.br',
      hashedPassword: adminPassword,
      status: UserStatus.ACTIVE,
    },
  });

  // Criar um tenant de demonstração
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demonstração',
      subdomain: 'demo',
      status: TenantStatus.ACTIVE,
      planId: advancedPlan.id,
    },
  });

  // Associar o usuário admin ao tenant de demonstração
  await prisma.userTenant.create({
    data: {
      userId: adminUser.id,
      tenantId: demoTenant.id,
      roleId: adminRole.id,
    },
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
