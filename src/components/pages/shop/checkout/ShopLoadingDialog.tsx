import Spinner from "@/components/ui/Spinner";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

const ShopLoadingDialog: React.FC<{ open: boolean }> = ({ open }) => {
    return (
        <Dialog open={open}>
            <DialogContent closeable={false} className="flex items-center justify-center h-80">
                <Spinner className="h-12 w-12" />
                <span className="p-2 text-zinc-800">Processing Payment</span>
            </DialogContent>
        </Dialog>
    );
}
export default ShopLoadingDialog;