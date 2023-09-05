import type { LexicalEditor } from "lexical";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { INSERT_IMAGE_COMMAND } from "./plugins/ImagesPlugin";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ImageDialog: React.FC<React.PropsWithChildren<{ activeEditor: LexicalEditor }>> = ({ children, activeEditor }) => {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>();
    const form = useForm<{ alt: string; url: string; file: { fileName?: string, file: null | File } }>({
        defaultValues: {
            alt: "",
            url: "",
            file: {
                file: null,
                fileName: undefined
            }
        }
    });

    const usingUrl = form.watch("url");
    const usingFile = form.watch("file.file");

    const reset = () => {
        form.resetField("file", { keepDirty: false, keepError: false });
        form.resetField("url");
        form.resetField("alt");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const onSubmit = async () => {
        try {
            const isVaild = await form.trigger(undefined, { shouldFocus: true });
            if (!isVaild) return;

            const { file, alt, url } = form.getValues();

            const imageUrl = file.file ? await new Promise<string>((ok, rej) => {
                if (!file.file) return rej(new Error("Failed to load file", { cause: "file" }));

                if (file.file.size > 5_000_000) {
                    return rej(new Error("Image is larger than 5MB.", { cause: "file" }));
                }

                const reader = new FileReader();

                reader.addEventListener("load", () => {
                    ok(reader.result as string);
                });
                reader.addEventListener("error", () => rej(new Error("There was an error in loading the file.", { cause: "file" })));

                reader.readAsDataURL(file.file);
            }) : url;

            const load = await new Promise<{ src: string; width: number; height: number }>((ok, rej) => {

                const loadImage = new Image();

                loadImage.addEventListener("load", () => {
                    ok({
                        width: loadImage.width,
                        height: loadImage.height,
                        src: loadImage.src
                    })
                });
                loadImage.addEventListener("error", () => rej(new Error("Failed to load image", { cause: file.file ? "file" : "url" })));

                loadImage.src = imageUrl;
            });

            activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: load.src,
                alt: alt.trim(),
                width: load.width,
                imageType: file.file ? "google" : "external",
                height: load.height,
                file: file.file ?? undefined
            });

            reset();
            setOpen(false);
        } catch (error) {
            console.error(error);
            form.setError((error as Error)?.cause as "file" | "url" ?? "root", {
                message: (error as Error).message,
                type: "validate"
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add a Image</DialogTitle>
                <Form {...form}>
                    <div className="flex flex-col space-y-4">

                        <FormField rules={{
                            required: {
                                message: "Enter a image url or upload a image",
                                value: !usingFile
                            }
                        }} control={form.control} name="url" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image Url</FormLabel>
                                <FormControl>
                                    <Input disabled={!!usingFile} accept="image/*" {...field} required={!!usingUrl} placeholder="https://example.com/image.png" type="url" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className='flex items-center justify-center gap-2'>
                            <Separator className="w-1/3" />
                            <span>Or</span>
                            <Separator className="w-1/3" />
                        </div>

                        <FormField rules={{
                            required: {
                                value: !usingUrl,
                                message: "Select a image or use a image url"
                            }
                        }} control={form.control} name="file" render={({ field: { value, onChange, ref, ...field } }) => (
                            <FormItem>
                                <FormLabel>Uploaded Image</FormLabel>
                                <FormControl>
                                    <Input
                                        ref={(e) => {
                                            ref(e);
                                            fileInputRef.current = e;
                                        }}
                                        accept="image/*"
                                        required={!!usingFile}
                                        disabled={!!usingUrl}
                                        {...field}
                                        type="file"
                                        value={value?.fileName}
                                        onChange={(ev) => onChange({ file: ev.target.files?.item(0) })}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Separator />

                        <FormField rules={{
                            minLength: {
                                value: 3,
                                message: "Alt text is too short"
                            },
                            maxLength: {
                                value: 50,
                                message: "Alt text is too long"
                            },
                            required: { message: "A image alt text is required.", value: true }
                        }} control={form.control} name="alt" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image alt text</FormLabel>
                                <FormControl>
                                    <Input placeholder="example" maxLength={50} min={3} required type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>A short description of the image.</FormDescription>
                            </FormItem>
                        )} />
                    </div>
                </Form>
                <DialogFooter>
                    <Button disabled={form.formState.isSubmitting} type="button" variant="secondary" onClick={reset}>Clear</Button>
                    <Button disabled={form.formState.isSubmitting} type="button" onClick={() => form.handleSubmit(onSubmit)()}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ImageDialog;