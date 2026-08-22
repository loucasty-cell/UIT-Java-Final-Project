import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-B_bLX3U_.js
var $$splitComponentImporter = () => import("./settings-m1lIJN5H.mjs");
var Route = createFileRoute("/settings")({
	validateSearch: (search) => {
		const focus = search.focus;
		return { focus: focus === "teach" || focus === "learn" ? focus : void 0 };
	},
	head: () => ({ meta: [
		{ title: "Settings - SkillBridge" },
		{
			name: "description",
			content: "Manage SkillBridge profile, skills, security, and notification settings."
		},
		{
			property: "og:title",
			content: "Settings - SkillBridge"
		},
		{
			property: "og:description",
			content: "Manage SkillBridge profile and account settings."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
