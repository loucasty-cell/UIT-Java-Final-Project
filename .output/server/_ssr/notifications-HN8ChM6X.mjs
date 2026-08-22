import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-HN8ChM6X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initialNotifications = [
	{
		id: "1",
		title: "Mentor accepted your request",
		detail: "Priya A. accepted your Calculus II session request.",
		time: "2m ago",
		tone: "success"
	},
	{
		id: "2",
		title: "New reply on your forum post",
		detail: "Marcus D. replied to your Data Structures thread.",
		time: "1h ago",
		tone: "info"
	},
	{
		id: "3",
		title: "Escrow released",
		detail: "10 pts released for your Data Structures session.",
		time: "Yesterday",
		tone: "warning"
	}
];
var NotificationContext = (0, import_react.createContext)(null);
function NotificationProvider({ children }) {
	const [notifications, setNotifications] = (0, import_react.useState)(initialNotifications);
	const [unread, setUnread] = (0, import_react.useState)(initialNotifications.length);
	const value = (0, import_react.useMemo)(() => ({
		notifications,
		unread,
		addNotification: (notification) => {
			setNotifications((current) => [{
				...notification,
				id: crypto.randomUUID(),
				time: "Just now"
			}, ...current]);
			setUnread((count) => count + 1);
		},
		markAllRead: () => setUnread(0)
	}), [notifications, unread]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationContext.Provider, {
		value,
		children
	});
}
function useNotifications() {
	const context = (0, import_react.useContext)(NotificationContext);
	if (!context) throw new Error("useNotifications must be used within NotificationProvider");
	return context;
}
//#endregion
export { useNotifications as n, NotificationProvider as t };
