-- CreateEnum
CREATE TYPE "StatusFinal" AS ENUM ('ATIVO', 'EM_ATRASO', 'INATIVO', 'HISTORICO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX', 'CREDITO', 'DINHEIRO');

-- CreateEnum
CREATE TYPE "ContaFinanceira" AS ENUM ('PXT', 'EAGLE');

-- CreateEnum
CREATE TYPE "RegraTipo" AS ENUM ('PRIMEIRO', 'RECORRENTE');

-- CreateEnum
CREATE TYPE "StatusDespesa" AS ENUM ('PAGO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "TipoLista" AS ENUM ('CONTA', 'METODO', 'CATEGORIA', 'INDICADOR');

-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'IMPORT');

-- CreateEnum
CREATE TYPE "StatusAgenda" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email_login" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "indicador" TEXT,
    "status_final" "StatusFinal" NOT NULL DEFAULT 'INATIVO',
    "metodo" "MetodoPagamento",
    "conta" "ContaFinanceira",
    "ciclo" INTEGER NOT NULL DEFAULT 0,
    "total_ciclos_usuario" INTEGER NOT NULL DEFAULT 0,
    "data_pagto" TIMESTAMP(3),
    "mes_pagto" TEXT,
    "dias_acesso" INTEGER,
    "data_venc" TIMESTAMP(3),
    "dias_para_vencer" INTEGER,
    "vence_hoje" BOOLEAN NOT NULL DEFAULT false,
    "prox_7_dias" BOOLEAN NOT NULL DEFAULT false,
    "em_atraso" BOOLEAN NOT NULL DEFAULT false,
    "obs" TEXT,
    "flag_agenda" BOOLEAN NOT NULL DEFAULT false,
    "mes_ref" TEXT,
    "entrou" BOOLEAN NOT NULL DEFAULT false,
    "renovou" BOOLEAN NOT NULL DEFAULT false,
    "ativo_atual" BOOLEAN NOT NULL DEFAULT false,
    "churn" BOOLEAN NOT NULL DEFAULT false,
    "regra_tipo" "RegraTipo",
    "regra_valor" DECIMAL(65,30),
    "elegivel_comissao" BOOLEAN NOT NULL DEFAULT false,
    "comissao_valor" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_pagto" TIMESTAMP(3) NOT NULL,
    "mes_pagto" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "conta" "ContaFinanceira" NOT NULL,
    "regra_tipo" "RegraTipo" NOT NULL,
    "regra_valor" DECIMAL(65,30) NOT NULL,
    "elegivel_comissao" BOOLEAN NOT NULL,
    "comissao_valor" DECIMAL(65,30),
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "conta" TEXT,
    "indicador" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "StatusDespesa" NOT NULL DEFAULT 'PENDENTE',
    "competencia_mes" INTEGER NOT NULL,
    "competencia_ano" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_venc" TIMESTAMP(3) NOT NULL,
    "dias_para_vencer" INTEGER NOT NULL,
    "status" "StatusAgenda" NOT NULL DEFAULT 'ATIVO',
    "ciclo" INTEGER NOT NULL,
    "renovou" BOOLEAN NOT NULL DEFAULT false,
    "cancelou" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "churn" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_churn" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "revertido" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" TEXT NOT NULL,
    "pagamento_id" TEXT NOT NULL,
    "indicador" TEXT NOT NULL,
    "regra_tipo" "RegraTipo" NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "mes_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prospeccao" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "origem" TEXT,
    "indicador" TEXT,
    "convertido" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prospeccao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas_auxiliares" (
    "id" TEXT NOT NULL,
    "tipo" "TipoLista" NOT NULL,
    "valor" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_auxiliares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "tabela" TEXT NOT NULL,
    "registro_id" TEXT NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "usuario" TEXT,
    "dados_antes" TEXT,
    "dados_depois" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_login_key" ON "usuarios"("email_login");

-- CreateIndex
CREATE UNIQUE INDEX "comissoes_pagamento_id_key" ON "comissoes"("pagamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "prospeccao_usuario_id_key" ON "prospeccao"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "listas_auxiliares_tipo_valor_key" ON "listas_auxiliares"("tipo", "valor");

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "churn" ADD CONSTRAINT "churn_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_pagamento_id_fkey" FOREIGN KEY ("pagamento_id") REFERENCES "pagamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prospeccao" ADD CONSTRAINT "prospeccao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
