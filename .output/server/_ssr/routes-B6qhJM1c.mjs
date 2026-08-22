import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { L as FileText, O as Lock, S as Pencil, V as CloudUpload, nt as ArrowRight, o as Upload, x as Plus } from "../_libs/lucide-react.mjs";
import { a as DialogDescription, c as DialogTitle, h as useAuth, i as DialogContent, l as DialogTrigger, n as Button, o as DialogFooter, r as Dialog, s as DialogHeader } from "./auth-CmX3G0zg.mjs";
import { t as Separator } from "./separator-DYjBf1a5.mjs";
import { n as AvatarFallback, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { t as Badge } from "./badge-2IFggiCE.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B6qhJM1c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var defaultTeachSkills = [
	{
		name: "Java",
		level: "Advanced"
	},
	{
		name: "SQL",
		level: "Intermediate"
	},
	{
		name: "Data Structures",
		level: "Advanced"
	},
	{
		name: "Git",
		level: "Intermediate"
	}
];
var defaultLearnSkills = [
	{
		name: "React",
		level: "Beginner"
	},
	{
		name: "UI/UX",
		level: "Beginner"
	},
	{
		name: "TypeScript",
		level: "Intermediate"
	}
];
function levelClasses(level) {
	switch (level) {
		case "Advanced": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
		case "Intermediate": return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
		default: return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
	}
}
function SectionTitle({ title, subtitle, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "truncate text-sm font-semibold text-foreground",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: subtitle
			})]
		}), action]
	});
}
function Panel({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl bg-card p-4 ring-1 ring-border/70 dark:ring-border " + className,
		children
	});
}
function Dashboard() {
	const auth = useAuth();
	const [certificates, setCertificates] = (0, import_react.useState)([
		{
			name: "Java SE 21 Certified.pdf",
			size: "412 KB"
		},
		{
			name: "SQL Fundamentals — Coursera.pdf",
			size: "228 KB"
		},
		{
			name: "Intro to Data Structures — Stanford.pdf",
			size: "356 KB"
		}
	]);
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(null);
	const fileRef = (0, import_react.useRef)(null);
	const handleUpload = () => {
		if (!pending) return;
		setCertificates((c) => [{
			name: pending.name,
			size: `${Math.max(1, Math.round(pending.size / 1024))} KB`
		}, ...c]);
		setPending(null);
		setUploadOpen(false);
		toast.success("Certificate uploaded");
	};
	if (auth.userRole === "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/admin" });
	const teachSkills = auth.currentUser?.skillsTeach.length ? auth.currentUser.skillsTeach : defaultTeachSkills;
	const learnSkills = auth.currentUser?.skillsLearn.length ? auth.currentUser.skillsLearn : defaultLearnSkills;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-sm sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-[0.12em] text-primary-foreground/75",
							children: "Fall 2026 - Week 3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 truncate text-inherit text-xl font-semibold tracking-tight sm:text-2xl",
							children: "Welcome back, Alex"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-primary-foreground/80",
							children: "You have 2 sessions coming up this week - the next one is Thursday at 4:00 PM."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "shrink-0 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/mentors",
						children: ["Find a mentor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1.5 h-4 w-4" })]
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid items-start gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							className: "h-14 w-14",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
								className: "bg-primary text-primary-foreground text-base font-semibold",
								children: "AC"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "truncate text-base font-semibold text-foreground",
									children: "Alex Chen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: "Computer Science, Year 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "mt-1.5 rounded-full border-0 bg-emerald-50 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
									children: "Verified mentor"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 divide-x divide-slate-100 text-center dark:divide-border",
						children: [
							{
								v: "4.9",
								l: "Rating"
							},
							{
								v: "23",
								l: "Reviews"
							},
							{
								v: "8",
								l: "Sessions"
							}
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-semibold text-foreground",
							children: s.v
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: s.l
						})] }, s.l))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Certificates",
					subtitle: "Verified credentials",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
						open: uploadOpen,
						onOpenChange: setUploadOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								className: "shrink-0 rounded-lg text-primary hover:bg-primary/10 hover:text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1.5 h-3.5 w-3.5" }), "Upload"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
							className: "rounded-2xl sm:max-w-md",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Upload certificate" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "PDFs only. Certificates are reviewed before appearing on your public profile." })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => fileRef.current?.click(),
									className: "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted px-6 py-8 text-center transition hover:border-primary/35 hover:bg-primary/10 dark:border-border dark:bg-muted/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-7 w-7 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: pending ? pending.name : "Click to select a PDF"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Max 10 MB · PDF only"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "application/pdf",
									className: "hidden",
									onChange: (e) => setPending(e.target.files?.[0] ?? null)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										setPending(null);
										setUploadOpen(false);
									},
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: handleUpload,
									disabled: !pending,
									children: "Upload"
								})] })
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-slate-100 dark:divide-border",
					children: certificates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-foreground",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: ["PDF · ", c.size]
							})]
						})]
					}, c.name))
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Skills I can teach",
						subtitle: "Shown on your mentor profile",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "ghost",
							className: "shrink-0 rounded-lg text-primary hover:bg-primary/10 hover:text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/settings",
								search: { focus: "teach" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-1.5 h-3.5 w-3.5" }), "Edit"]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2.5 flex flex-wrap gap-2",
						children: teachSkills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "rounded-full border-0 px-2.5 py-1 text-xs font-medium " + levelClasses(s.level),
							children: [
								s.name,
								" · ",
								s.level
							]
						}, s.name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
						title: "Skills I want to learn",
						subtitle: "Used to match you with mentors",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "ghost",
							className: "shrink-0 rounded-lg text-primary hover:bg-primary/10 hover:text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/settings",
								search: { focus: "learn" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-3.5 w-3.5" }), "Add"]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2.5 flex flex-wrap gap-2",
						children: learnSkills.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "rounded-full border-0 px-2.5 py-1 text-xs font-medium " + levelClasses(s.level),
							children: [
								s.name,
								" · ",
								s.level
							]
						}, s.name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5 rounded-xl bg-muted px-3 py-2.5 dark:bg-muted/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "15 pts are currently in escrow."
								}),
								" ",
								"Points held for booked sessions transfer to your mentor once both sides confirm completion."
							]
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
export { Dashboard as component };
