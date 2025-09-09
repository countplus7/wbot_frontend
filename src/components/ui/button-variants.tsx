import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow hover:-translate-y-0.5",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground shadow-elegant hover:shadow-lg hover:-translate-y-0.5",
        secondary: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-elegant hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground px-8 py-4 text-lg font-semibold shadow-glow hover:shadow-elegant hover:-translate-y-1 transform transition-all duration-300",
        tab: "bg-transparent border-b-2 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);