export type DemoRecord = { readonly id: string; readonly name: string };
export type DemoListState = "loading" | "empty" | "error" | "success";
export type DemoFormState = "idle" | "pending" | "success" | "error";
