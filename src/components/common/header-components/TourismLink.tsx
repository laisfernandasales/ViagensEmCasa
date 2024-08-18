import Link from 'next/link';
import { useLocale } from 'next-intl';

const TourismLink = () => {
  const locale = useLocale();

  return (
    <Link href={`/${locale}/ticketplace`} locale={locale} className="btn btn-ghost normal-case text-2xl header-link">
      Turismo
    </Link>
  );
};

export default TourismLink;
