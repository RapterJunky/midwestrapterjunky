import { RenderAssetSourceCtx } from "datocms-plugin-sdk";
import { Button, Spinner } from 'datocms-react-ui';
import { Canvas } from "datocms-react-ui";
import Image from 'next/image';
import { useState, useRef } from "react";

export default function CustomImageUpload({ ctx }: { ctx: RenderAssetSourceCtx }){
    const [image,setImage] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [filename,setFilename] = useState<string>();
    const selector = useRef<HTMLInputElement>(null);

    const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
        try {
            ev.preventDefault();
            setLoading(true);

            if(!(selector.current?.files && selector.current?.files[0])) throw new Error("No files to upload.");
            const file = selector.current?.files[0];
            const data = new FormData();

            data.append("image",file,file.name);

            const token = new URLSearchParams(window.location.search).get("token");
            if(!token) throw new Error("No token")

           /* const req = await fetch("/api/plugin/upload",{
                method: "POST",
                headers: {
                    // Don't set this headers when working with this type of form data
                    // fetch will create it for you
                    //"Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                    "X-DATO-USER": ctx.currentUserAccessToken
                } as any,
                body: data
            });

            if(!req.ok) throw new Error(req.statusText);

            const info = await req.json();
*/
            await ctx.notice("Uploaded and optimized image.");
            await ctx.select({
                resource: {
                    base64: "",
                    filename: ""
                }
            });
        } catch (error) {
            console.error(error);
            (ev.target as HTMLFormElement).reset();
            setImage("");
            setLoading(false);
            await ctx.alert("Failed to upload image");
        }
    }


    return (
        <Canvas ctx={ctx}>
            <form className="flex flex-col gap-2 h-full justify-center items-center w-full" onSubmit={handleSubmit}>
               { !loading ? (<>
                    <div className="flex flex-col gap-2 w-full h-full items-center">
                        <div className="flex gap-3 items-center">
                            <Button buttonType="muted" onClick={()=>selector.current?.click()}>Choose...</Button>
                            { image ? (
                                <span className="font-serif font-thin">{filename}</span>
                            ) : null }
                        </div>
                        <input ref={selector} multiple={false} onChange={(ev)=>{
                            if(ev.target.files && ev?.target.files[0]) {
                                setFilename(ev.target.files[0].name)
                                setImage(URL.createObjectURL(ev.target.files[0]));
                            }
                        }} type="file" name="image" className="hidden"/>
                        { image ? (
                            <div className="h-48 w-full relative">
                                <Image src={image} fill alt="upload iamge" className="object-contain object-center"/>
                            </div>
                        ) : null }
                    </div>
                    { image ? <Button buttonType="primary" className="w-full" type="submit">Add</Button> : null }
               </>) : (
                <div className="w-full">
                    <Spinner size={48} placement="centered"/>
                </div>
               ) }
            </form>
        </Canvas>
    );
}