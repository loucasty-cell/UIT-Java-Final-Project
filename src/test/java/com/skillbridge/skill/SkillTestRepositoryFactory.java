package com.skillbridge.skill;

import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public final class SkillTestRepositoryFactory {

    private SkillTestRepositoryFactory() {
    }

    public static SkillRepository repositoryWith(Skill... initialSkills) {
        Map<UUID, Skill> skills = new LinkedHashMap<>();
        for (Skill skill : initialSkills) {
            if (skill.getId() == null) {
                skill.setId(UUID.randomUUID());
            }
            skills.put(skill.getId(), skill);
        }

        InvocationHandler handler = (proxy, method, args) -> {
            String methodName = method.getName();

            if ("findAll".equals(methodName)) {
                return new ArrayList<>(skills.values());
            }
            if ("findById".equals(methodName)) {
                return Optional.ofNullable(skills.get((UUID) args[0]));
            }
            if ("save".equals(methodName)) {
                Skill skill = (Skill) args[0];
                if (skill.getId() == null) {
                    skill.setId(UUID.randomUUID());
                }
                skills.put(skill.getId(), skill);
                return skill;
            }
            if ("deleteById".equals(methodName)) {
                skills.remove((UUID) args[0]);
                return null;
            }
            if ("findByCategory".equals(methodName)) {
                String category = (String) args[0];
                return skills.values().stream()
                        .filter(skill -> category.equals(skill.getCategory()))
                        .toList();
            }
            if ("findByNameContainingIgnoreCase".equals(methodName)) {
                String query = ((String) args[0]).toLowerCase();
                return skills.values().stream()
                        .filter(skill -> skill.getName() != null && skill.getName().toLowerCase().contains(query))
                        .toList();
            }
            if ("toString".equals(methodName)) {
                return "SkillRepository test proxy";
            }
            if ("hashCode".equals(methodName)) {
                return System.identityHashCode(proxy);
            }
            if ("equals".equals(methodName)) {
                return proxy == args[0];
            }

            throw new UnsupportedOperationException("Unsupported repository method in test: " + methodName);
        };

        return (SkillRepository) Proxy.newProxyInstance(
                SkillRepository.class.getClassLoader(),
                new Class<?>[]{SkillRepository.class},
                handler
        );
    }

    public static Skill skill(UUID id, String name, String category, String description) {
        return Skill.builder()
                .id(id)
                .name(name)
                .category(category)
                .description(description)
                .build();
    }
}
