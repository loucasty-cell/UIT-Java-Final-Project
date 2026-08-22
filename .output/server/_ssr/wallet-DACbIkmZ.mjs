import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { O as Lock, c as TrendingUp, l as TrendingDown, n as Wallet, w as Minus, x as Plus, z as Download } from "../_libs/lucide-react.mjs";
import { h as useAuth, m as mockWallet, n as Button, p as formatPoints } from "./auth-CmX3G0zg.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { i as CardHeader, n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DOg6kRao.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-DACbIkmZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var transactions = [
	{
		date: "Jul 22, 2026",
		activity: "Mentored Priya A. - Data Structures",
		type: "earn",
		amount: 15
	},
	{
		date: "Jul 21, 2026",
		activity: "Booked session - Linear Algebra",
		type: "spend",
		amount: 10
	},
	{
		date: "Jul 20, 2026",
		activity: "Forum answer marked helpful",
		type: "earn",
		amount: 5
	},
	{
		date: "Jul 18, 2026",
		activity: "Booked session - Essay Review",
		type: "spend",
		amount: 10
	},
	{
		date: "Jul 15, 2026",
		activity: "Mentored Sam O. - Java OOP",
		type: "earn",
		amount: 20
	},
	{
		date: "Jul 12, 2026",
		activity: "Booked session - SQL Joins",
		type: "spend",
		amount: 10
	}
];
function WalletPage() {
	const auth = useAuth();
	(0, import_react.useEffect)(() => {
		if (!auth.isLoggedIn) auth.openLogin("Please sign in to access your wallet.");
	}, [auth]);
	if (!auth.isLoggedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "rounded-2xl p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Sign in required"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Please sign in to access your wallet and points history."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 rounded-xl",
					onClick: () => auth.openLogin("Please sign in to access your wallet."),
					children: "Sign In"
				})
			]
		})
	});
	const summaryCards = [
		{
			label: "Current Point Balance",
			value: formatPoints(mockWallet.currentBalance),
			hint: "Available for booking or rewards",
			icon: Wallet,
			accent: "bg-primary/10 text-primary",
			badge: `${mockWallet.escrowBalance} pts in escrow`
		},
		{
			label: "Total Earned",
			value: formatPoints(mockWallet.totalEarned, { sign: true }),
			hint: "From mentoring and helpful forum answers",
			icon: TrendingUp,
			accent: "bg-emerald-50 text-emerald-700"
		},
		{
			label: "Total Spent",
			value: formatPoints(mockWallet.totalSpent),
			hint: "Across booked learning sessions",
			icon: TrendingDown,
			accent: "bg-amber-50 text-amber-700"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl space-y-6 bg-background px-4 py-5 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-primary",
					children: "Wallet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
					children: "Wallet & Points"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm text-muted-foreground",
					children: "Manage your point balance, view earnings, and review transaction history."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 md:grid-cols-3",
				children: summaryCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "rounded-2xl shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex min-h-36 flex-col justify-between gap-4 p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl " + card.accent,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(card.icon, { className: "h-5 w-5" })
							}), card.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "rounded-full border-0 bg-accent text-[11px] font-medium text-primary hover:bg-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 h-3 w-3" }), card.badge]
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted-foreground",
								children: card.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold tracking-tight text-foreground",
								children: card.value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: card.hint
							})
						] })]
					})
				}, card.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden rounded-2xl shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-3 border-b border-border/70 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate text-base font-semibold text-foreground",
							children: "Point Transaction History"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: "Recent earned and spent points"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "shrink-0 rounded-lg text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 h-3.5 w-3.5" }), "Export CSV"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "border-border hover:bg-transparent",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "h-10 pl-4 text-xs",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "h-10 text-xs",
								children: "Activity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "h-10 text-xs",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "h-10 pr-4 text-right text-xs",
								children: "Points"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: transactions.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "whitespace-nowrap py-3 pl-4 text-xs text-muted-foreground",
								children: row.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "py-3 text-sm text-foreground",
								children: row.activity
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " + (row.type === "earn" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground"),
									children: [row.type === "earn" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-0.5 h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "mr-0.5 h-3 w-3" }), row.type === "earn" ? "Earned" : "Spent"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "py-3 pr-4 text-right text-sm font-semibold tabular-nums " + (row.type === "earn" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"),
								children: [
									row.type === "earn" ? "+" : "-",
									row.amount,
									" Pts"
								]
							})
						]
					}, `${row.date}-${row.activity}`)) })] })
				})]
			}) })
		]
	});
}
//#endregion
export { WalletPage as component };
