-- AlterTable: Change conta from enum to text in usuarios table
ALTER TABLE "usuarios" ALTER COLUMN "conta" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "conta" TYPE TEXT USING "conta"::TEXT;

-- AlterTable: Change conta from enum to text in pagamentos table
ALTER TABLE "pagamentos" ALTER COLUMN "conta" TYPE TEXT USING "conta"::TEXT;

-- DropEnum: Remove ContaFinanceira enum (if not used elsewhere)
DROP TYPE IF EXISTS "ContaFinanceira";
