import { useContext } from "react";
import { BreadcrumbContext } from "./breadcrumb-context";
import { Breadcrumb } from "./Breadcrumb";

export const BreadcrumbSlot = () => {
	const value = useContext(BreadcrumbContext);
	if (value === null) return null;
	return <Breadcrumb {...value} />;
};
