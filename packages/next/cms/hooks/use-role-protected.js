import {useEffect} from "react";

/** */
export default function useRoleProtected(user, onSetVariables) {
  useEffect(() => {
    if (user && user.role) {
      onSetVariables({user, userRole: user.role}, true);
    }
  }, [user?.role, onSetVariables]);
}
