import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { Z as Camera, a as UserRound, b as Save, m as ShieldCheck, u as Trash2, x as Plus } from "../_libs/lucide-react.mjs";
import { d as Label, f as cn, h as useAuth, n as Button, u as Input } from "./auth-CmX3G0zg.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-vm2UBFQP.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-DFtAAVyG.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BixMpYkw.mjs";
import { t as Textarea } from "./textarea-T99n1zi2.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BQwYuVAq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./settings-B_bLX3U_.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-m1lIJN5H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var skillLevels = [
	"Beginner",
	"Intermediate",
	"Advanced"
];
var emptySkill = () => ({
	name: "",
	level: "Beginner"
});
function cleanSkills(skills) {
	return skills.map((skill) => ({
		...skill,
		name: skill.name.trim()
	})).filter((skill) => skill.name.length > 0);
}
function SettingsPage() {
	const auth = useAuth();
	const search = Route.useSearch();
	const fileRef = (0, import_react.useRef)(null);
	const skillsTeachRef = (0, import_react.useRef)(null);
	const skillsLearnRef = (0, import_react.useRef)(null);
	const user = auth.currentUser;
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [major, setMajor] = (0, import_react.useState)("");
	const [academicYear, setAcademicYear] = (0, import_react.useState)("Year 3");
	const [bio, setBio] = (0, import_react.useState)("");
	const [skillsTeach, setSkillsTeach] = (0, import_react.useState)([emptySkill()]);
	const [skillsLearn, setSkillsLearn] = (0, import_react.useState)([emptySkill()]);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [sessionReminders, setSessionReminders] = (0, import_react.useState)(true);
	const [newRequests, setNewRequests] = (0, import_react.useState)(true);
	const [messageAlerts, setMessageAlerts] = (0, import_react.useState)(true);
	const [highlightedSkill, setHighlightedSkill] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!auth.isLoggedIn) {
			auth.openLogin("Please sign in to manage your settings.");
			return;
		}
		if (!user) return;
		setAvatarUrl(user.avatarUrl ?? "");
		setFullName(user.name);
		setMajor(user.major);
		setAcademicYear(user.academicYear);
		setBio(user.bio);
		setSkillsTeach(user.skillsTeach.length ? user.skillsTeach : [emptySkill()]);
		setSkillsLearn(user.skillsLearn.length ? user.skillsLearn : [emptySkill()]);
		setSessionReminders(user.notifications.sessionReminders);
		setNewRequests(user.notifications.newRequests);
		setMessageAlerts(user.notifications.messageAlerts);
	}, [auth, user]);
	(0, import_react.useEffect)(() => {
		if (!auth.isLoggedIn || !user || !search.focus) return;
		const target = search.focus === "teach" ? skillsTeachRef.current : skillsLearnRef.current;
		if (!target) return;
		const focusTimer = window.setTimeout(() => {
			setHighlightedSkill(search.focus ?? null);
			target.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
			target.querySelector("input")?.focus({ preventScroll: true });
		}, 100);
		const clearTimer = window.setTimeout(() => setHighlightedSkill(null), 2600);
		return () => {
			window.clearTimeout(focusTimer);
			window.clearTimeout(clearTimer);
		};
	}, [
		auth.isLoggedIn,
		search.focus,
		user
	]);
	if (!auth.isLoggedIn || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
					children: "Please sign in to manage your profile and account settings."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 rounded-xl",
					onClick: () => auth.openLogin("Please sign in to manage your settings."),
					children: "Sign In"
				})
			]
		})
	});
	const saveChanges = () => {
		if (newPassword || confirmPassword || currentPassword) {
			if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
				toast.error("Please complete password fields and make sure new passwords match.");
				return;
			}
		}
		auth.updateCurrentUser({
			name: fullName.trim() || user.name,
			avatar: (fullName.trim() || user.name).split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
			avatarUrl,
			major: major.trim(),
			academicYear,
			bio: bio.trim(),
			skillsTeach: cleanSkills(skillsTeach),
			skillsLearn: cleanSkills(skillsLearn),
			notifications: {
				sessionReminders,
				newRequests,
				messageAlerts
			}
		});
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		toast.success("Settings saved.");
	};
	const handleAvatar = (file) => {
		if (!file) return;
		setAvatarUrl(URL.createObjectURL(file));
	};
	const updateTeachSkill = (index, patch) => {
		setSkillsTeach((skills) => skills.map((skill, skillIndex) => skillIndex === index ? {
			...skill,
			...patch
		} : skill));
	};
	const updateLearnSkill = (index, patch) => {
		setSkillsLearn((skills) => skills.map((skill, skillIndex) => skillIndex === index ? {
			...skill,
			...patch
		} : skill));
	};
	const removeTeachSkill = (index) => {
		setSkillsTeach((skills) => skills.length === 1 ? [emptySkill()] : skills.filter((_, skillIndex) => skillIndex !== index));
	};
	const removeLearnSkill = (index) => {
		setSkillsLearn((skills) => skills.length === 1 ? [emptySkill()] : skills.filter((_, skillIndex) => skillIndex !== index));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl space-y-6 px-4 py-5 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-primary",
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-bold tracking-tight sm:text-3xl",
					children: "Account Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Update your profile, skills, password, and notification preferences."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "profile",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-full grid-cols-2 sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "profile",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "mr-1.5 h-4 w-4" }), "Profile Settings"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "security",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mr-1.5 h-4 w-4" }), "Account & Security"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "profile",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "rounded-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Profile Settings" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-4 sm:flex-row sm:items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
											className: "h-20 w-20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatarUrl }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
												className: "bg-primary text-lg font-semibold text-primary-foreground",
												children: user.avatar
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												ref: fileRef,
												type: "file",
												accept: "image/*",
												className: "hidden",
												onChange: (event) => handleAvatar(event.target.files?.[0])
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												className: "rounded-xl",
												onClick: () => fileRef.current?.click(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-1.5 h-4 w-4" }), "Upload Avatar"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "Preview updates immediately before saving."
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: fullName,
													onChange: (event) => setFullName(event.target.value),
													className: "rounded-xl"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Academic Major / Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: major,
													onChange: (event) => setMajor(event.target.value),
													className: "rounded-xl"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Academic Year" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: academicYear,
													onValueChange: setAcademicYear,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "rounded-xl",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Year 1",
															children: "Year 1"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Year 2",
															children: "Year 2"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Year 3",
															children: "Year 3"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Year 4",
															children: "Year 4"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Staff",
															children: "Staff"
														})
													] })]
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bio / Introduction" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											value: bio,
											onChange: (event) => setBio(event.target.value),
											rows: 4,
											className: "rounded-xl"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-3 rounded-2xl bg-muted/30 p-3 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xl bg-background p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-muted-foreground",
													children: "Mentor Rating"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-lg font-bold text-foreground",
													children: user.mentorStats.rating.toFixed(1)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xl bg-background p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-muted-foreground",
													children: "Reviews"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-lg font-bold text-foreground",
													children: user.mentorStats.reviews
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xl bg-background p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium text-muted-foreground",
													children: "Completed Sessions"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-lg font-bold text-foreground",
													children: user.mentorStats.completedSessions
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 md:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											ref: skillsTeachRef,
											className: "space-y-3 rounded-2xl border border-transparent p-3 transition-colors " + (highlightedSkill === "teach" ? "border-secondary/30 bg-accent ring-2 ring-secondary/20" : "bg-muted/30"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skills I Can Teach" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "space-y-2",
													children: skillsTeach.map((skill, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillRow, {
														skill,
														onNameChange: (name) => updateTeachSkill(index, { name }),
														onLevelChange: (level) => updateTeachSkill(index, { level }),
														onRemove: () => removeTeachSkill(index)
													}, `teach-${index}`))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "button",
													variant: "outline",
													className: "w-full rounded-xl border-dashed",
													onClick: () => setSkillsTeach((skills) => [...skills, emptySkill()]),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "Add Skill"]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											ref: skillsLearnRef,
											className: "space-y-3 rounded-2xl border border-transparent p-3 transition-colors " + (highlightedSkill === "learn" ? "border-secondary/30 bg-accent ring-2 ring-secondary/20" : "bg-muted/30"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skills I Want to Learn" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "space-y-2",
													children: skillsLearn.map((skill, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillRow, {
														skill,
														onNameChange: (name) => updateLearnSkill(index, { name }),
														onLevelChange: (level) => updateLearnSkill(index, { level }),
														onRemove: () => removeLearnSkill(index)
													}, `learn-${index}`))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "button",
													variant: "outline",
													className: "w-full rounded-xl border-dashed",
													onClick: () => setSkillsLearn((skills) => [...skills, emptySkill()]),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 h-4 w-4" }), "Add Skill"]
												})
											]
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "security",
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "rounded-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Account & Security Settings" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 md:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Current Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "password",
												value: currentPassword,
												onChange: (event) => setCurrentPassword(event.target.value),
												className: "rounded-xl"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "password",
												value: newPassword,
												onChange: (event) => setNewPassword(event.target.value),
												className: "rounded-xl"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirm Password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "password",
												value: confirmPassword,
												onChange: (event) => setConfirmPassword(event.target.value),
												className: "rounded-xl"
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceSwitch, {
											label: "Session reminders",
											description: "Email me before upcoming sessions.",
											checked: sessionReminders,
											onCheckedChange: setSessionReminders
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceSwitch, {
											label: "New requests",
											description: "Email me when someone requests a session.",
											checked: newRequests,
											onCheckedChange: setNewRequests
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceSwitch, {
											label: "Message alerts",
											description: "Email me when I receive a new message.",
											checked: messageAlerts,
											onCheckedChange: setMessageAlerts
										})
									]
								})]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "rounded-xl bg-primary hover:bg-[#0F2742]",
					onClick: saveChanges,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1.5 h-4 w-4" }), "Save Changes"]
				})
			})
		]
	});
}
function SkillRow({ skill, onNameChange, onLevelChange, onRemove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 rounded-xl border border-slate-200 bg-background p-2 shadow-sm sm:grid-cols-[minmax(0,1fr)_9.5rem_auto]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: skill.name,
				onChange: (event) => onNameChange(event.target.value),
				placeholder: "Skill name",
				className: "rounded-lg border-slate-200"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: skill.level,
				onValueChange: (value) => onLevelChange(value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "rounded-lg border-slate-200",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: skillLevels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: level,
					children: level
				}, level)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600",
				onClick: onRemove,
				"aria-label": `Remove ${skill.name || "skill"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			})
		]
	});
}
function PreferenceSwitch({ label, description, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: description
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange
		})]
	});
}
//#endregion
export { SettingsPage as component };
