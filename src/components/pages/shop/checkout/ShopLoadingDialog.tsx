import { Dialog, DialogContent } from "@/components/ui/dialog";
import Spinner from "@/components/ui/Spinner";

const ShopLoadingDialog: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent
        closeable={false}
        className="flex h-80 items-center justify-center"
      >
        <Spinner className="h-12 w-12" />
        <span className="p-2 text-zinc-800">Processing Payment</span>
      </DialogContent>
    </Dialog>
  );
};
export default ShopLoadingDialog;
