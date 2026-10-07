import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    supabase
      .from("saved_adverts")
      .select("advert_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setSavedIds(new Set((data || []).map((r) => r.advert_id)));
      });
  }, [user]);

  const isSaved = (advertId) => savedIds.has(advertId);

  // Returns false if the user is not logged in
  const toggleSave = async (advertId) => {
    if (!user) return false;

    const currentlySaved = savedIds.has(advertId);

    // Update the heart immediately, then sync with the database
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(advertId);
      else next.add(advertId);
      return next;
    });

    const { error } = currentlySaved
      ? await supabase.from("saved_adverts").delete().eq("user_id", user.id).eq("advert_id", advertId)
      : await supabase.from("saved_adverts").insert({ user_id: user.id, advert_id: advertId });

    if (error) {
      // Undo on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.add(advertId);
        else next.delete(advertId);
        return next;
      });
    }
    return true;
  };

  return (
    <SavedContext.Provider value={{ isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);