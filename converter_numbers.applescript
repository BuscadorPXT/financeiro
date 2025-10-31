#!/usr/bin/osascript

-- Script para converter arquivo Numbers para CSV
tell application "Numbers"
	activate

	-- Abrir o arquivo
	set theFile to POSIX file "/Users/jonathanmachado/Documents/FINANCASBUSCADOR/usuarios_2025-10-29_17h45.numbers"
	open theFile

	-- Esperar um pouco para o arquivo abrir
	delay 2

	-- Exportar para CSV
	tell front document
		export to file "/Users/jonathanmachado/Documents/FINANCASBUSCADOR/usuarios_2025-10-29_17h45.csv" as CSV
	end tell

	-- Fechar sem salvar
	close front document saving no

	-- Sair
	quit
end tell
