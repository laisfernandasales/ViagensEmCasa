import Link from 'next/link';
import { useLocale } from 'next-intl';

const LogoButton = () => {
  const locale = useLocale();

  return (
    <Link 
      href="/" 
      locale={locale} 
      className="btn btn-ghost normal-case text-2xl header-link whitespace-nowrap"
    >
      VIAGENS EM CASA
    </Link>
  );
};

export default LogoButton;
