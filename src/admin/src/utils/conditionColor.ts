import { CarCondition } from "@repo/shared";

export const getConditionColor = (condition: string) => {
  switch (condition) {
    case CarCondition.Excellent:
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case CarCondition.VeryGood:
      return "bg-brand/10 text-brand-dark border-brand/20";
    case CarCondition.Good:
    default:
      return "bg-amber-50 text-amber-700 border-amber-200/60";
  }
};
