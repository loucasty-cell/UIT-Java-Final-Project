globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/alert-Cvv5r0Dd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"432-ZM3+KLeiqfZU9nUi2OfpBry4PXc\"",
		"mtime": "2026-08-13T03:07:38.455Z",
		"size": 1074,
		"path": "../public/assets/alert-Cvv5r0Dd.js"
	},
	"/assets/admin-EBH9vqEt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3413-jwivSkVzkGeXG10qi5cg3PnwYmg\"",
		"mtime": "2026-08-13T03:07:38.454Z",
		"size": 13331,
		"path": "../public/assets/admin-EBH9vqEt.js"
	},
	"/assets/card-B7UQauHo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"423-X7Eswq5NfiWD5IcsnyKQc3MCLQU\"",
		"mtime": "2026-08-13T03:07:38.457Z",
		"size": 1059,
		"path": "../public/assets/card-B7UQauHo.js"
	},
	"/assets/chevron-down-B7DbF5A7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74-qI2QlBuAg846CXdFJYGidMVwcIQ\"",
		"mtime": "2026-08-13T03:07:38.458Z",
		"size": 116,
		"path": "../public/assets/chevron-down-B7DbF5A7.js"
	},
	"/assets/circle-check-CrpnlI5_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a6-j9+glwDCY7Z01/GvNl9Hj1tyu+8\"",
		"mtime": "2026-08-13T03:07:38.460Z",
		"size": 166,
		"path": "../public/assets/circle-check-CrpnlI5_.js"
	},
	"/assets/flag-CjUkKce-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2-+W0gvwr4sWgqF3GupmfigKQ2KWs\"",
		"mtime": "2026-08-13T03:07:38.461Z",
		"size": 242,
		"path": "../public/assets/flag-CjUkKce-.js"
	},
	"/assets/handshake-C8XGKhD-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b2-6ILP492Y5WjnLzou660nMn1jAi0\"",
		"mtime": "2026-08-13T03:07:38.465Z",
		"size": 434,
		"path": "../public/assets/handshake-C8XGKhD-.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-02T13:04:46.272Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/lock-D-kIR1uS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-1yobr0xC1Qv4xkZdxQBTXUETN5g\"",
		"mtime": "2026-08-13T03:07:38.466Z",
		"size": 194,
		"path": "../public/assets/lock-D-kIR1uS.js"
	},
	"/assets/auth-BZSOTCIp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156f9-cUvDUqCtoCYR9zgu6IEbajga/fc\"",
		"mtime": "2026-08-13T03:07:38.456Z",
		"size": 87801,
		"path": "../public/assets/auth-BZSOTCIp.js"
	},
	"/assets/forum-kZ077Oe7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4695-N+kU4+nOWiuhzj1TZKsTXjeGtGA\"",
		"mtime": "2026-08-13T03:07:38.464Z",
		"size": 18069,
		"path": "../public/assets/forum-kZ077Oe7.js"
	},
	"/assets/mentors-DJozK1DD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8aa7-2OHx5asVvKlFLE5x4M27iyIDE7M\"",
		"mtime": "2026-08-13T03:07:38.467Z",
		"size": 35495,
		"path": "../public/assets/mentors-DJozK1DD.js"
	},
	"/assets/plus-C_P6eVu4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-0QtNGS4NgTx6HNrVbrU7xrEiGMA\"",
		"mtime": "2026-08-13T03:07:38.471Z",
		"size": 141,
		"path": "../public/assets/plus-C_P6eVu4.js"
	},
	"/assets/noticeboard-BxuNyC5_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ac4-w8F4CCyoHirjZ72oUEL5cy5GX1o\"",
		"mtime": "2026-08-13T03:07:38.469Z",
		"size": 15044,
		"path": "../public/assets/noticeboard-BxuNyC5_.js"
	},
	"/assets/send-OzjqDmFC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116-1trqpsDz9WJl7Wr+wbhHiLg+QEw\"",
		"mtime": "2026-08-13T03:07:38.477Z",
		"size": 278,
		"path": "../public/assets/send-OzjqDmFC.js"
	},
	"/assets/sessions-BjaUe4Ew.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2dd3-aV5HpdVb1ejmoRcR+Jtwr05D+h8\"",
		"mtime": "2026-08-13T03:07:38.501Z",
		"size": 11731,
		"path": "../public/assets/sessions-BjaUe4Ew.js"
	},
	"/assets/routes-Dwsp9-7u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2303-nRsP3Rh+Ufs5RtbigI/JvdEaEvE\"",
		"mtime": "2026-08-13T03:07:38.473Z",
		"size": 8963,
		"path": "../public/assets/routes-Dwsp9-7u.js"
	},
	"/assets/shield-check-Dtq3HR-l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"134-LbVVVF4xVUyFM9/DrGywCMz/fGA\"",
		"mtime": "2026-08-13T03:07:38.505Z",
		"size": 308,
		"path": "../public/assets/shield-check-Dtq3HR-l.js"
	},
	"/assets/star-DwHZARAq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cc-X34KWMmLwA+woUntMLyfLzgavkc\"",
		"mtime": "2026-08-13T03:07:38.506Z",
		"size": 460,
		"path": "../public/assets/star-DwHZARAq.js"
	},
	"/assets/select-CIYL2LUZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"566e-j8epKW9wTwK599c9//VZSeBrhvs\"",
		"mtime": "2026-08-13T03:07:38.475Z",
		"size": 22126,
		"path": "../public/assets/select-CIYL2LUZ.js"
	},
	"/assets/settings-CGVXsvHO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c3e-+jGllCzl3NZuotPV5ZSTnd4YPc4\"",
		"mtime": "2026-08-13T03:07:38.503Z",
		"size": 15422,
		"path": "../public/assets/settings-CGVXsvHO.js"
	},
	"/assets/skillbridge-logo.png": {
		"type": "image/png",
		"etag": "\"175c6-mxfF1dcqfhDbDwEhYaRJpohOB5Q\"",
		"mtime": "2026-08-08T12:46:06.605Z",
		"size": 95686,
		"path": "../public/assets/skillbridge-logo.png"
	},
	"/assets/table-Dtj8IpgK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"646-9gdeuNbjI8L0zZurxj3Hp+eHsoo\"",
		"mtime": "2026-08-13T03:07:38.512Z",
		"size": 1606,
		"path": "../public/assets/table-Dtj8IpgK.js"
	},
	"/assets/index-D8PQwHnt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74277-8Hj4cuRTLHy/uNm0txKhicpYGag\"",
		"mtime": "2026-08-13T03:07:38.453Z",
		"size": 475767,
		"path": "../public/assets/index-D8PQwHnt.js"
	},
	"/assets/styles-DH8dlMFM.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"18a14-eRPa9MjmIsWheDsxWQwK7daSRVA\"",
		"mtime": "2026-08-13T03:07:38.529Z",
		"size": 100884,
		"path": "../public/assets/styles-DH8dlMFM.css"
	},
	"/assets/textarea-CVgodDNL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e1-uc3fdE1+4TBde4ov/o9EvpfU8aM\"",
		"mtime": "2026-08-13T03:07:38.518Z",
		"size": 481,
		"path": "../public/assets/textarea-CVgodDNL.js"
	},
	"/assets/trash-2-j9exHGrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24e-FfLBPRIOpktn4H/ZPfYmrhd8zPM\"",
		"mtime": "2026-08-13T03:07:38.524Z",
		"size": 590,
		"path": "../public/assets/trash-2-j9exHGrv.js"
	},
	"/assets/wallet-DPuHAkbw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1778-bCF78lnQvSrt8FLZG2H2qi4tL0g\"",
		"mtime": "2026-08-13T03:07:38.528Z",
		"size": 6008,
		"path": "../public/assets/wallet-DPuHAkbw.js"
	},
	"/assets/tabs-dD7v-GMl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d74-ge+Qivmv+dPV38iCy1bkdnajTV4\"",
		"mtime": "2026-08-13T03:07:38.515Z",
		"size": 3444,
		"path": "../public/assets/tabs-dD7v-GMl.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_sbFy3v = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_sbFy3v
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
