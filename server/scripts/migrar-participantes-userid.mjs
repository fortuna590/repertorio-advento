/**
 * Script de migração para vincular userId aos participantes antigos
 * 
 * Este script busca todos os participantes que têm email mas não têm userId vinculado,
 * e tenta encontrar o usuário correspondente pelo email para vincular o userId.
 * 
 * Uso: node server/scripts/migrar-participantes-userid.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { participantesEscala, users } from '../../drizzle/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

async function migrarParticipantes() {
  console.log('🔄 Iniciando migração de participantes...\n');

  // Conectar ao banco
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Buscar participantes sem userId mas com email
    const participantesSemUserId = await db
      .select()
      .from(participantesEscala)
      .where(
        and(
          isNull(participantesEscala.userId),
          isNotNull(participantesEscala.email)
        )
      );

    console.log(`📊 Encontrados ${participantesSemUserId.length} participantes sem userId vinculado\n`);

    let atualizados = 0;
    let naoEncontrados = 0;

    for (const participante of participantesSemUserId) {
      if (!participante.email) {
        console.log(`⚠️  Participante ${participante.id} (${participante.nome}) não tem email - pulando`);
        continue;
      }

      // Buscar usuário pelo email
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.email, participante.email));

      if (usuario) {
        // Atualizar participante com userId
        await db
          .update(participantesEscala)
          .set({ userId: usuario.id })
          .where(eq(participantesEscala.id, participante.id));

        console.log(`✅ Participante ${participante.id} (${participante.nome}) vinculado ao usuário ${usuario.id} (${usuario.name})`);
        atualizados++;
      } else {
        console.log(`❌ Nenhum usuário encontrado com email ${participante.email} para participante ${participante.id} (${participante.nome})`);
        naoEncontrados++;
      }
    }

    console.log(`\n📈 Migração concluída:`);
    console.log(`   ✅ ${atualizados} participantes vinculados`);
    console.log(`   ❌ ${naoEncontrados} participantes sem usuário correspondente`);
    console.log(`   📊 Total processado: ${participantesSemUserId.length}`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await connection.end();
  }
}

migrarParticipantes();
