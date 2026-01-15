import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isMatch } from "date-fns";
import { getDashboard } from "../_data/get-dashboard";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import AiReportButton from "./_components/ai-report-button";
import TimeSelect from "./_components/time-select";
import SummaryCards from "./_components/summary-cards";
import TransactionsPieChart from "./_components/transactions-pie-charts";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";

interface Props {
  searchParams?: {
    month?: string;
  };
}

export default async function HomeDashboard({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const month = searchParams?.month;
  if (!month || !isMatch(month, "MM")) {
    redirect(`?month=${new Date().getMonth() + 1}`);
  }

  const dashboard = await getDashboard(month);
  const userCanAddTransaction = await canUserAddTransaction();
  const user = await clerkClient().users.getUser(userId);

  return (
    <div className="flex h-full flex-col space-y-6 overflow-hidden p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-3">
          <AiReportButton
            month={month}
            hasPremiumPlan={user.publicMetadata.subscriptionPlan === "premium"}
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

          <div className="grid h-full grid-cols-3 gap-6 overflow-hidden">
            <TransactionsPieChart {...dashboard} />
            <ExpensesPerCategory
              expensesPerCategory={dashboard.totalExpensePerCategory}
            />
          </div>
        </div>

        <LastTransactions lastTransactions={dashboard.lastTransactions} />
      </div>
    </div>
  );
}
