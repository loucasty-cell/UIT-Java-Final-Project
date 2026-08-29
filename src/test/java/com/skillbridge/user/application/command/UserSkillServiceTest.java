package com.skillbridge.user.application.command;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import com.skillbridge.skill.SkillTestRepositoryFactory;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.user.api.dto.request.UserSkillCreateRequest;
import com.skillbridge.user.api.dto.request.UserSkillUpdateRequest;
import com.skillbridge.user.api.dto.response.UserSkillResponse;
import com.skillbridge.user.api.mapper.UserSkillMapper;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

public class UserSkillServiceTest {

    private final UUID currentUserId = UUID.randomUUID();
    private final UUID skillId = UUID.randomUUID();

    private FakeUserSkillRepository userSkillRepository;
    private SkillRepository skillRepository;
    private UserSkillService userSkillService;

    @BeforeEach
    void setUp() {
        TestAuthContext.loginAs(currentUserId);
        userSkillRepository = new FakeUserSkillRepository();

        Skill skill = SkillTestRepositoryFactory.skill(skillId, "Java", "Programming", "Backend");
        skillRepository = SkillTestRepositoryFactory.repositoryWith(skill);

        userSkillService = new UserSkillService(userSkillRepository, skillRepository, new UserSkillMapper());
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void createUserSkill_success() {
        UserSkillCreateRequest request = UserSkillCreateRequest.builder()
                .skillId(skillId)
                .direction(Direction.TEACH)
                .level(Level.ADVANCED)
                .build();

        UserSkillResponse response = userSkillService.createUserSkill(request);

        assertNotNull(response);
        assertEquals(skillId, response.getSkill().getId());
        assertEquals("Java", response.getSkill().getName());
        assertEquals(Direction.TEACH, response.getDirection());
        assertEquals(Level.ADVANCED, response.getLevel());
    }

    @Test
    void createUserSkill_failsWhenDuplicate() {
        UserSkillCreateRequest request = UserSkillCreateRequest.builder()
                .skillId(skillId)
                .direction(Direction.TEACH)
                .level(Level.ADVANCED)
                .build();

        userSkillService.createUserSkill(request);

        assertThrows(IllegalArgumentException.class, () -> userSkillService.createUserSkill(request));
    }

    @Test
    void createUserSkill_failsWhenSkillNotFound() {
        UserSkillCreateRequest request = UserSkillCreateRequest.builder()
                .skillId(UUID.randomUUID())
                .direction(Direction.TEACH)
                .level(Level.ADVANCED)
                .build();

        assertThrows(IllegalArgumentException.class, () -> userSkillService.createUserSkill(request));
    }

    @Test
    void getUserSkills_filtersByDirection() {
        userSkillService.createUserSkill(UserSkillCreateRequest.builder()
                .skillId(skillId)
                .direction(Direction.TEACH)
                .level(Level.ADVANCED)
                .build());

        List<UserSkillResponse> teachSkills = userSkillService.getUserSkills(Direction.TEACH);
        List<UserSkillResponse> learnSkills = userSkillService.getUserSkills(Direction.LEARN);

        assertEquals(1, teachSkills.size());
        assertEquals(0, learnSkills.size());
    }

    @Test
    void updateUserSkill_updatesLevel() {
        UserSkillResponse created = userSkillService.createUserSkill(UserSkillCreateRequest.builder()
                .skillId(skillId)
                .direction(Direction.TEACH)
                .level(Level.BEGINNER)
                .build());

        UserSkillResponse updated = userSkillService.updateUserSkill(created.getId(),
                new UserSkillUpdateRequest(Level.ADVANCED));

        assertEquals(Level.ADVANCED, updated.getLevel());
    }

    @Test
    void deleteUserSkill_removesSkill() {
        UserSkillResponse created = userSkillService.createUserSkill(UserSkillCreateRequest.builder()
                .skillId(skillId)
                .direction(Direction.TEACH)
                .level(Level.BEGINNER)
                .build());

        userSkillService.deleteUserSkill(created.getId());

        assertTrue(userSkillService.getUserSkills(null).isEmpty());
    }

    private static class FakeUserSkillRepository implements UserSkillRepository {
        private final Map<UUID, UserSkill> store = new HashMap<>();

        @Override
        public List<UserSkill> findByUserIdOrderByCreatedAtDesc(UUID userId) {
            return store.values().stream()
                    .filter(us -> us.getUserId().equals(userId))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }

        @Override
        public List<UserSkill> findByUserIdAndDirectionOrderByCreatedAtDesc(UUID userId, Direction direction) {
            return store.values().stream()
                    .filter(us -> us.getUserId().equals(userId) && us.getDirection() == direction)
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }

        @Override
        public Optional<UserSkill> findByIdAndUserId(UUID id, UUID userId) {
            return Optional.ofNullable(store.get(id))
                    .filter(us -> us.getUserId().equals(userId));
        }

        @Override
        public boolean existsByUserIdAndSkillIdAndDirection(UUID userId, UUID skillId, Direction direction) {
            return store.values().stream()
                    .anyMatch(us -> us.getUserId().equals(userId) && us.getSkillId().equals(skillId) && us.getDirection() == direction);
        }

        @Override
        public <S extends UserSkill> S save(S entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            if (entity.getCreatedAt() == null) {
                entity.setCreatedAt(OffsetDateTime.now());
            }
            if (entity.getUpdatedAt() == null) {
                entity.setUpdatedAt(OffsetDateTime.now());
            }
            store.put(entity.getId(), entity);
            return entity;
        }

        @Override public Optional<UserSkill> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public List<UserSkill> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<UserSkill> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(UserSkill entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends UserSkill> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends UserSkill> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends UserSkill> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<UserSkill> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public UserSkill getOne(UUID uuid) { return store.get(uuid); }
        @Override public UserSkill getById(UUID uuid) { return store.get(uuid); }
        @Override public UserSkill getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends UserSkill> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends UserSkill> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends UserSkill> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends UserSkill> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends UserSkill> long count(Example<S> example) { return 0; }
        @Override public <S extends UserSkill> boolean exists(Example<S> example) { return false; }
        @Override public <S extends UserSkill, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends UserSkill> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<UserSkill> findAll(Sort sort) { return List.of(); }
        @Override public Page<UserSkill> findAll(Pageable pageable) { return Page.empty(); }
    }
}

