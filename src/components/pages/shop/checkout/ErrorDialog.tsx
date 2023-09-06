import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ErrorDialog: React.FC<{
  open: boolean;
  setOpen: (value: boolean) => void;
  message: string;
  code: string;
}> = ({ open, code, message, setOpen }) => {
  return (
    <AlertDialog open={open} onOpenChange={(value) => setOpen(value)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment error</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col items-center">
            <p>{message}</p>
            <span className="p-1 text-xs leading-7 text-red-500">
              CODE: {code}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
