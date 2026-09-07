package com.skillbridge.shared.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA fallback: forward non-API, non-static routes to index.html for React Router.
 * Allows direct navigation to /browse, /profile etc. when UI is served from Spring Boot static/ (embedded JAR).
 * API and actuator/swagger paths are excluded via SecurityConfig and static resource handling.
 */
@Controller
public class SpaFallbackController {

    @RequestMapping(value = {
            "/",
            "/browse", "/browse/**",
            "/mentors", "/mentors/**",
            "/forum", "/forum/**",
            "/sessions", "/sessions/**",
            "/wallet", "/wallet/**",
            "/watchlist", "/watchlist/**",
            "/profile", "/profile/**",
            "/me/**",
            "/skill/**",
            "/mentor-application", "/mentor-application/**",
            "/instructor", "/instructor/**",
            "/admin", "/admin/**",
            "/login"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
