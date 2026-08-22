import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { B as Coins, I as Flag, X as Check, b as Save, h as ShieldAlert, r as Users, s as TriangleAlert, u as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogDescription, c as DialogTitle, d as Label, h as useAuth, i as DialogContent, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader, u as Input } from "./auth-CmX3G0zg.mjs";
import { t as Separator } from "./separator-DYjBf1a5.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-DFtAAVyG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BixMpYkw.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DOg6kRao.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BQwYuVAq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BzrSKaQY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 rounded-2xl border border-secondary/20 bg-accent px-4 py-3 text-sm text-primary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "rounded-full bg-primary text-white hover:bg-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-1 h-3 w-3" }), "Admin Portal"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: "Administrative controls are shown only to admin accounts."
			})]
		}), children]
	});
}
var initialFlagged = [
	{
		id: "f1",
		type: "Forum Post",
		author: "Jordan M.",
		major: "Business Admin",
		reason: "Inappropriate Language",
		date: "Jul 22, 2026",
		excerpt: "Selling exam answers for BUS 201 — DM me..."
	},
	{
		id: "f2",
		type: "Comment",
		author: "Ravi K.",
		major: "Mechanical Eng.",
		reason: "Fraudulent Activity",
		date: "Jul 21, 2026",
		excerpt: "Pay me 100 pts off-platform and I'll do your homework."
	},
	{
		id: "f3",
		type: "Forum Post",
		author: "Elena V.",
		major: "Psychology",
		reason: "Spam",
		date: "Jul 20, 2026",
		excerpt: "Check out this external tutoring site!!! (link)"
	},
	{
		id: "f4",
		type: "Session Message",
		author: "Tom H.",
		major: "Physics",
		reason: "Inappropriate Language",
		date: "Jul 19, 2026",
		excerpt: "Used offensive language toward peer mentor."
	}
];
var initialReported = [{
	id: "u1",
	name: "Jordan M.",
	major: "Business Admin",
	reports: 3,
	lastReport: "Jul 22, 2026",
	status: "Under Review"
}, {
	id: "u2",
	name: "Ravi K.",
	major: "Mechanical Eng.",
	reports: 2,
	lastReport: "Jul 21, 2026",
	status: "Warned"
}];
var stats = [
	{
		label: "Total Platform Users",
		value: "1,240",
		icon: Users,
		tone: "bg-primary/10 text-primary"
	},
	{
		label: "Points in Escrow",
		value: "3,500 Pts",
		icon: Coins,
		tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
	},
	{
		label: "Flagged Posts / Comments",
		value: "4 Pending",
		icon: Flag,
		tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
	},
	{
		label: "Active Disputes",
		value: "2",
		icon: TriangleAlert,
		tone: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
	}
];
function AdminPage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const [flagged, setFlagged] = (0, import_react.useState)(initialFlagged);
	const [reported] = (0, import_react.useState)(initialReported);
	const [warnOpen, setWarnOpen] = (0, import_react.useState)(false);
	const [warnTarget, setWarnTarget] = (0, import_react.useState)(null);
	const [warnReason, setWarnReason] = (0, import_react.useState)("");
	const [warnMessage, setWarnMessage] = (0, import_react.useState)("");
	const [settings, setSettings] = (0, import_react.useState)({
		registration: 50,
		review: 5,
		escrowHours: 18
	});
	const openWarning = (name, major) => {
		setWarnTarget({
			name,
			major
		});
		setWarnReason("");
		setWarnMessage("");
		setWarnOpen(true);
	};
	const submitWarning = () => {
		if (!warnReason || !warnMessage.trim()) {
			toast.error("Please select a reason and write a message.");
			return;
		}
		toast.success(`Warning sent to ${warnTarget?.name}.`);
		setWarnOpen(false);
	};
	const deleteRow = (id) => {
		setFlagged((rows) => rows.filter((r) => r.id !== id));
		toast.success("Content removed.");
	};
	const dismissRow = (id) => {
		setFlagged((rows) => rows.filter((r) => r.id !== id));
		toast("Flag dismissed.");
	};
	const saveSettings = () => {
		toast.success("System settings saved.");
	};
	const initials = (name) => name.split(" ").map((s) => s[0]).slice(0, 2).join("");
	(0, import_react.useEffect)(() => {
		if (auth.userRole !== "admin") navigate({ to: "/" });
	}, [auth.userRole, navigate]);
	if (auth.userRole !== "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-2xl p-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Redirecting"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Admin Portal is only available to admin accounts."
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "rounded-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-1 h-3 w-3" }), "Admin"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Platform health & moderation"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight sm:text-3xl",
					children: "Admin Dashboard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Review flagged content, manage user reports, and configure platform rewards."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "rounded-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `flex h-10 w-10 items-center justify-center rounded-xl ${s.tone}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold tracking-tight",
							children: s.value
						})]
					})]
				})
			}, s.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Moderation Queue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review flagged content, reported users, and manage system-wide reward settings." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "flagged",
				className: "w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-3 sm:w-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "flagged",
								children: "Flagged Posts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "users",
								children: "Reported Users"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "settings",
								children: "System Settings"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "flagged",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-xl border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Content" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Author" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Actions"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: flagged.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 5,
								className: "py-10 text-center text-sm text-muted-foreground",
								children: "Queue clear. Nothing to review. 🎉"
							}) }) : flagged.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "max-w-xs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "w-fit rounded-full text-[10px]",
											children: row.type
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "line-clamp-2 text-xs text-muted-foreground",
											children: [
												"\"",
												row.excerpt,
												"\""
											]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										className: "h-7 w-7",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
											className: "text-[10px]",
											children: initials(row.author)
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: row.author
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-[11px] text-muted-foreground",
											children: row.major
										})]
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
									children: row.reason
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs text-muted-foreground",
									children: row.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap justify-end gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "destructive",
											size: "sm",
											onClick: () => deleteRow(row.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-1 h-3.5 w-3.5" }), "Delete"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => openWarning(row.author, row.major),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-1 h-3.5 w-3.5" }), "Warn"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: () => dismissRow(row.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 h-3.5 w-3.5" }), "Dismiss"]
										})
									]
								}) })
							] }, row.id)) })] })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "users",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-xl border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "User" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reports" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Report" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Actions"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: reported.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										className: "h-8 w-8",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
											className: "text-[11px]",
											children: initials(u.name)
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: u.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: u.major
									})] })]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-sm font-semibold",
									children: u.reports
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs text-muted-foreground",
									children: u.lastReport
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: u.status === "Warned" ? "rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "rounded-full",
									children: u.status
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => openWarning(u.name, u.major),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-1 h-3.5 w-3.5" }), "Issue Warning"]
									})
								})
							] }, u.id)) })] })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "settings",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "reg",
												children: "Registration Bonus Points"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "reg",
												type: "number",
												value: settings.registration,
												onChange: (e) => setSettings((s) => ({
													...s,
													registration: Number(e.target.value)
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Awarded once when a new student joins SkillBridge."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "rev",
												children: "Forum Contribution Points"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "rev",
												type: "number",
												value: settings.review,
												onChange: (e) => setSettings((s) => ({
													...s,
													review: Number(e.target.value)
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Awarded when a forum answer is marked helpful."
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "mile",
												children: "Escrow Auto-Release (hours)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "mile",
												type: "number",
												value: settings.escrowHours,
												onChange: (e) => setSettings((s) => ({
													...s,
													escrowHours: Number(e.target.value)
												}))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Hours before escrowed points release automatically."
											})
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-muted p-4 dark:bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-semibold",
										children: "Current Reward Summary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-3" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "space-y-2 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Registration"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold",
													children: [
														"+",
														settings.registration,
														" Pts"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Forum contribution"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold",
													children: [
														"+",
														settings.review,
														" Pts"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: "Escrow auto-release"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold",
													children: [settings.escrowHours, " hrs"]
												})]
											})
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: saveSettings,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 h-4 w-4" }), "Save System Settings"]
							})
						})]
					})
				]
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: warnOpen,
			onOpenChange: setWarnOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Issue Account Warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The user will receive an in-app notice and this warning will be logged." })] }),
					warnTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							className: "h-10 w-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: initials(warnTarget.name) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: warnTarget.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: warnTarget.major
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Warning Reason" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: warnReason,
							onValueChange: setWarnReason,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a reason" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "violent",
									children: "Violent content"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "fraud",
									children: "Fraudulent activity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "spam",
									children: "Spam"
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "msg",
							children: "Message to User"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "msg",
							rows: 4,
							placeholder: "Explain the violation and next steps...",
							value: warnMessage,
							onChange: (e) => setWarnMessage(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setWarnOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: submitWarning,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-2 h-4 w-4" }), "Send Account Warning"]
					})] })
				]
			})
		})
	] });
}
//#endregion
export { AdminPage as component };
