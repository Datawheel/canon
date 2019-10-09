export const INSTANCE_UPDATE = "vizbuilder/INSTANCE/UPDATE";

/** @param {Partial<InstanceState>} instance */
export const doInstanceUpdate = instance => ({type: INSTANCE_UPDATE, payload: instance});
