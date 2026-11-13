// เจ้าของ: Matika — สมัคร / ยกเลิก / กิจกรรมของฉัน (ต้อง login ทุกอัน)
// member_id มาจากตั๋วเท่านั้น ห้ามรับจาก body หรือ URL
package handler

import (
	"errors"
	"net/http"

	"faculty-activities/mw"
	"faculty-activities/store"
)

// GET /api/me/activities 🔒  ตอบ { items }
func (h *Handler) MyActivities(w http.ResponseWriter, r *http.Request) {
	list, err := h.Store.ListMyActivities(r.Context(), mw.CurrentMember(r).MemberID)
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

// PUT /api/me/activities/{id} 🔒  สมัครเข้าร่วม
func (h *Handler) Join(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	err := h.Store.JoinActivity(r.Context(), mw.CurrentMember(r).MemberID, id)
	switch {
	case err == nil:
		w.WriteHeader(http.StatusNoContent)
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "ไม่พบกิจกรรม")
	case errors.Is(err, store.ErrDuplicate):
		writeError(w, http.StatusConflict, "คุณสมัครกิจกรรมนี้แล้ว")
	case errors.Is(err, store.ErrFull):
		writeError(w, http.StatusConflict, "กิจกรรมเต็มแล้ว")
	case errors.Is(err, store.ErrPast):
		writeError(w, http.StatusBadRequest, "กิจกรรมเริ่มไปแล้ว สมัครไม่ได้")
	default:
		serverError(w, err)
	}
}

// DELETE /api/me/activities/{id} 🔒  ยกเลิกการสมัคร
func (h *Handler) CancelJoin(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	err := h.Store.CancelJoin(r.Context(), mw.CurrentMember(r).MemberID, id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "คุณยังไม่ได้สมัครกิจกรรมนี้")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
