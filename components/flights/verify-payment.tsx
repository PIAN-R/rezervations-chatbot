import { useLanguage } from "../custom/language-provider";

export function VerifyPayment({
  result: { hasCompletedPayment },
}: {
  result: {
    hasCompletedPayment: boolean;
  };
}) {
  const { t } = useLanguage();
  return (
    <div>
      {hasCompletedPayment
        ? t('paymentVerified')
        : t('paymentNotVerified')}
    </div>
  );
}
