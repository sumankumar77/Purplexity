import { TOP_NAV_ITEMS } from '../../constants/navigation';

export function TopNavigation() {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-center px-4">
      <nav aria-label="Search categories">
        <ul className="flex items-center gap-[24px] text-[16px] font-medium text-[#aaa7a2]">
          {TOP_NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a className="p-0 transition hover:text-zinc-100" href={item.path}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
