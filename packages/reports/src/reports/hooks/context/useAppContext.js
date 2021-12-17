import {useContext} from "react";
import {AppContext} from "@datawheel/canon-core/src/CanonProvider";

const useAppContext = () => useContext(AppContext);

export default useAppContext;
