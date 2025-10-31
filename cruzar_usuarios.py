#!/usr/bin/env python3
"""
Script para cruzar dados de usuários entre arquivo .numbers e CSV
"""
import csv
import json
import zipfile
import os
from typing import Dict, List, Set

def ler_csv(arquivo_csv: str) -> List[Dict]:
    """Lê o arquivo CSV e retorna lista de usuários"""
    usuarios = []

    with open(arquivo_csv, 'r', encoding='utf-8', errors='ignore') as f:
        # O CSV usa ; como delimitador
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            if row.get('EMAIL_LOGIN') and row['EMAIL_LOGIN'].strip():
                usuarios.append({
                    'email': row['EMAIL_LOGIN'].strip().lower(),
                    'nome': row.get('NOME_COMPLETO', '').strip(),
                    'telefone': row.get('TELEFONE', '').strip(),
                    'indicador': row.get('INDICADOR', '').strip(),
                    'obs': row.get('OBS', '').strip()
                })

    return usuarios

def tentar_extrair_numbers(arquivo_numbers: str):
    """Tenta extrair dados do arquivo .numbers"""
    try:
        # Tentar usar numbers-parser se disponível
        import numbers_parser
        doc = numbers_parser.Document(arquivo_numbers)
        sheets = doc.sheets

        dados = []
        for sheet in sheets:
            tables = sheet.tables
            for table in tables:
                num_rows = table.num_rows
                num_cols = table.num_cols

                # Tentar ler cabeçalhos
                headers = []
                for col in range(num_cols):
                    cell = table.cell(0, col)
                    headers.append(str(cell.value) if cell.value else f'Col{col}')

                # Ler dados
                for row in range(1, num_rows):
                    row_data = {}
                    for col in range(num_cols):
                        cell = table.cell(row, col)
                        value = cell.value if cell.value is not None else ''
                        row_data[headers[col]] = str(value).strip()

                    # Adicionar apenas se tiver email
                    if any('EMAIL' in k.upper() or 'E-MAIL' in k.upper() for k in row_data.keys()):
                        for key in row_data.keys():
                            if 'EMAIL' in key.upper() or 'E-MAIL' in key.upper():
                                if row_data[key]:
                                    dados.append(row_data)
                                    break

        return dados

    except ImportError:
        print("⚠️  Biblioteca 'numbers-parser' não encontrada")
        print("   Instalando numbers-parser...")
        import subprocess
        try:
            subprocess.check_call([
                'python3', '-m', 'pip', 'install', 'numbers-parser', '--quiet'
            ])
            print("✅ Biblioteca instalada! Tentando novamente...")
            return tentar_extrair_numbers(arquivo_numbers)
        except:
            print("❌ Não foi possível instalar numbers-parser")
            return None

    except Exception as e:
        print(f"❌ Erro ao extrair .numbers: {e}")
        return None

def normalizar_email(email: str) -> str:
    """Normaliza email para comparação"""
    return email.strip().lower().replace(' ', '')

def cruzar_dados(dados_numbers: List[Dict], dados_csv: List[Dict]):
    """Cruza os dados entre os dois arquivos"""

    # Criar dicionários indexados por email
    emails_csv = {normalizar_email(u['email']): u for u in dados_csv}

    # Resultados
    somente_numbers = []
    somente_csv = []
    em_ambos = []
    diferencas = []

    # Processar dados do .numbers
    for usuario_numbers in dados_numbers:
        # Encontrar campo de email
        email_field = None
        for key in usuario_numbers.keys():
            if 'EMAIL' in key.upper() or 'E-MAIL' in key.upper():
                email_field = key
                break

        if not email_field or not usuario_numbers[email_field]:
            continue

        email = normalizar_email(usuario_numbers[email_field])

        if email in emails_csv:
            # Usuário existe em ambos
            usuario_csv = emails_csv[email]
            em_ambos.append({
                'email': email,
                'numbers': usuario_numbers,
                'csv': usuario_csv
            })

            # Verificar diferenças
            diffs = []
            if usuario_numbers.get('NOME_COMPLETO', '').upper() != usuario_csv['nome'].upper():
                if usuario_numbers.get('NOME_COMPLETO'):
                    diffs.append(f"Nome diferente: '{usuario_numbers.get('NOME_COMPLETO')}' vs '{usuario_csv['nome']}'")

            if diffs:
                diferencas.append({
                    'email': email,
                    'diferencas': diffs
                })
        else:
            # Usuário só no .numbers
            somente_numbers.append(usuario_numbers)

    # Emails só no CSV
    emails_numbers_set = set()
    for u in dados_numbers:
        for key in u.keys():
            if 'EMAIL' in key.upper() or 'E-MAIL' in key.upper():
                if u[key]:
                    emails_numbers_set.add(normalizar_email(u[key]))
                    break

    for email, usuario in emails_csv.items():
        if email not in emails_numbers_set:
            somente_csv.append(usuario)

    return {
        'somente_numbers': somente_numbers,
        'somente_csv': somente_csv,
        'em_ambos': em_ambos,
        'diferencas': diferencas
    }

def gerar_relatorio(resultado: Dict):
    """Gera relatório do cruzamento"""

    print("\n" + "="*80)
    print("📊 RELATÓRIO DE CRUZAMENTO DE DADOS DE USUÁRIOS")
    print("="*80)

    print(f"\n✅ Em ambos os arquivos: {len(resultado['em_ambos'])} usuários")
    print(f"📱 Somente no arquivo .numbers: {len(resultado['somente_numbers'])} usuários")
    print(f"📄 Somente no arquivo CSV: {len(resultado['somente_csv'])} usuários")
    print(f"⚠️  Com diferenças: {len(resultado['diferencas'])} usuários")

    # Usuários somente no .numbers
    if resultado['somente_numbers']:
        print("\n" + "-"*80)
        print("📱 USUÁRIOS SOMENTE NO ARQUIVO .NUMBERS:")
        print("-"*80)
        for i, usuario in enumerate(resultado['somente_numbers'][:20], 1):
            email = ''
            nome = ''
            for key, value in usuario.items():
                if 'EMAIL' in key.upper():
                    email = value
                elif 'NOME' in key.upper():
                    nome = value
            print(f"{i}. {email} - {nome}")

        if len(resultado['somente_numbers']) > 20:
            print(f"... e mais {len(resultado['somente_numbers']) - 20} usuários")

    # Usuários somente no CSV
    if resultado['somente_csv']:
        print("\n" + "-"*80)
        print("📄 USUÁRIOS SOMENTE NO ARQUIVO CSV:")
        print("-"*80)
        for i, usuario in enumerate(resultado['somente_csv'][:20], 1):
            print(f"{i}. {usuario['email']} - {usuario['nome']}")

        if len(resultado['somente_csv']) > 20:
            print(f"... e mais {len(resultado['somente_csv']) - 20} usuários")

    # Diferenças
    if resultado['diferencas']:
        print("\n" + "-"*80)
        print("⚠️  USUÁRIOS COM DIFERENÇAS ENTRE OS ARQUIVOS:")
        print("-"*80)
        for i, item in enumerate(resultado['diferencas'][:20], 1):
            print(f"{i}. {item['email']}")
            for diff in item['diferencas']:
                print(f"   - {diff}")

        if len(resultado['diferencas']) > 20:
            print(f"... e mais {len(resultado['diferencas']) - 20} usuários com diferenças")

    print("\n" + "="*80)

    # Salvar resultados detalhados em JSON
    with open('resultado_cruzamento.json', 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print("💾 Resultados detalhados salvos em: resultado_cruzamento.json")
    print("="*80 + "\n")

def main():
    arquivo_numbers = "usuarios_2025-10-29_17h45.numbers"
    arquivo_csv = "controle usuarios(USUÁRIOS) (2).csv"

    # Verificar se arquivos existem
    if not os.path.exists(arquivo_csv):
        print(f"❌ Arquivo CSV não encontrado: {arquivo_csv}")
        return

    if not os.path.exists(arquivo_numbers):
        print(f"❌ Arquivo .numbers não encontrado: {arquivo_numbers}")
        return

    print("📖 Lendo arquivo CSV...")
    dados_csv = ler_csv(arquivo_csv)
    print(f"   ✅ {len(dados_csv)} usuários encontrados no CSV")

    print("\n📖 Tentando extrair dados do arquivo .numbers...")
    dados_numbers = tentar_extrair_numbers(arquivo_numbers)

    if dados_numbers is None:
        print("\n⚠️  Não foi possível extrair dados do arquivo .numbers automaticamente.")
        print("    Por favor, abra o arquivo no Numbers e exporte como CSV,")
        print("    depois execute novamente este script.")
        return

    print(f"   ✅ {len(dados_numbers)} usuários encontrados no .numbers")

    print("\n🔄 Cruzando dados...")
    resultado = cruzar_dados(dados_numbers, dados_csv)

    gerar_relatorio(resultado)

if __name__ == '__main__':
    main()
