import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Slot, p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CmX3G0zg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-[#0F2742]",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var mockWallet = {
	currentBalance: 50,
	escrowBalance: 15,
	totalEarned: 120,
	totalSpent: 70
};
function formatPoints(points, options) {
	return `${options?.sign && points > 0 ? "+" : ""}${points} Pts`;
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var AuthContext = (0, import_react.createContext)(null);
var defaultPrompt = "Please sign in to request sessions or post content.";
function AuthProvider({ children }) {
	const [userRole, setUserRole] = (0, import_react.useState)("guest");
	const [currentUser, setCurrentUser] = (0, import_react.useState)(null);
	const [loginOpen, setLoginOpen] = (0, import_react.useState)(false);
	const [loginPrompt, setLoginPrompt] = (0, import_react.useState)(defaultPrompt);
	const openLogin = (message = defaultPrompt) => {
		setLoginPrompt(message);
		setLoginOpen(true);
	};
	const value = (0, import_react.useMemo)(() => ({
		isLoggedIn: userRole !== "guest",
		userRole,
		currentUser,
		login: ({ email, role }) => {
			const isAdmin = role === "admin";
			setUserRole(role);
			setCurrentUser({
				name: isAdmin ? "Admin User" : "Ava Ramirez",
				email,
				avatar: isAdmin ? "AU" : "AR",
				major: isAdmin ? "Platform Administration" : "Computer Science",
				academicYear: isAdmin ? "Staff" : "Year 3",
				bio: isAdmin ? "Platform administrator for SkillBridge operations." : "Computer Science student focused on peer learning, Java, and data structures.",
				skillsTeach: isAdmin ? [{
					name: "Moderation",
					level: "Advanced"
				}] : [
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
				],
				skillsLearn: isAdmin ? [{
					name: "Platform Analytics",
					level: "Intermediate"
				}] : [
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
				],
				notifications: {
					sessionReminders: true,
					newRequests: true,
					messageAlerts: true
				},
				pointBalance: mockWallet.currentBalance,
				mentorStats: isAdmin ? {
					rating: 5,
					reviews: 0,
					completedSessions: 0
				} : {
					rating: 4.9,
					reviews: 18,
					completedSessions: 42
				}
			});
			setLoginOpen(false);
		},
		logout: () => {
			setUserRole("guest");
			setCurrentUser(null);
		},
		updateCurrentUser: (patch) => {
			setCurrentUser((user) => user ? {
				...user,
				...patch
			} : user);
		},
		awardPoints: (points) => {
			mockWallet.currentBalance += points;
			setCurrentUser((user) => user ? {
				...user,
				pointBalance: mockWallet.currentBalance
			} : user);
		},
		openLogin,
		requireAuth: (message = defaultPrompt) => {
			if (userRole !== "guest") return true;
			openLogin(message);
			return false;
		}
	}), [currentUser, userRole]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthContext.Provider, {
		value,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
			open: loginOpen,
			prompt: loginPrompt,
			onOpenChange: setLoginOpen
		})]
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
function AuthModal({ open, prompt, onOpenChange }) {
	const auth = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [asAdmin, setAsAdmin] = (0, import_react.useState)(false);
	const [adminCode, setAdminCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const submit = () => {
		setError("");
		if (!email.trim() || !password.trim()) {
			setError("Email / Username and Password are required.");
			return;
		}
		if (asAdmin && adminCode.trim() !== "ADMIN123") {
			setError("Invalid Admin Security Code");
			return;
		}
		auth.login({
			email: email.trim(),
			role: asAdmin ? "admin" : "user"
		});
		if (asAdmin) navigate({ to: "/admin" });
		setEmail("");
		setPassword("");
		setAdminCode("");
		setAsAdmin(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-2xl sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Sign in to SkillBridge" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: prompt })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "auth-email",
								children: "Email / Username"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "auth-email",
								value: email,
								onChange: (event) => setEmail(event.target.value),
								placeholder: "ava@skillbridge.edu",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "auth-password",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "auth-password",
								type: "password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "Enter password",
								className: "rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm font-medium text-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: asAdmin,
								onChange: (event) => setAsAdmin(event.target.checked),
								className: "h-4 w-4 rounded border-slate-300 text-primary"
							}), "Log in as Admin"]
						}),
						asAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "admin-code",
								children: "Admin Security Code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "admin-code",
								value: adminCode,
								onChange: (event) => setAdminCode(event.target.value),
								placeholder: "ADMIN123",
								className: "rounded-xl"
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-destructive",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					children: "Sign In"
				})] })
			]
		})
	});
}
//#endregion
export { DialogDescription as a, DialogTitle as c, Label as d, cn as f, useAuth as h, DialogContent as i, DialogTrigger as l, mockWallet as m, Button as n, DialogFooter as o, formatPoints as p, Dialog as r, DialogHeader as s, AuthProvider as t, Input as u };
