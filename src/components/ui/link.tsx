import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, href, ...props }, ref) => {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'cursor-pointer transition-colors',
          className
        )}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';

export { Link };