import Link from 'next/link';
import { useLocale } from 'next-intl';

const MarketLink = () => {
  const locale = useLocale();

  return (
    <Link href={`/${locale}/marketplace`} locale={locale} className="btn btn-ghost normal-case text-2xl header-link">
      Mercado
    </Link>
  );
};

export default MarketLink;
