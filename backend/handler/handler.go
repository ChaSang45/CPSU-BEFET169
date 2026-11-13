// ไฟล์กลาง: struct Handler, ฟังก์ชันช่วยตอบ JSON และ Routes() รวมเส้นทางทั้งหมด
package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"faculty-activities/mw"
	"faculty-activities/store"
)

type Handler struct {
	Store  *store.Store
	Secret []byte // กุญแจเซ็นตั๋ว JWT
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

// serverError จด log ฝั่ง server แต่ไม่บอกรายละเอียด error ให้หน้าเว็บ
func serverError(w http.ResponseWriter, err error) {
	log.Println("server error:", err)
	writeError(w, http.StatusInternalServerError, "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์")
}

// pathID อ่าน {id} จาก URL เช่น /api/activities/5
func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "id ต้องเป็นตัวเลข")
		return 0, false
	}
	return id, true
}

func (h *Handler) Routes() *http.ServeMux {
	auth := func(next http.HandlerFunc) http.HandlerFunc { return mw.RequireAuth(h.Secret, next) }
	admin := func(next http.HandlerFunc) http.HandlerFunc { return mw.RequireAdmin(h.Secret, next) }

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// Guest (ไม่ต้อง login)
	mux.HandleFunc("GET /api/activities", h.ListActivities)
	mux.HandleFunc("GET /api/activities/{id}", h.GetActivity)
	mux.HandleFunc("POST /api/auth/register", h.Register)
	mux.HandleFunc("POST /api/auth/login", h.Login)

	// Member (ต้อง login)
	mux.HandleFunc("GET /api/me", auth(h.Me))
	mux.HandleFunc("PUT /api/me", auth(h.UpdateMe))
	mux.HandleFunc("PUT /api/me/password", auth(h.ChangePassword))
	mux.HandleFunc("GET /api/me/activities", auth(h.MyActivities))
	mux.HandleFunc("PUT /api/me/activities/{id}", auth(h.Join))
	mux.HandleFunc("DELETE /api/me/activities/{id}", auth(h.CancelJoin))

	// Admin (ต้องเป็น admin)
	mux.HandleFunc("POST /api/admin/activities", admin(h.CreateActivity))
	mux.HandleFunc("PUT /api/admin/activities/{id}", admin(h.UpdateActivity))
	mux.HandleFunc("DELETE /api/admin/activities/{id}", admin(h.DeleteActivity))
	mux.HandleFunc("GET /api/admin/activities/{id}/participants", admin(h.Participants))
	return mux
}
