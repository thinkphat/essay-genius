import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = (enabled: boolean) => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: async () => {
      const res = await api.auth.getCurrentUser();
      if (res.status !== 200) throw new Error("Unauthorized");
      return res.body;
    },
    enabled,
  });
};
