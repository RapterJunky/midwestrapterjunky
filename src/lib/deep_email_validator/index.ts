import { logger } from "../logger";
import checkDisposable from "./disposable";
import { getBestMx } from "./dns";
import { checkSMTP } from "./stmp";
import { checkTypo } from "./typo";

type ValidationResult = {
  reason: string;
  valid: boolean;
};

type Options = {
  email: string;
  sender?: string;
  validateMx?: boolean;
  validateTypo?: boolean;
  validateDisposable?: boolean;
  validateSMTP?: boolean;
};

export default async function validate(
  opt: Options,
): Promise<ValidationResult> {
  try {
    const domain = opt.email.split("@")[1];
    if (!domain)
      return {
        valid: false,
        reason: "Failed to obtain domain from email.",
      };

    if (opt.validateTypo ?? true) await checkTypo(opt.email);
    if (opt.validateDisposable ?? true) await checkDisposable(opt.email);

    if (opt.validateMx ?? true) {
      const mx = await getBestMx(domain);
      if (opt.validateSMTP ?? true)
        await checkSMTP(
          opt.sender ?? "name@example.org",
          opt.email,
          mx.exchange,
        );
    }

    return {
      valid: true,
      reason: "",
    };
  } catch (error) {
    logger.error(error, "Email validation error");
    return {
      valid: false,
      reason: (error as Error).message ?? "Failed to validate email",
    };
  }
}
