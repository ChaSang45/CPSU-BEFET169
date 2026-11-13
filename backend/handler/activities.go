// เจ้าของ: Matika — ดูรายการ / ค้นหา / ดูรายละเอียดกิจกรรม (Guest ใช้ได้ ไม่ต้อง login)
package handler

import (
	"errors"
	"net/http"
	"strings"

	"faculty-activities/store"
)

// GET /api/activities?q=คำค้น  ตอบ { items }
func (h *Handler) ListActivities(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	list, err := h.Store.ListActivities(r.Context(), q)
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": list})
}

// GET /api/activities/{id}
func (h *Handler) GetActivity(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, a)
}
