interface SubTabLayoutProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
  ocidScope: string;
}

export function SubTabLayout({
  tabs,
  active,
  onChange,
  children,
  ocidScope,
}: SubTabLayoutProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            data-ocid={`${ocidScope}.${tab.id}.tab`}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              active === tab.id
                ? "bg-primary/20 text-primary border-primary/40"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
