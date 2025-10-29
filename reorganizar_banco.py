#!/usr/bin/env python3
"""
Script para reorganizar banco de dados de usuários
Cruza informações de sistema, planilha manual e pagamentos
"""
import csv
import json
import os
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Set

def ler_usuarios_sistema(arquivo: str) -> Dict[str, Dict]:
    """Lê usuários do sistema (Numbers export)"""
    usuarios = {}

    with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            email = row.get('Email', '').strip().lower()
            if not email or email == 'n/a':
                continue

            usuarios[email] = {
                'fonte': 'SISTEMA',
                'id': row.get('ID', ''),
                'nome': row.get('Nome', '').strip(),
                'empresa': row.get('Empresa', '').strip(),
                'funcao': row.get('Função', '').strip(),
                'status': row.get('Status', '').strip(),
                'aprovado': row.get('Aprovado', '').strip(),
                'data_criacao': row.get('Data de Criação', '').strip(),
                'ultima_atividade': row.get('Última Atividade', '').strip(),
                'telefone': row.get('Telefone', '').strip(),
                'plano': row.get('Plano de Assinatura', '').strip(),
                'verificado': row.get('Verificado', '').strip(),
                'email': email
            }

    return usuarios

def ler_usuarios_planilha(arquivo: str) -> Dict[str, Dict]:
    """Lê usuários da planilha manual"""
    usuarios = {}

    with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            email = row.get('EMAIL_LOGIN', '').strip().lower()
            if not email or email == 'aguardando':
                continue

            usuarios[email] = {
                'fonte': 'PLANILHA',
                'nome': row.get('NOME_COMPLETO', '').strip(),
                'telefone': row.get('TELEFONE', '').strip(),
                'indicador': row.get('INDICADOR', '').strip(),
                'obs': row.get('OBS', '').strip(),
                'email': email
            }

    return usuarios

def ler_pagamentos(arquivo: str) -> tuple[Dict[str, List[Dict]], Dict[str, Dict]]:
    """Lê histórico de pagamentos e retorna (histórico por usuário, último status)"""
    pagamentos_por_usuario = defaultdict(list)
    ultimo_status = {}

    with open(arquivo, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            email = row.get('EMAIL_LOGIN', '').strip().lower()
            if not email:
                continue

            pagamento = {
                'email': email,
                'nome': row.get('NOME_COMPLETO', '').strip(),
                'telefone': row.get('TELEFONE', '').strip(),
                'indicador': row.get('INDICADOR', '').strip(),
                'data_pagto': row.get('DATA_PAGTO', '').strip(),
                'mes_pagto': row.get('MÊS_PAGTO', '').strip(),
                'data_venc': row.get('DATA_VENC', '').strip(),
                'status': row.get('STATUS', '').strip(),
                'status_final': row.get('STATUS_FINAL', '').strip(),
                'dias_para_vencer': row.get('DIAS_PARA_VENCER', '').strip(),
                'metodo': row.get('MÉTODO', '').strip(),
                'conta': row.get('CONTA', '').strip(),
                'valor': row.get('VALOR', '').strip(),
                'obs': row.get('OBS', '').strip(),
                'ciclo': row.get('CICLO', '').strip(),
                'total_ciclos': row.get('TOTAL_CICLOS_USUARIO', '').strip(),
                'entrou': row.get('ENTROU', '').strip(),
                'renovou': row.get('RENOVOU', '').strip(),
                'ativo_atual': row.get('ATIVO_ATUAL', '').strip(),
                'churn': row.get('CHURN', '').strip(),
                'regra_tipo': row.get('REGRA_TIPO', '').strip(),
                'elegivel_comissao': row.get('ELEGÍVEL_COMISSÃO', '').strip(),
                'comissao_valor': row.get('COMISSÃO_VALOR', '').strip(),
            }

            pagamentos_por_usuario[email].append(pagamento)

            # Guardar último status conhecido
            if email not in ultimo_status or pagamento['data_pagto']:
                ultimo_status[email] = {
                    'nome': pagamento['nome'],
                    'telefone': pagamento['telefone'],
                    'indicador': pagamento['indicador'],
                    'status_final': pagamento['status_final'],
                    'data_ultimo_pagto': pagamento['data_pagto'],
                    'data_venc': pagamento['data_venc'],
                    'total_ciclos': pagamento['total_ciclos'],
                    'total_pagamentos': 0
                }

    # Contar total de pagamentos
    for email, pagamentos in pagamentos_por_usuario.items():
        if email in ultimo_status:
            ultimo_status[email]['total_pagamentos'] = len(pagamentos)

    return pagamentos_por_usuario, ultimo_status

def consolidar_dados(usuarios_sistema, usuarios_planilha, pagamentos_historico, ultimo_status):
    """Consolida todas as fontes de dados com regras de prioridade"""

    # Coletar todos os emails únicos
    todos_emails = set(usuarios_sistema.keys()) | set(usuarios_planilha.keys()) | set(ultimo_status.keys())

    usuarios_consolidados = []
    alertas = []

    for email in sorted(todos_emails):
        usuario = {
            'email': email,
            'nome': '',
            'telefone': '',
            'indicador': '',
            'plano': '',
            'status_sistema': '',
            'empresa': '',
            'funcao': '',
            'data_criacao': '',
            'ultima_atividade': '',
            'verificado': '',
            'tem_pagamentos': 'NÃO',
            'total_pagamentos': 0,
            'total_ciclos': 0,
            'ultimo_pagamento': '',
            'data_vencimento': '',
            'status_pagamento': '',
            'obs': '',
            'alertas': [],
            'tags': [],
            'fontes': []
        }

        # Dados do sistema (base)
        if email in usuarios_sistema:
            sys_data = usuarios_sistema[email]
            usuario['fontes'].append('SISTEMA')
            usuario['nome'] = sys_data['nome'] or usuario['nome']
            usuario['telefone'] = sys_data['telefone'] or usuario['telefone']
            usuario['plano'] = sys_data['plano']
            usuario['status_sistema'] = sys_data['status']
            usuario['empresa'] = sys_data['empresa']
            usuario['funcao'] = sys_data['funcao']
            usuario['data_criacao'] = sys_data['data_criacao']
            usuario['ultima_atividade'] = sys_data['ultima_atividade']
            usuario['verificado'] = sys_data['verificado']

        # Dados da planilha manual (prioridade alta para indicador e obs)
        if email in usuarios_planilha:
            plan_data = usuarios_planilha[email]
            usuario['fontes'].append('PLANILHA')
            # Nome da planilha tem prioridade (mais detalhado)
            if plan_data['nome']:
                usuario['nome'] = plan_data['nome']
            # Telefone da planilha tem prioridade (mais formatado)
            if plan_data['telefone']:
                usuario['telefone'] = plan_data['telefone']
            # Indicador só vem da planilha
            usuario['indicador'] = plan_data['indicador']
            if plan_data['obs']:
                usuario['obs'] = plan_data['obs']

        # Dados de pagamentos (prioridade máxima para status financeiro)
        if email in ultimo_status:
            pag_data = ultimo_status[email]
            usuario['fontes'].append('PAGAMENTOS')
            usuario['tem_pagamentos'] = 'SIM'
            usuario['total_pagamentos'] = pag_data['total_pagamentos']
            usuario['total_ciclos'] = pag_data['total_ciclos']
            usuario['ultimo_pagamento'] = pag_data['data_ultimo_pagto']
            usuario['data_vencimento'] = pag_data['data_venc']
            usuario['status_pagamento'] = pag_data['status_final']

            # Indicador dos pagamentos como fallback
            if not usuario['indicador'] and pag_data['indicador']:
                usuario['indicador'] = pag_data['indicador']

            # Nome e telefone dos pagamentos como fallback
            if not usuario['nome'] and pag_data['nome']:
                usuario['nome'] = pag_data['nome']
            if not usuario['telefone'] and pag_data['telefone']:
                usuario['telefone'] = pag_data['telefone']

        # Gerar alertas automáticos
        if email in usuarios_sistema and email not in usuarios_planilha:
            usuario['alertas'].append('⚠️ Não está na planilha manual')
            usuario['tags'].append('REVISAR_MANUALMENTE')

        if email in usuarios_sistema and email not in ultimo_status:
            usuario['alertas'].append('🔴 SEM PAGAMENTOS REGISTRADOS')
            usuario['tags'].append('SEM_PAGAMENTO')

        if email not in usuarios_sistema and email in usuarios_planilha:
            usuario['alertas'].append('❌ Na planilha mas não no sistema')
            usuario['tags'].append('FORA_DO_SISTEMA')

        if email in usuarios_sistema and not usuario['indicador']:
            usuario['alertas'].append('ℹ️ Sem indicador definido')
            usuario['tags'].append('SEM_INDICADOR')

        if email in ultimo_status and usuario['status_pagamento'] in ['Inativo', 'Histórico']:
            usuario['alertas'].append('⏸️ Pagamentos inativos')
            usuario['tags'].append('INATIVO')

        if email in ultimo_status and usuario['status_sistema'] == 'Ativo' and usuario['status_pagamento'] in ['Inativo', 'Histórico']:
            usuario['alertas'].append('⚠️ DIVERGÊNCIA: Ativo no sistema mas inativo nos pagamentos')
            usuario['tags'].append('DIVERGENCIA_STATUS')

        # Converter listas para strings
        usuario['alertas_str'] = ' | '.join(usuario['alertas'])
        usuario['tags_str'] = ', '.join(usuario['tags'])
        usuario['fontes_str'] = ', '.join(usuario['fontes'])

        usuarios_consolidados.append(usuario)

    return usuarios_consolidados

def gerar_relatorio_analise(usuarios_consolidados):
    """Gera relatório de análise dos dados"""

    print("\n" + "="*100)
    print("📊 RELATÓRIO DE ANÁLISE - REORGANIZAÇÃO DO BANCO DE DADOS")
    print("="*100)

    # Estatísticas gerais
    total = len(usuarios_consolidados)
    com_pagamento = sum(1 for u in usuarios_consolidados if u['tem_pagamentos'] == 'SIM')
    sem_pagamento = total - com_pagamento
    com_indicador = sum(1 for u in usuarios_consolidados if u['indicador'])
    sem_indicador = total - com_indicador
    com_alertas = sum(1 for u in usuarios_consolidados if u['alertas'])

    print(f"\n📈 ESTATÍSTICAS GERAIS")
    print(f"  Total de usuários únicos: {total}")
    print(f"  Com pagamentos: {com_pagamento} ({com_pagamento/total*100:.1f}%)")
    print(f"  Sem pagamentos: {sem_pagamento} ({sem_pagamento/total*100:.1f}%)")
    print(f"  Com indicador: {com_indicador} ({com_indicador/total*100:.1f}%)")
    print(f"  Sem indicador: {sem_indicador} ({sem_indicador/total*100:.1f}%)")
    print(f"  Com alertas: {com_alertas} ({com_alertas/total*100:.1f}%)")

    # Contar por fonte
    por_fonte = defaultdict(int)
    for u in usuarios_consolidados:
        for fonte in u['fontes']:
            por_fonte[fonte] += 1

    print(f"\n📁 USUÁRIOS POR FONTE")
    for fonte, count in sorted(por_fonte.items(), key=lambda x: x[1], reverse=True):
        print(f"  {fonte}: {count} usuários")

    # Distribuição de planos
    planos = defaultdict(int)
    for u in usuarios_consolidados:
        if u['plano']:
            planos[u['plano']] += 1

    if planos:
        print(f"\n📋 DISTRIBUIÇÃO POR PLANO")
        for plano, count in sorted(planos.items(), key=lambda x: x[1], reverse=True):
            print(f"  {plano}: {count} usuários ({count/total*100:.1f}%)")

    # Top indicadores
    indicadores = defaultdict(int)
    for u in usuarios_consolidados:
        if u['indicador']:
            indicadores[u['indicador']] += 1

    if indicadores:
        print(f"\n👥 TOP 10 INDICADORES")
        for indicador, count in sorted(indicadores.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {indicador}: {count} usuários")

    # Tipos de alertas
    tipos_alertas = defaultdict(int)
    for u in usuarios_consolidados:
        for alerta in u['alertas']:
            tipos_alertas[alerta] += 1

    if tipos_alertas:
        print(f"\n⚠️  ALERTAS GERADOS")
        for alerta, count in sorted(tipos_alertas.items(), key=lambda x: x[1], reverse=True):
            print(f"  {alerta}: {count} usuários")

    # Tags
    tags = defaultdict(int)
    for u in usuarios_consolidados:
        for tag in u['tags']:
            tags[tag] += 1

    if tags:
        print(f"\n🏷️  TAGS ATRIBUÍDAS")
        for tag, count in sorted(tags.items(), key=lambda x: x[1], reverse=True):
            print(f"  {tag}: {count} usuários")

    # Usuários críticos (sem pagamento no sistema)
    usuarios_criticos = [u for u in usuarios_consolidados if u['tem_pagamentos'] == 'NÃO' and 'SISTEMA' in u['fontes']]

    if usuarios_criticos:
        print(f"\n🔴 USUÁRIOS CRÍTICOS (NO SISTEMA SEM PAGAMENTOS) - {len(usuarios_criticos)} usuários")
        print("  Primeiros 20:")
        for i, u in enumerate(usuarios_criticos[:20], 1):
            print(f"  {i}. {u['email']} - {u['nome']} - Plano: {u['plano']}")
        if len(usuarios_criticos) > 20:
            print(f"  ... e mais {len(usuarios_criticos) - 20} usuários")

    # Divergências de status
    divergencias = [u for u in usuarios_consolidados if 'DIVERGENCIA_STATUS' in u['tags']]

    if divergencias:
        print(f"\n⚠️  DIVERGÊNCIAS DE STATUS - {len(divergencias)} usuários")
        print("  Primeiros 20:")
        for i, u in enumerate(divergencias[:20], 1):
            print(f"  {i}. {u['email']} - Sistema: {u['status_sistema']} | Pagamento: {u['status_pagamento']}")
        if len(divergencias) > 20:
            print(f"  ... e mais {len(divergencias) - 20} usuários")

    print("\n" + "="*100)

def salvar_base_consolidada(usuarios_consolidados, arquivo='base_consolidada.csv'):
    """Salva base de dados consolidada"""

    campos = [
        'email', 'nome', 'telefone', 'indicador', 'plano',
        'status_sistema', 'empresa', 'funcao', 'verificado',
        'tem_pagamentos', 'total_pagamentos', 'total_ciclos',
        'ultimo_pagamento', 'data_vencimento', 'status_pagamento',
        'data_criacao', 'ultima_atividade',
        'obs', 'alertas_str', 'tags_str', 'fontes_str'
    ]

    with open(arquivo, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(usuarios_consolidados)

    print(f"\n💾 Base consolidada salva em: {arquivo}")

def gerar_script_importacao(usuarios_consolidados):
    """Gera script para importação no banco"""

    script_lines = []
    script_lines.append("-- Script de importação para banco de dados")
    script_lines.append(f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    script_lines.append(f"-- Total de usuários: {len(usuarios_consolidados)}")
    script_lines.append("")
    script_lines.append("-- PASSO 1: BACKUP DO BANCO ATUAL")
    script_lines.append("-- Faça um backup completo antes de executar este script!")
    script_lines.append("")
    script_lines.append("-- PASSO 2: LIMPEZA (OPCIONAL - USE COM CUIDADO)")
    script_lines.append("-- DELETE FROM usuarios WHERE TRUE;")
    script_lines.append("-- DELETE FROM pagamentos WHERE TRUE;")
    script_lines.append("")
    script_lines.append("-- PASSO 3: IMPORTAR USUÁRIOS CONSOLIDADOS")
    script_lines.append("-- Use o arquivo base_consolidada.csv para importar via:")
    script_lines.append("-- 1. Interface web de importação do sistema")
    script_lines.append("-- 2. Comando SQL COPY (PostgreSQL)")
    script_lines.append("-- 3. Script de importação TypeScript/Prisma")
    script_lines.append("")
    script_lines.append("-- Exemplo PostgreSQL:")
    script_lines.append("-- \\COPY usuarios FROM 'base_consolidada.csv' WITH CSV HEADER DELIMITER ',';")
    script_lines.append("")

    # Estatísticas para o script
    por_plano = defaultdict(int)
    por_status = defaultdict(int)
    for u in usuarios_consolidados:
        por_plano[u['plano'] or 'SEM_PLANO'] += 1
        por_status[u['status_sistema'] or 'SEM_STATUS'] += 1

    script_lines.append("-- ESTATÍSTICAS DA IMPORTAÇÃO:")
    script_lines.append(f"-- Total de usuários: {len(usuarios_consolidados)}")
    for plano, count in sorted(por_plano.items(), key=lambda x: x[1], reverse=True):
        script_lines.append(f"--   {plano}: {count}")
    script_lines.append("")

    with open('script_importacao.sql', 'w', encoding='utf-8') as f:
        f.write('\n'.join(script_lines))

    print(f"💾 Script de importação salvo em: script_importacao.sql")

def gerar_usuarios_para_revisar(usuarios_consolidados):
    """Gera lista de usuários que precisam de revisão manual"""

    para_revisar = [u for u in usuarios_consolidados if u['alertas']]

    if not para_revisar:
        print("\n✅ Nenhum usuário necessita revisão manual!")
        return

    with open('usuarios_para_revisar.csv', 'w', encoding='utf-8', newline='') as f:
        campos = ['email', 'nome', 'plano', 'tem_pagamentos', 'indicador', 'alertas_str', 'tags_str', 'obs']
        writer = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(para_revisar)

    print(f"\n📝 Lista de usuários para revisar salva em: usuarios_para_revisar.csv")
    print(f"   Total: {len(para_revisar)} usuários")

def main():
    print("="*100)
    print("🔄 REORGANIZAÇÃO DO BANCO DE DADOS - SISTEMA DE USUÁRIOS")
    print("="*100)

    # Arquivos de entrada
    arquivo_sistema = "usuarios_2025-10-29_17h45.csv"
    arquivo_planilha = "controle usuarios(USUÁRIOS) (2).csv"
    arquivo_pagamentos = "controle usuarios(PAGAMENTOS) (3).csv"

    # Verificar arquivos
    for arquivo in [arquivo_sistema, arquivo_planilha, arquivo_pagamentos]:
        if not os.path.exists(arquivo):
            print(f"❌ Arquivo não encontrado: {arquivo}")
            return

    print(f"\n📖 Lendo arquivos...")
    print(f"  - Sistema: {arquivo_sistema}")
    usuarios_sistema = ler_usuarios_sistema(arquivo_sistema)
    print(f"    ✅ {len(usuarios_sistema)} usuários")

    print(f"  - Planilha: {arquivo_planilha}")
    usuarios_planilha = ler_usuarios_planilha(arquivo_planilha)
    print(f"    ✅ {len(usuarios_planilha)} usuários")

    print(f"  - Pagamentos: {arquivo_pagamentos}")
    pagamentos_historico, ultimo_status = ler_pagamentos(arquivo_pagamentos)
    print(f"    ✅ {len(ultimo_status)} usuários com pagamentos")
    print(f"    ✅ {sum(len(p) for p in pagamentos_historico.values())} registros de pagamento")

    print(f"\n🔄 Consolidando dados...")
    usuarios_consolidados = consolidar_dados(
        usuarios_sistema,
        usuarios_planilha,
        pagamentos_historico,
        ultimo_status
    )
    print(f"  ✅ {len(usuarios_consolidados)} usuários únicos consolidados")

    # Gerar relatórios e arquivos
    gerar_relatorio_analise(usuarios_consolidados)

    print(f"\n💾 Salvando arquivos de saída...")
    salvar_base_consolidada(usuarios_consolidados)
    gerar_script_importacao(usuarios_consolidados)
    gerar_usuarios_para_revisar(usuarios_consolidados)

    print(f"\n{'='*100}")
    print(f"✅ PROCESSO CONCLUÍDO!")
    print(f"{'='*100}")
    print(f"\nArquivos gerados:")
    print(f"  1. base_consolidada.csv - Base completa para importação")
    print(f"  2. script_importacao.sql - Script com instruções")
    print(f"  3. usuarios_para_revisar.csv - Usuários que precisam revisão")
    print(f"\nPróximos passos:")
    print(f"  1. Revise o relatório acima")
    print(f"  2. Abra usuarios_para_revisar.csv e edite tags/observações")
    print(f"  3. Faça BACKUP do banco de dados atual")
    print(f"  4. Use base_consolidada.csv para importar no sistema")
    print(f"{'='*100}\n")

if __name__ == '__main__':
    main()
