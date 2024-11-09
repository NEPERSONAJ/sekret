import { cn } from "@/lib/utils";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Chart({ className, children, ...props }: ChartProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}