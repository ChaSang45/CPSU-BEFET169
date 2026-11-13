// เจ้าของ: Matika — SQL ของสมาชิก (สมัคร / ล็อกอิน)
package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// isUniqueViolation = ข้อมูลซ้ำกับ UNIQUE / PRIMARY KEY (error code ของ Postgres คือ 23505)
func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

// CreateMember สร้างสมาชิกใหม่ role = member เสมอ (แอดมินตั้งผ่าน SQL เท่านั้น)
func (s *Store) CreateMember(ctx context.Context, email, passwordHash, displayName string) (Member, error) {
	var m Member
	err := s.DB.QueryRow(ctx, `
INSERT INTO members (email, password_hash, display_name)
VALUES (lower($1), $2, $3)
RETURNING id, email, display_name, role, created_at`, email, passwordHash, displayName).
		Scan(&m.ID, &m.Email, &m.DisplayName, &m.Role, &m.CreatedAt)
	if isUniqueViolation(err) {
		return m, ErrEmailTaken
	}
	return m, err
}

func (s *Store) GetMemberByEmail(ctx context.Context, email string) (Member, error) {
	var m Member
	err := s.DB.QueryRow(ctx, `
SELECT id, email, password_hash, display_name, role, created_at
FROM members WHERE lower(email) = lower($1)`, email).
		Scan(&m.ID, &m.Email, &m.PasswordHash, &m.DisplayName, &m.Role, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return m, ErrNotFound
	}
	return m, err
}

func (s *Store) GetMemberByID(ctx context.Context, id int64) (Member, error) {
	var m Member
	err := s.DB.QueryRow(ctx, `
SELECT id, email, display_name, role, created_at FROM members WHERE id = $1`, id).
		Scan(&m.ID, &m.Email, &m.DisplayName, &m.Role, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return m, ErrNotFound
	}
	return m, err
}

// UpdateDisplayName แก้ชื่อที่แสดงของตัวเอง แล้วคืนข้อมูลล่าสุด
func (s *Store) UpdateDisplayName(ctx context.Context, id int64, displayName string) (Member, error) {
	var m Member
	err := s.DB.QueryRow(ctx, `
UPDATE members SET display_name = $1 WHERE id = $2
RETURNING id, email, display_name, role, created_at`, displayName, id).
		Scan(&m.ID, &m.Email, &m.DisplayName, &m.Role, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return m, ErrNotFound
	}
	return m, err
}

// GetPasswordHash ดึง hash ปัจจุบันมาเทียบก่อนเปลี่ยนรหัสผ่าน
func (s *Store) GetPasswordHash(ctx context.Context, id int64) (string, error) {
	var hash string
	err := s.DB.QueryRow(ctx, `SELECT password_hash FROM members WHERE id = $1`, id).Scan(&hash)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return hash, err
}

func (s *Store) UpdatePassword(ctx context.Context, id int64, passwordHash string) error {
	tag, err := s.DB.Exec(ctx, `UPDATE members SET password_hash = $1 WHERE id = $2`, passwordHash, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
