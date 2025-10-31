#!/usr/bin/env python3
"""
Script para analisar e cruzar dados de usuários
"""
import csv
import os
from collections import defaultdict
from typing import Dict, List

def ler_csv(arquivo_csv: str, delimitador: str = ';') -> List[Dict]:
    """Lê o arquivo CSV e retorna lista de usuários"""
    usuarios = []

    if not os.path.exists(arquivo_csv):
        print(f"❌ Arquivo não encontrado: {arquivo_csv}")
        return []

    with open(arquivo_csv, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, delimiter=delimitador)
        for i, row in enumerate(reader, 1):
            # Detectar campo de email
            email_field = None
            for key in row.keys():
                if 'EMAIL' in key.upper() or key.upper() == 'EMAIL':
                    email_field = key
                    break

            if not email_field or not row.get(email_field) or not row[email_field].strip():
                continue

            email = row[email_field].strip().lower()
            if not email or email == 'n/a':
                continue

            # Detectar campos de nome
            nome = ''
            for key in ['NOME_COMPLETO', 'Nome', 'NOME', 'NAME']:
                if key in row and row[key]:
                    nome = row[key].strip()
                    break

            # Detectar campos de telefone
            telefone = ''
            for key in ['TELEFONE', 'Telefone', 'PHONE', 'Celular']:
                if key in row and row[key]:
                    telefone = row[key].strip()
                    if telefone.lower() != 'n/a':
                        break
                    telefone = ''

            # Detectar campos de indicador
            indicador = ''
            for key in ['INDICADOR', 'Indicador', 'INDICATOR']:
                if key in row and row[key]:
                    indicador = row[key].strip()
                    break

            # Detectar plano (se for do arquivo Numbers)
            plano = row.get('Plano de Assinatura', row.get('PLANO', '')).strip()

            # Detectar status
            status = row.get('Status', row.get('STATUS', '')).strip()

            usuarios.append({
                'linha': i,
                'email': email,
                'nome': nome,
                'telefone': telefone,
                'indicador': indicador,
                'plano': plano,
                'status': status,
                'obs': row.get('OBS', row.get('OBSERVACAO', '')).strip(),
                'dados_completos': row
            })

    return usuarios

def analisar_arquivo(nome_arquivo: str, usuarios: List[Dict]):
    """Exibe análise de um arquivo"""
    print(f"\n{'='*80}")
    print(f"📄 ANÁLISE DO ARQUIVO: {nome_arquivo}")
    print(f"{'='*80}")
    print(f"Total de usuários: {len(usuarios)}")

    # Estatísticas
    com_nome = sum(1 for u in usuarios if u['nome'])
    com_telefone = sum(1 for u in usuarios if u['telefone'])
    com_indicador = sum(1 for u in usuarios if u['indicador'])
    com_obs = sum(1 for u in usuarios if u['obs'])
    com_plano = sum(1 for u in usuarios if u.get('plano'))
    com_status = sum(1 for u in usuarios if u.get('status'))

    print(f"  - Com nome completo: {com_nome} ({com_nome/len(usuarios)*100:.1f}%)")
    print(f"  - Com telefone: {com_telefone} ({com_telefone/len(usuarios)*100:.1f}%)")
    print(f"  - Com indicador: {com_indicador} ({com_indicador/len(usuarios)*100:.1f}%)")
    print(f"  - Com observações: {com_obs} ({com_obs/len(usuarios)*100:.1f}%)")
    if com_plano > 0:
        print(f"  - Com plano: {com_plano} ({com_plano/len(usuarios)*100:.1f}%)")
    if com_status > 0:
        print(f"  - Com status: {com_status} ({com_status/len(usuarios)*100:.1f}%)")

    # Planos (se disponível)
    if com_plano > 0:
        planos = defaultdict(int)
        for u in usuarios:
            if u.get('plano'):
                planos[u['plano']] += 1

        if planos:
            print(f"\n  Distribuição por Plano:")
            for plano, count in sorted(planos.items(), key=lambda x: x[1], reverse=True):
                print(f"    - {plano}: {count} usuários ({count/len(usuarios)*100:.1f}%)")

    # Top indicadores
    indicadores = defaultdict(int)
    for u in usuarios:
        if u['indicador']:
            indicadores[u['indicador']] += 1

    if indicadores:
        print(f"\n  Top 10 Indicadores:")
        for indicador, count in sorted(indicadores.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"    - {indicador}: {count} usuários")

    # Emails duplicados
    emails_count = defaultdict(list)
    for u in usuarios:
        emails_count[u['email']].append(u['linha'])

    duplicados = {email: linhas for email, linhas in emails_count.items() if len(linhas) > 1}
    if duplicados:
        print(f"\n  ⚠️  Emails duplicados encontrados: {len(duplicados)}")
        for email, linhas in list(duplicados.items())[:5]:
            print(f"    - {email}: linhas {linhas}")
        if len(duplicados) > 5:
            print(f"    ... e mais {len(duplicados) - 5} duplicados")

def cruzar_arquivos(usuarios1: List[Dict], usuarios2: List[Dict], nome1: str, nome2: str):
    """Cruza dados entre dois arquivos"""
    print(f"\n{'='*80}")
    print(f"🔄 CRUZAMENTO DE DADOS")
    print(f"{'='*80}")

    # Criar índices por email
    emails1 = {u['email']: u for u in usuarios1}
    emails2 = {u['email']: u for u in usuarios2}

    # Encontrar interseções e diferenças
    emails_ambos = set(emails1.keys()) & set(emails2.keys())
    apenas_1 = set(emails1.keys()) - set(emails2.keys())
    apenas_2 = set(emails2.keys()) - set(emails1.keys())

    print(f"\n📊 Resumo:")
    print(f"  - Usuários em ambos os arquivos: {len(emails_ambos)}")
    print(f"  - Somente em {nome1}: {len(apenas_1)}")
    print(f"  - Somente em {nome2}: {len(apenas_2)}")
    print(f"  - Total único: {len(emails1.keys() | emails2.keys())}")

    # Usuários somente no primeiro arquivo
    if apenas_1:
        print(f"\n{'='*80}")
        print(f"📱 USUÁRIOS SOMENTE EM {nome1} (primeiros 20):")
        print(f"{'='*80}")
        for i, email in enumerate(sorted(apenas_1)[:20], 1):
            u = emails1[email]
            print(f"{i}. {email}")
            if u['nome']:
                print(f"   Nome: {u['nome']}")
            if u['telefone']:
                print(f"   Telefone: {u['telefone']}")
            if u['indicador']:
                print(f"   Indicador: {u['indicador']}")
            if u.get('plano'):
                print(f"   Plano: {u['plano']}")
            if u.get('status'):
                print(f"   Status: {u['status']}")

        if len(apenas_1) > 20:
            print(f"\n... e mais {len(apenas_1) - 20} usuários")

    # Usuários somente no segundo arquivo
    if apenas_2:
        print(f"\n{'='*80}")
        print(f"📄 USUÁRIOS SOMENTE EM {nome2} (primeiros 20):")
        print(f"{'='*80}")
        for i, email in enumerate(sorted(apenas_2)[:20], 1):
            u = emails2[email]
            print(f"{i}. {email}")
            if u['nome']:
                print(f"   Nome: {u['nome']}")
            if u['telefone']:
                print(f"   Telefone: {u['telefone']}")
            if u['indicador']:
                print(f"   Indicador: {u['indicador']}")
            if u.get('plano'):
                print(f"   Plano: {u['plano']}")
            if u.get('status'):
                print(f"   Status: {u['status']}")

        if len(apenas_2) > 20:
            print(f"\n... e mais {len(apenas_2) - 20} usuários")

    # Diferenças nos dados para usuários em ambos
    diferencas = []
    for email in emails_ambos:
        u1 = emails1[email]
        u2 = emails2[email]

        diffs = []
        if u1['nome'].upper() != u2['nome'].upper() and u1['nome'] and u2['nome']:
            diffs.append(f"Nome: '{u1['nome']}' vs '{u2['nome']}'")
        if u1['telefone'] != u2['telefone'] and u1['telefone'] and u2['telefone']:
            diffs.append(f"Telefone: '{u1['telefone']}' vs '{u2['telefone']}'")
        if u1['indicador'] != u2['indicador'] and u1['indicador'] and u2['indicador']:
            diffs.append(f"Indicador: '{u1['indicador']}' vs '{u2['indicador']}'")

        if diffs:
            diferencas.append({'email': email, 'diffs': diffs})

    if diferencas:
        print(f"\n{'='*80}")
        print(f"⚠️  DIFERENÇAS NOS DADOS (primeiros 20 de {len(diferencas)}):")
        print(f"{'='*80}")
        for i, item in enumerate(diferencas[:20], 1):
            print(f"{i}. {item['email']}")
            for diff in item['diffs']:
                print(f"   - {diff}")

        if len(diferencas) > 20:
            print(f"\n... e mais {len(diferencas) - 20} com diferenças")

    # Salvar resultados
    salvar_resultados(emails1, emails2, emails_ambos, apenas_1, apenas_2, diferencas)

def salvar_resultados(emails1, emails2, emails_ambos, apenas_1, apenas_2, diferencas):
    """Salva resultados em arquivos CSV"""

    # Usuários somente no arquivo 1
    if apenas_1:
        with open('usuarios_somente_arquivo1.csv', 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['EMAIL', 'NOME', 'TELEFONE', 'INDICADOR', 'PLANO', 'STATUS', 'OBS'])
            for email in sorted(apenas_1):
                u = emails1[email]
                writer.writerow([
                    u['email'], u['nome'], u['telefone'], u['indicador'],
                    u.get('plano', ''), u.get('status', ''), u['obs']
                ])
        print(f"\n💾 Salvos usuários somente no arquivo 1: usuarios_somente_arquivo1.csv")

    # Usuários somente no arquivo 2
    if apenas_2:
        with open('usuarios_somente_arquivo2.csv', 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['EMAIL', 'NOME', 'TELEFONE', 'INDICADOR', 'PLANO', 'STATUS', 'OBS'])
            for email in sorted(apenas_2):
                u = emails2[email]
                writer.writerow([
                    u['email'], u['nome'], u['telefone'], u['indicador'],
                    u.get('plano', ''), u.get('status', ''), u['obs']
                ])
        print(f"💾 Salvos usuários somente no arquivo 2: usuarios_somente_arquivo2.csv")

    # Usuários em ambos
    if emails_ambos:
        with open('usuarios_em_ambos.csv', 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['EMAIL', 'NOME', 'TELEFONE', 'INDICADOR', 'PLANO', 'STATUS', 'OBS'])
            for email in sorted(emails_ambos):
                u = emails1[email]
                writer.writerow([
                    u['email'], u['nome'], u['telefone'], u['indicador'],
                    u.get('plano', ''), u.get('status', ''), u['obs']
                ])
        print(f"💾 Salvos usuários em ambos os arquivos: usuarios_em_ambos.csv")

    # Diferenças
    if diferencas:
        with open('usuarios_com_diferencas.csv', 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['EMAIL', 'DIFERENCAS'])
            for item in diferencas:
                writer.writerow([item['email'], ' | '.join(item['diffs'])])
        print(f"💾 Salvos usuários com diferenças: usuarios_com_diferencas.csv")

def main():
    print("="*80)
    print("📊 ANÁLISE E CRUZAMENTO DE DADOS DE USUÁRIOS")
    print("="*80)

    # Arquivo 1 (CSV existente)
    arquivo1 = "controle usuarios(USUÁRIOS) (2).csv"
    usuarios1 = ler_csv(arquivo1, delimitador=';')

    if not usuarios1:
        print(f"\n❌ Não foi possível ler o arquivo: {arquivo1}")
        return

    analisar_arquivo(arquivo1, usuarios1)

    # Arquivo 2 (.numbers convertido para CSV)
    arquivo2_opcoes = [
        "usuarios_2025-10-29_17h45.csv",  # Se você exportar manualmente
        "usuarios.csv",  # Nome alternativo
    ]

    arquivo2 = None
    for opcao in arquivo2_opcoes:
        if os.path.exists(opcao):
            arquivo2 = opcao
            break

    if arquivo2:
        # Usar delimitador correto para arquivo Numbers exportado
        usuarios2 = ler_csv(arquivo2, delimitador=';')
        if usuarios2:
            analisar_arquivo(arquivo2, usuarios2)
            cruzar_arquivos(usuarios1, usuarios2, arquivo1, arquivo2)
        else:
            print(f"\n⚠️  Não foi possível ler usuários do arquivo: {arquivo2}")
    else:
        print(f"\n{'='*80}")
        print(f"ℹ️  SEGUNDO ARQUIVO NÃO ENCONTRADO")
        print(f"{'='*80}")
        print(f"\nPara fazer o cruzamento completo:")
        print(f"1. Abra o arquivo 'usuarios_2025-10-29_17h45.numbers' no Numbers")
        print(f"2. Vá em Arquivo > Exportar > CSV...")
        print(f"3. Salve como 'usuarios_2025-10-29_17h45.csv' nesta pasta")
        print(f"4. Execute este script novamente: python3 analisar_usuarios.py")

    print(f"\n{'='*80}")
    print(f"✅ ANÁLISE CONCLUÍDA")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()
