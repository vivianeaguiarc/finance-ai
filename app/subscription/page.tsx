import { auth, clerkClient } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import AcquirePlanButton from "./_components/acquire-plan-button";
import { Badge } from "../_components/ui/badge";
import { getCurrentMonthTransactions } from "../_data /get-current-month-transactions";

const SubsciptionPage = async () => {
  const { userId } = auth();
  if (!userId) {
    redirect("/login");
  }
  const user = await clerkClient().users.getUser(userId);
  const currencyMonthTransactions = await getCurrentMonthTransactions();
  const hasPremiumPlan = user?.publicMetadata?.subscriptionPlan === "premium";
  return (
    <>
    <Navbar />
    <div className="p- space-y-6">
      <h1 className="font-bold text-2xl p-6">Assinatura</h1>
      <div className="flex gap-6">
        <Card className="w-[450px]">
          <CardHeader className="border-b border-solid py-8">
            <h2 className="text-center text-2xl font-semibold">Plano Básico</h2>
            <div className="flex items-center gap-3 justify-center">
              <span className="text-4xl">R$</span>
              <span className="font-semibold text-6xl">0</span>
              <span className="text-muted-foreground text-2xl">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <div className="flex items-center gap-2">
              <CheckIcon className="text-primary"/>
              <p>Apenas 10 transações por mês ({currencyMonthTransactions}/10)</p>
            </div>
            <div className="flex items-center gap-2">
              <XIcon className="text-danger"/>
              <p>Relatórios de IA</p>

            </div>
          </CardContent>
        </Card>
        <Card className="w-[450px]">
          <CardHeader className="border-b border-solid py-8 relative">
            {hasPremiumPlan && (
              <Badge className="absolute top-10 left-4 bg-primary/10 text-primary font-bold text-base">
                Ativo
              </Badge>
            )}
            <h2 className="text-center text-2xl font-semibold">Plano Premium</h2>
            <div className="flex items-center gap-3 justify-center">
              <span className="text-4xl">R$</span>
              <span className="font-semibold text-6xl">19,90</span>
              <span className="text-muted-foreground text-2xl">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <div className="flex items-center gap-2">
              <CheckIcon className="text-primary"/>
              <p>Transações ilimitadas</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="text-primary"/>
              <p>Relatórios de IA</p>
            </div>
            <AcquirePlanButton/>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
};

export default SubsciptionPage;
