"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useInventory from "@/hooks/useInventory";
import Spinner from "@/components/ui/Spinner";
import useCart from "@/hooks/shop/useCart";

const ProductForm: React.FC<{
  name: string;
  category?: string;
  merchent: string | null;
  description: string;
  id: string;
  variations: {
    id: string;
    name: string | null;
    sku: string | null;
    ordinal: number;
    price: number;
    pricingType: string;
    currency: string;
  }[];
}> = ({ name, category, merchent, description, variations }) => {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const variation = variations[selectedVariation];
  const { handleSubmit, control, register } = useForm<{
    id: string;
    quantity: number;
  }>({
    defaultValues: {
      id: variation?.id,
    },
  });

  const { inStock, stockLoading, inventory } = useInventory(variation?.id);
  const { addItem, open } = useCart();

  const onSubmit = ({ quantity, id }: { id: string; quantity: number }) => {
    addItem(id, quantity);
    open();
  };

  return (
    <form
      className="col-span-1 flex flex-col p-6 lg:col-span-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-4xl font-bold">
        {name}
        {variation?.sku ? (
          <span className="text-base text-gray-400">#{variation?.sku}</span>
        ) : null}
      </h1>
      <div className="mb-4 flex gap-1">
        <span className="text-sm text-gray-600">{category}</span>
        {merchent ? (
          <span className="text-sm text-gray-600">| {merchent}</span>
        ) : null}
      </div>
      <h3 className="text-xl font-semibold">
        {((variation?.price ?? 0) / 100).toLocaleString(undefined, {
          style: "currency",
          currency: variation?.currency ?? "USD",
        }) ?? "$??.??"}
      </h3>
      <p className="leading-7 [&:not(:first-child)]:mt-6">{description}</p>
      <div className="mt-4 flex flex-col">
        <label className="mb-2 text-zinc-500" htmlFor="options">
          Options
        </label>
        <Controller
          rules={{ required: true }}
          control={control}
          name="id"
          render={({ field }) => (
            <Select
              required
              defaultValue={variation?.id}
              name="id"
              onValueChange={(item) => {
                const idx = variations.findIndex((value) => value.id === item);
                if (idx !== -1) setSelectedVariation(idx);
                field.onChange(item);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Variation" />
              </SelectTrigger>
              <SelectContent>
                {variations.map((value) => (
                  <SelectItem key={value.id} value={value.id}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="mt-4 flex flex-col">
        <label className="mb-2 text-zinc-500" htmlFor="quantity">
          Quantity
        </label>
        <Input
          {...register("quantity", {
            valueAsNumber: true,
            min: { message: "There must be more then one item", value: 1 },
          })}
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={inventory?.quantity ?? undefined}
          defaultValue={1}
        />
      </div>
      <div className="my-4 lg:mt-auto">
        <Button
          className="mb-2 w-full"
          aria-label="Add to Cart"
          type="submit"
          disabled={!inStock || stockLoading}
        >
          {stockLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Loading...
            </>
          ) : inStock ? (
            "Add to Cart"
          ) : (
            "Out of Stock"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
