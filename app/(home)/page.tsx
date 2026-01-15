export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { isMatch } from "date-fns";
import { redirect } from "next/navigation";

import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import TransactionsPieChart from "./_components/transactions-pie-charts";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import AiReportButton from "./_components/ai-report-button";

import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import { getDashboard } from "../_data/get-dashboard";

interface HomeProps {
  searchParams: {
    month?: string;
  };
}

const Home = async ({ searchParams }: HomeProps) => {
  // 🔐 Autenticação
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  // 📅 Validação do mês
  const month = searchParams.month;
  const monthIsInvalid = !month || !isMatch(month, "MM");

  if (monthIsInvalid) {
    redirect(`?month=${new Date().getMonth() + 1}`);
  }

  // 🛑 PROTEÇÃO CRÍTICA CONTRA BUILD-TIME
  let dashboard: Awaited<ReturnType<typeof getDashboard>> | null = null;
  let userCanAddTransaction = false;
  let hasPremiumPlan = false;

  try {
    dashboard = await getDashboard(month);
    userCanAddTransaction = await canUserAddTransaction();

    const user = await clerkClient().users.getUser(userId);
    hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  } catch (error) {
    // Durante o build da Vercel não existe request real
    // → ignoramos a execução dessas funções
    console.warn("[build] Skipping dashboard data fetching");
  }

  // ⛔ Fallback seguro para o build
  if (!dashboard) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-sm text-muted-foreground">
          Carregando dashboard...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-full flex-col space-y-6 overflow-hidden p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-3">
            <AiReportButton
              month={month}
              hasPremiumPlan={hasPremiumPlan}
            />
            <TimeSelect />
          </div>
        </div>

        <div className="grid h-full grid-cols-[2fr,1fr] gap-6 overflow-hidden">
          <div className="flex flex-col gap-6 overflow-hidden">
            <SummaryCards
              month={month}
              {...dashboard}
              userCanAddTransaction={userCanAddTransaction}
            />

            <div className="grid h-full grid-cols-3 grid-rows-1 gap-6 overflow-hidden">
              <TransactionsPieChart {...dashboard} />

              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>

          <LastTransactions lastTransactions={dashboard.lastTransactions} />
        </div>
      </div>
    </>
  );
};

export default Home;
