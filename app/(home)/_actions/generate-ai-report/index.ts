"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import {
  generateAiReportSchema,
  GenerateAiReportSchema,
} from "./schema";

export const generateAiReport = async ({
  month,
}: GenerateAiReportSchema) => {
  // 1. Validação de entrada
  generateAiReportSchema.parse({ month });

  // 2. Autenticação
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 3. Verificação de plano premium
  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan =
    user?.publicMetadata?.subscriptionPlan === "premium";

  if (!hasPremiumPlan) {
    throw new Error("User does not have a premium plan");
  }

  // 4. CORREÇÃO DEFINITIVA DO FILTRO DE DATAS
  // JS usa mês 0–11
  const year = new Date().getFullYear();
  const startDate = new Date(year, Number(month) - 1, 1);
  const endDate = new Date(year, Number(month), 1);

  // 5. Buscar transações do usuário no mês
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // 6. Guard clause (evita chamada inútil à IA)
  if (transactions.length === 0) {
    return "Não foram encontradas transações para este mês. Cadastre movimentações para gerar um relatório financeiro.";
  }

  // 7. Formatar transações para a IA (formato consistente)
  const transactionsText = transactions
    .map(
      (t) =>
        `${t.date.toISOString().split("T")[0]}-${t.type}-${t.amount}-${t.category}`,
    )
    .join("; ");

  const prompt = `
Você receberá transações financeiras no formato:
{DATA}-{TIPO}-{VALOR}-{CATEGORIA}

Com base nesses dados, gere um relatório financeiro completo contendo:
- Resumo geral do mês
- Padrões de gastos
- Pontos de atenção
- Sugestões práticas para melhorar a saúde financeira

Transações:
${transactionsText}
`;

  // 8. Chamada ao OpenAI
  const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em finanças pessoais e educação financeira. Seja claro, prático e objetivo.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  // 9. Retorno final
  return completion.choices[0].message.content;
};
