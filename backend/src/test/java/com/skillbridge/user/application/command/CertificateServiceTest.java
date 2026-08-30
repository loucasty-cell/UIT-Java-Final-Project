package com.skillbridge.user.application.command;

import com.skillbridge.shared.infrastructure.storage.StorageService;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.skill.SkillTestRepositoryFactory;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.api.dto.response.CertificateResponse;
import com.skillbridge.user.api.mapper.CertificateMapper;
import com.skillbridge.user.domain.entity.Certificate;
import com.skillbridge.user.infrastructure.persistence.CertificateRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.mock.web.MockMultipartFile;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

public class CertificateServiceTest {

    private final UUID currentUserId = UUID.randomUUID();
    private final UUID skillId = UUID.randomUUID();

    private FakeCertificateRepository certificateRepository;
    private SkillRepository skillRepository;
    private FakeStorageService storageService;
    private CertificateService certificateService;

    @BeforeEach
    void setUp() {
        TestAuthContext.loginAs(currentUserId);
        certificateRepository = new FakeCertificateRepository();
        storageService = new FakeStorageService();

        Skill skill = SkillTestRepositoryFactory.skill(skillId, "Java", "Programming", "Backend");
        skillRepository = SkillTestRepositoryFactory.repositoryWith(skill);

        certificateService = new CertificateService(
                certificateRepository,
                skillRepository,
                storageService,
                new CertificateMapper()
        );
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void uploadCertificate_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cert.pdf",
                "application/pdf",
                "dummy pdf content".getBytes()
        );

        CertificateResponse response = certificateService.uploadCertificate(skillId, file);

        assertNotNull(response);
        assertEquals(currentUserId, response.getUserId());
        assertEquals("cert.pdf", response.getFileName());
        assertEquals("Java", response.getSkill().getName());
        assertEquals(1, certificateRepository.count());
    }

    @Test
    void uploadCertificate_rejectsNonPdf() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "dummy image".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> certificateService.uploadCertificate(skillId, file));
    }

    @Test
    void downloadCertificate_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cert.pdf",
                "application/pdf",
                "my certificate bytes".getBytes()
        );
        certificateService.uploadCertificate(skillId, file);

        byte[] downloaded = certificateService.downloadCertificate(currentUserId, skillId);
        assertArrayEquals("my certificate bytes".getBytes(), downloaded);
    }

    @Test
    void deleteCertificate_removesRecordAndStorage() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cert.pdf",
                "application/pdf",
                "bytes".getBytes()
        );
        certificateService.uploadCertificate(skillId, file);

        certificateService.deleteCertificate(skillId);

        assertTrue(certificateRepository.findAll().isEmpty());
    }

    private static class FakeCertificateRepository implements CertificateRepository {
        private final Map<UUID, Certificate> store = new HashMap<>();

        @Override
        public List<Certificate> findByUserIdOrderByCreatedAtDesc(UUID userId) {
            return store.values().stream()
                    .filter(c -> c.getUserId().equals(userId))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }

        @Override
        public Optional<Certificate> findByUserIdAndSkillId(UUID userId, UUID skillId) {
            return store.values().stream()
                    .filter(c -> c.getUserId().equals(userId) && c.getSkillId().equals(skillId))
                    .findFirst();
        }

        @Override
        public boolean existsByUserIdAndSkillId(UUID userId, UUID skillId) {
            return store.values().stream()
                    .anyMatch(c -> c.getUserId().equals(userId) && c.getSkillId().equals(skillId));
        }

        @Override
        public <S extends Certificate> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            if (entity.getCreatedAt() == null) entity.setCreatedAt(OffsetDateTime.now());
            if (entity.getUpdatedAt() == null) entity.setUpdatedAt(OffsetDateTime.now());
            store.put(entity.getId(), entity);
            return entity;
        }

        @Override public Optional<Certificate> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public List<Certificate> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<Certificate> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(Certificate entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends Certificate> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends Certificate> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Certificate> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<Certificate> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public Certificate getOne(UUID uuid) { return store.get(uuid); }
        @Override public Certificate getById(UUID uuid) { return store.get(uuid); }
        @Override public Certificate getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends Certificate> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Certificate> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends Certificate> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends Certificate> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends Certificate> long count(Example<S> example) { return 0; }
        @Override public <S extends Certificate> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Certificate, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends Certificate> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<Certificate> findAll(Sort sort) { return List.of(); }
        @Override public Page<Certificate> findAll(Pageable pageable) { return Page.empty(); }
    }

    private static class FakeStorageService implements StorageService {
        private final Map<String, byte[]> store = new HashMap<>();

        @Override
        public String store(String filename, byte[] content, String contentType) {
            String key = UUID.randomUUID() + "-" + filename;
            store.put(key, content);
            return key;
        }

        @Override
        public byte[] load(String storageKey) {
            byte[] bytes = store.get(storageKey);
            if (bytes == null) throw new IllegalArgumentException("File not found");
            return bytes;
        }

        @Override
        public void delete(String storageKey) {
            store.remove(storageKey);
        }

        @Override
        public boolean exists(String storageKey) {
            return store.containsKey(storageKey);
        }
    }
}

