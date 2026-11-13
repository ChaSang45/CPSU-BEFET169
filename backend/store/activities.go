// เจ้าของ: Matika — SQL ของกิจกรรม (ดู / ค้นหา / เพิ่ม / แก้ / ลบ / รายชื่อผู้สมัคร)
package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
)

// SELECT ส่วนที่ใช้ซ้ำ: กิจกรรม + จำนวนคนที่สมัคร
const activitySelect = `
SELECT a.id, a.title, a.description, a.location, a.start_at, a.capacity, COUNT(r.member_id)
FROM activities a
LEFT JOIN registrations r ON r.activity_id = a.id`

func scanActivity(row pgx.Row) (Activity, error) {
	var a Activity
	err := row.Scan(&a.ID, &a.Title, &a.Description, &a.Location, &a.StartAt, &a.Capacity, &a.Registered)
	return a, err
}

// ListActivities ค้นหาจากชื่อหรือสถานที่ ถ้า q ว่าง = เอาทั้งหมด
func (s *Store) ListActivities(ctx context.Context, q string) ([]Activity, error) {
	rows, err := s.DB.Query(ctx, activitySelect+`
WHERE $1 = '' OR a.title ILIKE '%' || $1 || '%' OR a.location ILIKE '%' || $1 || '%'
GROUP BY a.id
ORDER BY a.start_at`, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []Activity{} // เริ่มเป็น slice ว่าง ไม่ใช่ nil เพื่อให้ JSON เป็น [] ไม่ใช่ null
	for rows.Next() {
		a, err := scanActivity(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, a)
	}
	return list, rows.Err()
}

func (s *Store) GetActivity(ctx context.Context, id int64) (Activity, error) {
	a, err := scanActivity(s.DB.QueryRow(ctx, activitySelect+`
WHERE a.id = $1
GROUP BY a.id`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return a, ErrNotFound
	}
	return a, err
}

func (s *Store) CreateActivity(ctx context.Context, a Activity) (int64, error) {
	var id int64
	err := s.DB.QueryRow(ctx, `
INSERT INTO activities (title, description, location, start_at, capacity)
VALUES ($1, $2, $3, $4, $5)
RETURNING id`, a.Title, a.Description, a.Location, a.StartAt, a.Capacity).Scan(&id)
	return id, err
}

func (s *Store) UpdateActivity(ctx context.Context, a Activity) error {
	tag, err := s.DB.Exec(ctx, `
UPDATE activities
SET title = $1, description = $2, location = $3, start_at = $4, capacity = $5
WHERE id = $6`, a.Title, a.Description, a.Location, a.StartAt, a.Capacity, a.ID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DeleteActivity(ctx context.Context, id int64) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM activities WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) ListParticipants(ctx context.Context, activityID int64) ([]Participant, error) {
	rows, err := s.DB.Query(ctx, `
SELECT m.id, m.display_name, m.email, r.created_at
FROM registrations r
JOIN members m ON m.id = r.member_id
WHERE r.activity_id = $1
ORDER BY r.created_at`, activityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []Participant{}
	for rows.Next() {
		var p Participant
		if err := rows.Scan(&p.MemberID, &p.DisplayName, &p.Email, &p.RegisteredAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, rows.Err()
}
