"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import UpsertTransactionDialog from "./upsert-transaction-dialog";

const AddTransactionButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
        Adicionar transação
        <ArrowDownUpIcon />
      </Button>
      <UpsertTransactionDialog isOpen={dialogOpen} setIsOpen={setDialogOpen} />
    </>
  );
};

export default AddTransactionButton;
