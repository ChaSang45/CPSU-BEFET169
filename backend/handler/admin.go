// เจ้าของ: Matika — ส่วน Admin: เพิ่ม / แก้ / ลบ กิจกรรม, ดูรายชื่อผู้สมัคร
// ทุก route ในไฟล์นี้ครอบด้วย admin(...) ใน Routes() = mw.RequireAdmin (401/403)
package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"faculty-activities/store"
)

type activityInput struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartAt     time.Time `json:"startAt"` // รูปแบบ ISO เช่น "2026-11-20T02:00:00.000Z"
	Capacity    int       `json:"capacity"`
}

// validate ตรวจข้อมูล คืนข้อความ error (ว่าง = ผ่าน)
func (in *activityInput) validate() string {
	in.Title = strings.TrimSpace(in.Title)
	in.Location = strings.TrimSpace(in.Location)
	in.Description = strings.TrimSpace(in.Description)
	if in.Title == "" {
		return "กรุณากรอกชื่อกิจกรรม"
	}
	if in.StartAt.IsZero() {
		return "กรุณาระบุวันเวลาเริ่ม"
	}
	if in.Capacity < 1 {
		return "จำนวนรับต้องมากกว่า 0"
	}
	return ""
}

func (in activityInput) toActivity(id int64) store.Activity {
	return store.Activity{
		ID: id, Title: in.Title, Description: in.Description,
		Location: in.Location, StartAt: in.StartAt, Capacity: in.Capacity,
	}
}

// POST /api/admin/activities
func (h *Handler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	var in activityInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}
	if msg := in.validate(); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}
	id, err := h.Store.CreateActivity(r.Context(), in.toActivity(0))
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

// PUT /api/admin/activities/{id}
func (h *Handler) UpdateActivity(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var in activityInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}
	if msg := in.validate(); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}

	// ห้ามลดจำนวนรับให้น้อยกว่าคนที่สมัครแล้ว
	current, err := h.Store.GetActivity(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "ไม่พบกิจกรรม")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	if in.Capacity < current.Registered {
		writeError(w, http.StatusBadRequest, "จำนวนรับน้อยกว่าจำนวนคนที่สมัครแล้ว")
		return
	}

	err = h.Store.UpdateActivity(r.Context(), in.toActivity(id))
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "ไม่พบกิจกรรม")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "บันทึกแล้ว"})
}

// DELETE /api/admin/activities/{id}
func (h *Handler) DeleteActivity(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	err := h.Store.DeleteActivity(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "ไม่พบกิจกรรม")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /api/admin/activities/{id}/participants  ตอบ { activity, items }
func (h *Handler) Participants(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	a, err := h.Store.GetActivity(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "ไม่พบกิจกรรม")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	list, err := h.Store.ListParticipants(r.Context(), id)
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"activity": a, "items": list})
}
