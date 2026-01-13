import { Button } from "@/app/_components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog"
import { BotIcon } from "lucide-react"

const AiReportButton = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
            <Button variant="ghost">
                Relatório IA
                <BotIcon />
            </Button>
            </DialogTrigger>
            <DialogContent>
           <DialogHeader>
           <DialogTitle>
                    Relatório IA
                </DialogTitle>
                <DialogDescription>
                Use inteligencia artificial para gerar um relatório com insights sobre suas finanças.
                </DialogDescription>
           </DialogHeader>
           <DialogFooter>
            <DialogClose asChild>
            <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button>Gerar relatório</Button>
           </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}   

export default AiReportButton;