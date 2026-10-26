declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Shield: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Activity: LucideIcon;
  export const FileText: LucideIcon;
  export const Download: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const AlertOctagon: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const XCircle: LucideIcon;
  export const Award: LucideIcon;
  export const Play: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Copy: LucideIcon;
  export const Info: LucideIcon;
  export const Scale: LucideIcon;
  export const Lock: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Wand2: LucideIcon;
  export const FileCheck: LucideIcon;
  export const FileCheck2: LucideIcon;
  export const Clock: LucideIcon;
  export const Layers: LucideIcon;
  export const Globe: LucideIcon;
  export const Radio: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const FileWarning: LucideIcon;
  export const Send: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Eye: LucideIcon;
  export const Filter: LucideIcon;
  export const Sliders: LucideIcon;
  export const Plus: LucideIcon;
  export const X: LucideIcon;
  export const Save: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Check: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Share2: LucideIcon;
  export const Calendar: LucideIcon;
  export const Printer: LucideIcon;
  export const Hash: LucideIcon;
  
  const icons: { [key: string]: LucideIcon };
  export default icons;
}
