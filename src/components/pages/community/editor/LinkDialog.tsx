import { $createLinkNode } from "@lexical/link";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const LinkDialog: React.FC<
  React.PropsWithChildren<{ activeEditor: LexicalEditor }>
> = ({ activeEditor, children }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<{ url: string }>({
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = () => {
    const value = form.getValues();

    try {
      const url = new URL(value.url);

      if (!["https:", "mailto:", "tel:"].includes(url.protocol))
        throw new Error("Url protocal must be https:, mailto:, or tel:");

      if (url.hostname.endsWith(".zip"))
        throw new Error(".zip is not a vaild domain");

      activeEditor.update(() => {
        const root = $getRoot();

        const wrapper = $createParagraphNode();

        const node = $createLinkNode(url.toString(), { target: "_blank" });

        const textNode = $createTextNode(url.toString());
        node.append(textNode);

        wrapper.append(node);

        root.append(wrapper);
      });

      setOpen(false);
      form.resetField("url");
    } catch (error) {
      console.error(error);
      form.setError("url", {
        message: (error as Error).message,
        type: "validate",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Link</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <div>
            <FormField
              rules={{
                required: {
                  message: "Please enter a link",
                  value: true,
                },
              }}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Url</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://midwestraptorjunkies.com"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
        <DialogFooter>
          <Button onClick={() => form.handleSubmit(onSubmit)()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;
