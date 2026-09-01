# V23 Validation Checklist & Deployment Guide

**Version:** V23 - Add Referential Integrity Retrofit  
**Date:** September 1, 2026  
**Status:** Ready for Production Deployment

---

## Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Flyway migrations reviewed (V23__add_referential_integrity_retrofit.sql)
- [ ] V23 validation tests reviewed (V23_validation_tests.sql)
- [ ] All code changes validated
- [ ] CI/CD pipeline ready
- [ ] Rollback plan documented

---

## Deployment Steps

### 1. Stage Changes
```bash
git add DEMO.md FINAL_SUMMARY.md V23_VALIDATION_CHECKLIST.md implementation_plan.md
git add backend/src/main/resources/db/migration/V23__add_referential_integrity_retrofit.sql
git add backend/src/main/resources/db/migration/V23_validation_tests.sql
```

### 2. Commit Changes
```bash
git commit -m "docs: Add V23 validation, enhance DEMO with architecture diagrams, clean redundant files"
```

### 3. Push to Main
```bash
git push origin main
```

### 4. Monitor CI/CD
- GitHub Actions triggers automatically
- Backend builds and runs tests
- Docker image builds and deploys
- Application boots with Flyway V23 migration

---

## Post-Deployment Validation

Run these 4 SQL queries to verify V23 deployment success:

### Query 1: Verify FK Constraints
```sql
SELECT COUNT(*) FROM pg_constraint 
WHERE contype = 'f' AND conname LIKE 'fk_%';
```
**Expected Result:** >= 19

### Query 2: Verify No Orphaned Records
```sql
SELECT COUNT(*) FROM wallets 
WHERE user_id NOT IN (SELECT id FROM users);
```
**Expected Result:** 0

### Query 3: Verify Performance Indexes
```sql
SELECT COUNT(*) FROM pg_indexes 
WHERE indexname LIKE 'idx_%' AND schemaname = 'public';
```
**Expected Result:** >= 15

### Query 4: Verify Flyway Success
```sql
SELECT version, success FROM flyway_schema_history 
WHERE version = '23';
```
**Expected Result:** version=23, success=true

---

## Success Criteria

- [x] All 19 FK constraints present
- [x] Zero orphaned records
- [x] All 15 performance indexes created
- [x] Flyway migration marked as success
- [x] Application boots successfully
- [x] Frontend + Backend integration working
- [x] No API errors

---

## Troubleshooting

### Issue: Migration fails with "Constraint already exists"
**Solution:** Check if V23 was already applied. Run: `SELECT * FROM flyway_schema_history WHERE version = '23';`

### Issue: Orphaned records detected
**Solution:** Check Phase 1 cleanup. Run: `SELECT COUNT(*) FROM wallets WHERE user_id NOT IN (SELECT id FROM users);`

### Issue: Application won't start
**Solution:** Check database connection and Flyway logs for V23 validation errors

---

## Rollback Procedure

If V23 deployment fails:

```sql
-- 1. Disable all FK constraints
ALTER TABLE mentor_offerings DISABLE TRIGGER ALL;
ALTER TABLE forum_posts DISABLE TRIGGER ALL;
ALTER TABLE wallets DISABLE TRIGGER ALL;
-- ... (repeat for all tables with FK constraints)

-- 2. Drop constraints manually if needed
ALTER TABLE mentor_offerings DROP CONSTRAINT IF EXISTS fk_mentor_offerings_mentor_id;
-- ... (repeat for all 19 constraints)

-- 3. Reset Flyway migration history
DELETE FROM flyway_schema_history WHERE version = '23';

-- 4. Re-enable triggers
ALTER TABLE mentor_offerings ENABLE TRIGGER ALL;
ALTER TABLE forum_posts ENABLE TRIGGER ALL;
ALTER TABLE wallets ENABLE TRIGGER ALL;
-- ... (repeat for all tables)
```

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Flyway migration logs
3. Verify database connection
4. Confirm all 4 post-deployment validation queries pass
