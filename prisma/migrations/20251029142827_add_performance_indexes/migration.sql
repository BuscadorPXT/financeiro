-- CreateIndex
CREATE INDEX "usuarios_status_final_ativo_atual_idx" ON "usuarios"("status_final", "ativo_atual");

-- CreateIndex
CREATE INDEX "usuarios_data_venc_idx" ON "usuarios"("data_venc");

-- CreateIndex
CREATE INDEX "usuarios_indicador_idx" ON "usuarios"("indicador");

-- CreateIndex
CREATE INDEX "usuarios_vence_hoje_prox_7_dias_em_atraso_idx" ON "usuarios"("vence_hoje", "prox_7_dias", "em_atraso");

-- CreateIndex
CREATE INDEX "pagamentos_usuario_id_data_pagto_idx" ON "pagamentos"("usuario_id", "data_pagto");

-- CreateIndex
CREATE INDEX "pagamentos_mes_pagto_regra_tipo_idx" ON "pagamentos"("mes_pagto", "regra_tipo");

-- CreateIndex
CREATE INDEX "pagamentos_metodo_conta_idx" ON "pagamentos"("metodo", "conta");

-- CreateIndex
CREATE INDEX "despesas_competencia_mes_competencia_ano_idx" ON "despesas"("competencia_mes", "competencia_ano");

-- CreateIndex
CREATE INDEX "despesas_categoria_idx" ON "despesas"("categoria");

-- CreateIndex
CREATE INDEX "agenda_usuario_id_status_idx" ON "agenda"("usuario_id", "status");

-- CreateIndex
CREATE INDEX "agenda_data_venc_idx" ON "agenda"("data_venc");

-- CreateIndex
CREATE INDEX "comissoes_indicador_mes_ref_idx" ON "comissoes"("indicador", "mes_ref");

-- CreateIndex
CREATE INDEX "comissoes_regra_tipo_idx" ON "comissoes"("regra_tipo");
