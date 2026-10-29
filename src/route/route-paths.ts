import { generatePath } from "react-router-dom";

export const routerBasename = "/";

const detailPattern = "/item/:itemId";
const paymentPattern = "/:appId/payment";
const editorExamplePattern = "/editor/:recordId";
const analyticsPattern = "/report/:kind";
const detailAnalyticsPattern = "/report/stories/:recordId";
const contentPattern = "/stories/:recordId";
const commentQueuePattern = "/moderation/*";
const approvalPattern = "/review/:recordId";

export const routePath = {
	root: "/",
	login: "/login",
	overview: "/overview",
	list: "/item",
	create: "/item/new",
	paymentPattern,
	payment: (appId: string) => generatePath(paymentPattern, { appId }),
	component: "/component",
	analyticsPattern,
	analytics: (kind: string) => generatePath(analyticsPattern, { kind }),
	detailAnalyticsPattern,
	detailAnalytics: (recordId: string) =>
		generatePath(detailAnalyticsPattern, { recordId }),
	contentList: "/stories",
	contentCreate: "/stories/new",
	contentPattern,
	content: (recordId: string) => generatePath(contentPattern, { recordId }),
	commentQueue: "/moderation",
	commentQueuePattern,
	accountList: "/accounts",
	accountCreate: "/accounts/new",
	accountAccessDenied: "/accounts/access-denied",
	approvalPattern,
	approval: (recordId: string) => generatePath(approvalPattern, { recordId }),
	editorExamplePattern,
	editorExample: (recordId: string) =>
		generatePath(editorExamplePattern, { recordId }),
	detailPattern,
	detail: (itemId: string) => generatePath(detailPattern, { itemId }),
	notFoundPattern: "*",
} as const;

export type RoutePath = typeof routePath;
