import { create } from "zustand";
import { dashboardData, type Category } from "@/data/dashboard";

type DashboardState = {
  categories: Category[];
  activeNum: number;
  setActiveNum: (num: number) => void;
  postedNums: number[];
  markPosted: (num: number) => void;
  clearPosted: () => void;
};

const getInitialPosted = (): number[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("web3_jobs_posted_categories");
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = new Date().toDateString();
      if (parsed && typeof parsed === 'object' && parsed.date === today && Array.isArray(parsed.nums)) {
        return parsed.nums;
      }
    }
    return [];
  } catch {
    return [];
  }
};

export const useDashboardStore = create<DashboardState>((set) => ({
  categories: dashboardData,
  activeNum: dashboardData[0]?.num ?? 1,
  setActiveNum: (num) => set({ activeNum: num }),
  postedNums: getInitialPosted(),
  markPosted: (num) =>
    set((state) => {
      if (state.postedNums.includes(num)) return state;
      const next = [...state.postedNums, num];
      try {
        localStorage.setItem("web3_jobs_posted_categories", JSON.stringify({
          date: new Date().toDateString(),
          nums: next
        }));
      } catch {}
      return { postedNums: next };
    }),
  clearPosted: () =>
    set(() => {
      try {
        localStorage.removeItem("web3_jobs_posted_categories");
      } catch {}
      return { postedNums: [] };
    }),
}));

export function useActiveCategory(): Category | undefined {
  return useDashboardStore((state) => {
    return state.categories.find((item) => item.num === state.activeNum) ?? state.categories[0];
  });
}
