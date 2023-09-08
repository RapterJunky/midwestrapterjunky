"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ConfirmationMessage: React.FC = () => {
  const searchParams = useSearchParams();

  const message = decodeURIComponent(searchParams?.get("message") ?? "");
  const status = searchParams?.get("status")?.toString() ?? "unknown";
  const mode = searchParams?.get("mode")?.toString() ?? "unknown";

  if (status !== "ok")
    return (
      <>
        <h1>There was an issue!</h1>
        <p>{message ?? "There was an error processing your request."}</p>
      </>
    );

  if (mode === "email")
    return (
      <>
        <h1 className="p-2 text-4xl font-bold">Thank you.</h1>
        <p className="text-2xl font-medium">{message ?? ""}</p>
      </>
    );

  const shopReceiptId = searchParams?.get("shop_receipt_id");
  const shopReceiptUrl = decodeURIComponent(
    searchParams?.get("shop_receipt")?.toString() ?? "",
  );
  const isVaildUrl =
    shopReceiptUrl.startsWith("https://squareupsandbox.com/receipt") ||
    shopReceiptUrl.startsWith("https://squareup.com/receipt");

  return (
    <>
      <h1 className="p-2 text-4xl font-bold">Thank you for your purchase.</h1>
      <p className="text-2xl font-medium">
        Your receipt ID:{" "}
        <span className="text-neutral-400">{shopReceiptId}</span>
      </p>
      {shopReceiptUrl && isVaildUrl ? (
        <Link
          className="text-primary hover:text-primary-500"
          target="_blank"
          rel="noopener"
          href={shopReceiptUrl}
        >
          View Receipt
        </Link>
      ) : null}
    </>
  );
};

export default ConfirmationMessage;
