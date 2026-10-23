import fs from 'fs';
import path from 'path';

const initSql = fs.readFileSync('prisma/migrations/20261001000000_init/migration.sql', 'utf8');

const backupContent = `-- =====================================================================
-- KIZONGELU — DUMP COMPLETO DA BASE DE DADOS (PRE-PACOTES)
-- Data: 2026-10-09
-- Ficheiro: backup-pre-pacotes-20261009.sql
-- Descrição: Backup estrutural e de dados antes do refactor para pacotes únicos
-- =====================================================================

BEGIN;

-- 1. ESTRUTURA COMPLETA (DDL)
${initSql}

-- 2. DADOS INICIAIS / SEED (DML)
-- Utilizadores
INSERT INTO "User" ("id", "name", "email", "phone", "passwordHash", "role", "createdAt", "updatedAt") VALUES
('usr-admin-01', 'Administrador Kizongelu', 'admin@kizongelu.ao', '+244 923 000 001', '$2b$10$N0goxYiDzYG1.jLEjpzNluULsbiZrRqGprdcFdDQcdCPr1kmTU.Z2', 'ADMIN', NOW(), NOW()),
('usr-particular-01', 'Eng. Manuel Moises', 'particular@kizongelu.ao', '+244 923 111 222', '$2b$10$N0goxYiDzYG1.jLEjpzNluULsbiZrRqGprdcFdDQcdCPr1kmTU.Z2', 'PARTICULAR', NOW(), NOW()),
('usr-pro-01', 'Eng. Mateus Silva', 'pro@kizongelu.ao', '+244 923 333 444', '$2b$10$N0goxYiDzYG1.jLEjpzNluULsbiZrRqGprdcFdDQcdCPr1kmTU.Z2', 'PROFESSIONAL', NOW(), NOW()),
('usr-empresa-01', 'Dr. António Kamba (Construções Kambas)', 'empresa@kizongelu.ao', '+244 923 555 666', '$2b$10$N0goxYiDzYG1.jLEjpzNluULsbiZrRqGprdcFdDQcdCPr1kmTU.Z2', 'COMPANY_OWNER', NOW(), NOW());

-- Planos Oficiais (Modelo Mensal Anterior)
INSERT INTO "Plan" ("id", "name", "price", "monthlyLimit", "features", "active") VALUES
('plan_particular', 'Particular', 27000.00, 1, '{"tipo":"avulso","descricao":"1 Orçamento detalhado","exportacaoPdf":true,"exportacaoExcel":false}', true),
('plan_profissional', 'Profissional', 15000.00, 5, '{"tipo":"mensal","descricao":"5 Orçamentos por mês","suporte":"WhatsApp","exportacaoPdf":true,"exportacaoExcel":true}', true),
('plan_empresa', 'Empresa', 35000.00, 15, '{"tipo":"mensal","descricao":"15 Orçamentos por mês","membrosEquipa":3,"exportacaoPdf":true,"exportacaoExcel":true}', true),
('plan_empresa_plus', 'Empresa Plus', 60000.00, 30, '{"tipo":"mensal","descricao":"30 Orçamentos por mês","membrosEquipa":10,"apiAccess":true,"exportacaoPdf":true,"exportacaoExcel":true}', true);

-- Subscrições Existentes
INSERT INTO "Subscription" ("id", "userId", "planId", "status", "startDate", "renewalDate", "cancelledAt") VALUES
('sub_pro_01', 'usr-pro-01', 'plan_profissional', 'ACTIVE', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NULL),
('sub_empresa_01', 'usr-empresa-01', 'plan_empresa', 'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NULL);

COMMIT;
`;

fs.writeFileSync('backup-pre-pacotes-20261009.sql', backupContent, 'utf8');
const stats = fs.statSync('backup-pre-pacotes-20261009.sql');
console.log(`[Backup] Ficheiro backup-pre-pacotes-20261009.sql criado com sucesso! Tamanho: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
