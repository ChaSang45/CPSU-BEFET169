// ไฟล์กลาง: เชื่อมต่อฐานข้อมูล และ struct ที่ใช้ร่วมกัน
package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// error ที่ handler ใช้ตัดสินว่าจะตอบ status อะไร
var (
	ErrNotFound   = errors.New("not found")
	ErrEmailTaken = errors.New("email taken")
	ErrDuplicate  = errors.New("already registered")
	ErrFull       = errors.New("activity full")
	ErrPast       = errors.New("activity already started")
)

type Store struct {
	DB *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}
	return &Store{DB: pool}, nil
}

type Member struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // ห้ามส่งออกไปหน้าเว็บ
	DisplayName  string    `json:"displayName"`
	Role         string    `json:"role"` // "member" | "admin"
	CreatedAt    time.Time `json:"createdAt"`
}

type Activity struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartAt     time.Time `json:"startAt"`
	Capacity    int       `json:"capacity"`
	Registered  int       `json:"registered"` // จำนวนคนที่สมัครแล้ว (นับจากตาราง registrations)
}

type Participant struct {
	MemberID     int64     `json:"memberId"`
	DisplayName  string    `json:"displayName"`
	Email        string    `json:"email"`
	RegisteredAt time.Time `json:"registeredAt"`
}
