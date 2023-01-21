export type UIType = "physics"|"morph"|"transform"|"action_trigger"
export type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
    updateSelectedObjectFunction:(mesh: THREE.Mesh|null) => void;
    updateSelectedObjectIndexFunction:(string: string|null) => void;
    updateIsObjectSelected:(val:boolean)=>void;
}