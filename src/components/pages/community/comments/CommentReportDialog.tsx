import { Flag } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { Label } from "@/components/ui/label";

const CommentReportDialog: React.FC<{
  id: string;
  disabled: boolean;
  report: (id: string, reason: string) => Promise<void>;
}> = ({ id, disabled, report }) => {
  const [open, setOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Report Comment"
          disabled={disabled}
          title="Privately flag this comment for attention."
        >
          <Flag className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (ev) => {
            try {
              setHasError(false);
              setLoading(true);
              ev.preventDefault();
              const fromData = new FormData(ev.target as HTMLFormElement);
              const reason = fromData.get("reason")?.toString();
              if (!reason) return;
              await report(id, reason);
              setOpen(false);
            } catch (error) {
              console.error(error);
              setHasError(true);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Label className="mb-2">Reason</Label>
          <Textarea
            minLength={10}
            maxLength={256}
            required
            name="reason"
            placeholder="Reason for report"
          />
          {hasError ? (
            <p className="text-sm leading-7 text-red-500 [&:not(:first-child)]:mt-2">
              There was an error when submitting your report. Please, try again.
            </p>
          ) : null}
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommentReportDialog;
