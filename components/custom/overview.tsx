import { motion } from "framer-motion";
import { useLanguage } from "./language-provider";

export const Overview = () => {
  const { t } = useLanguage();
  return (
    <motion.div
      key="overview"
      className="max-w-[650px] mt-0 mb-2 mx-4 md:mx-0 p-3 gap-2 text-sm sm:text-base"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-4 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="text-zinc-900 dark:text-zinc-50 font-semibold text-base text-center">
          {t('overview.welcomeTitle')}
        </p>
        <p>
          <strong>{t('appTitle')}</strong> {t('overview.intro')}
        </p>
        <ul className="list-disc ml-6">
          <li>{t('overview.feature1')}</li>
          <li>{t('overview.feature2')}</li>
          <li>{t('overview.feature3')}</li>
          <li>{t('overview.feature4')}</li>
          <li>{t('overview.feature5')}</li>
        </ul>
        <p>
          {t('overview.cta')}
        </p>
      </div>
    </motion.div>
  );
};
