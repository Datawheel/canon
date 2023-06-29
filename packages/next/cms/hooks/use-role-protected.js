import {useEffect} from "react";

/** */
export default function useRoleProtected(user, onSetVariables) {
  useEffect(() => {
    console.log("user changed");
    if (user && user.role) {
      onSetVariables({user, userRole: user.role}, true);
    }
  }, [user?.role, onSetVariables]);
}
