/**
 * Script de migração controlada dos valores de momento
 * Converte strings em português para IDs canônicos de MOMENTOS_FIXOS
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const MAPEAMENTO = {
  // Mapeamento principal solicitado
  "Entrada": "ENTRADA",
  "Ato Penitencial": "ATO_PENITENCIAL",
  "Glória": "GLORIA",
  "Gloria": "GLORIA",
  "Salmo": "SALMO",
  "Aclamação ao Evangelho": "ACLAMACAO",
  "Aclamação": "ACLAMACAO",
  "Aclamacao": "ACLAMACAO",
  "Ofertório": "OFERTORIO",
  "Ofertorio": "OFERTORIO",
  "Santo": "SANTO",
  "Comunhão": "COMUNHAO",
  "Comunhao": "COMUNHAO",
  "Final": "FINAL",
  // Variações do grupo de oração (mapeadas para FINAL como fallback)
  "Acolhida": "ENTRADA",
  "Animação": "ENTRADA",
  "Oração/Entrega": "OFERTORIO",
  "Espírito Santo": "COMUNHAO",
  "Palavra": "SALMO",
  "Louvor": "COMUNHAO",
  "Outro": "FINAL",
  "Cordeiro": "COMUNHAO",
};

const IDS_CANONICOS = [
  "ENTRADA", "ATO_PENITENCIAL", "GLORIA", "SALMO",
  "ACLAMACAO", "OFERTORIO", "SANTO", "COMUNHAO", "FINAL"
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  console.log("\n=== DIAGNÓSTICO ANTES DA MIGRAÇÃO ===\n");

  // 1. Ver todos os valores distintos
  const [rows] = await conn.execute(
    "SELECT momento, COUNT(*) as total FROM musicasRepertorioPersonalizado GROUP BY momento ORDER BY total DESC"
  );

  console.log("Valores distintos de momento no banco:");
  let totalParaMigrar = 0;
  let totalJaCanonicos = 0;
  let totalDesconhecidos = 0;

  for (const row of rows) {
    const m = row.momento;
    const count = row.total;
    if (IDS_CANONICOS.includes(m)) {
      console.log(`  ✅ "${m}" → já canônico (${count} registros)`);
      totalJaCanonicos += count;
    } else if (MAPEAMENTO[m]) {
      console.log(`  🔄 "${m}" → "${MAPEAMENTO[m]}" (${count} registros)`);
      totalParaMigrar += count;
    } else {
      console.log(`  ❌ "${m}" → DESCONHECIDO (${count} registros) — será mantido`);
      totalDesconhecidos += count;
    }
  }

  console.log(`\nResumo:`);
  console.log(`  Já canônicos: ${totalJaCanonicos} registros`);
  console.log(`  Para migrar:  ${totalParaMigrar} registros`);
  console.log(`  Desconhecidos: ${totalDesconhecidos} registros`);
  console.log(`  Total na tabela: ${totalJaCanonicos + totalParaMigrar + totalDesconhecidos} registros`);

  if (totalParaMigrar === 0) {
    console.log("\n✅ Nenhum registro para migrar. Banco já está canônico.");
    await conn.end();
    return;
  }

  console.log("\n=== EXECUTANDO MIGRAÇÃO ===\n");

  let totalAtualizado = 0;

  for (const [valorAntigo, valorNovo] of Object.entries(MAPEAMENTO)) {
    if (IDS_CANONICOS.includes(valorAntigo)) continue; // Pular os que já são canônicos

    const [result] = await conn.execute(
      "UPDATE musicasRepertorioPersonalizado SET momento = ? WHERE momento = ?",
      [valorNovo, valorAntigo]
    );

    if (result.affectedRows > 0) {
      console.log(`  ✅ "${valorAntigo}" → "${valorNovo}": ${result.affectedRows} registro(s) atualizados`);
      totalAtualizado += result.affectedRows;
    }
  }

  console.log(`\nTotal atualizado: ${totalAtualizado} registros`);

  console.log("\n=== VALIDAÇÃO PÓS-MIGRAÇÃO ===\n");

  const [rowsApos] = await conn.execute(
    "SELECT momento, COUNT(*) as total FROM musicasRepertorioPersonalizado GROUP BY momento ORDER BY total DESC"
  );

  let invalidos = 0;
  for (const row of rowsApos) {
    const m = row.momento;
    const count = row.total;
    if (IDS_CANONICOS.includes(m)) {
      console.log(`  ✅ "${m}": ${count} registros — canônico`);
    } else {
      console.log(`  ❌ "${m}": ${count} registros — NÃO CANÔNICO`);
      invalidos += count;
    }
  }

  if (invalidos === 0) {
    console.log("\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO — todos os valores são canônicos.");
  } else {
    console.log(`\n⚠️  ATENÇÃO: ${invalidos} registros ainda com valores não canônicos.`);
  }

  await conn.end();
}

main().catch((err) => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
