// เจ้าของ: Matika — SQL ของการสมัครเข้าร่วมกิจกรรม
package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// JoinActivity สมัครเข้าร่วม ใช้ transaction + FOR UPDATE
// เพื่อกันกรณี 2 คนกดพร้อมกันตอนเหลือที่ว่างที่เดียว แล้วเกินจำนวนรับ
func (s *Store) JoinActivity(ctx context.Context, memberID, activityID int64) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) // ถ้า Commit สำเร็จแล้ว Rollback จะไม่มีผล

	var capacity int
	var startAt time.Time
	err = tx.QueryRow(ctx, `
SELECT capacity, start_at FROM activities WHERE id = $1 FOR UPDATE`, activityID).
		Scan(&capacity, &startAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	if startAt.Before(time.Now()) {
		return ErrPast
	}

	var count int
	err = tx.QueryRow(ctx, `
SELECT COUNT(*) FROM registrations WHERE activity_id = $1`, activityID).Scan(&count)
	if err != nil {
		return err
	}
	if count >= capacity {
		return ErrFull
	}

	_, err = tx.Exec(ctx, `
INSERT INTO registrations (member_id, activity_id) VALUES ($1, $2)`, memberID, activityID)
	if isUniqueViolation(err) {
		return ErrDuplicate
	}
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) CancelJoin(ctx context.Context, memberID, activityID int64) error {
	tag, err := s.DB.Exec(ctx, `
DELETE FROM registrations WHERE member_id = $1 AND activity_id = $2`, memberID, activityID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// ListMyActivities กิจกรรมที่สมาชิกคนนี้สมัครไว้
func (s *Store) ListMyActivities(ctx context.Context, memberID int64) ([]Activity, error) {
	rows, err := s.DB.Query(ctx, activitySelect+`
WHERE a.id IN (SELECT activity_id FROM registrations WHERE member_id = $1)
GROUP BY a.id
ORDER BY a.start_at`, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []Activity{}
	for rows.Next() {
		a, err := scanActivity(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, rows.Err()
}
