// เจ้าของ: ChaSang45 — สมัครสมาชิก / ล็อกอิน / ดูข้อมูลตัวเอง
package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"faculty-activities/mw"
	"faculty-activities/store"

	"golang.org/x/crypto/bcrypt"
)

// POST /api/auth/register  body { email, password, displayName }
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email       string `json:"email"`
		Password    string `json:"password"`
		DisplayName string `json:"displayName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}
	in.Email = strings.TrimSpace(in.Email)
	in.DisplayName = strings.TrimSpace(in.DisplayName)

	// ตรวจข้อมูลซ้ำที่ backend เสมอ ไม่เชื่อหน้าเว็บ
	if in.DisplayName == "" || !strings.Contains(in.Email, "@") {
		writeError(w, http.StatusBadRequest, "กรุณากรอกชื่อและอีเมลให้ถูกต้อง")
		return
	}
	if len(in.Password) < 6 || len(in.Password) > 72 { // bcrypt รับได้ไม่เกิน 72 byte
		writeError(w, http.StatusBadRequest, "รหัสผ่านต้องยาว 6-72 ตัวอักษร")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		serverError(w, err)
		return
	}
	member, err := h.Store.CreateMember(r.Context(), in.Email, string(hash), in.DisplayName)
	if errors.Is(err, store.ErrEmailTaken) {
		writeError(w, http.StatusConflict, "อีเมลนี้ถูกใช้แล้ว")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, member)
}

// POST /api/auth/login  body { email, password }  ตอบ { token, member }
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}

	member, err := h.Store.GetMemberByEmail(r.Context(), strings.TrimSpace(in.Email))
	if err != nil && !errors.Is(err, store.ErrNotFound) {
		serverError(w, err)
		return
	}
	// ข้อความเดียวกันทั้งกรณีไม่มีอีเมลและรหัสผิด คนอื่นจะเดาไม่ได้ว่าอีเมลไหนมีในระบบ
	if errors.Is(err, store.ErrNotFound) ||
		bcrypt.CompareHashAndPassword([]byte(member.PasswordHash), []byte(in.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
		return
	}

	token, err := mw.MakeToken(h.Secret, member.ID, member.Role)
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "member": member})
}

// GET /api/me 🔒
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	member, err := h.Store.GetMemberByID(r.Context(), mw.CurrentMember(r).MemberID)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "ไม่พบบัญชีนี้ กรุณาเข้าสู่ระบบใหม่")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, member)
}

// PUT /api/me 🔒  body { displayName }  แก้โปรไฟล์ของตัวเอง
func (h *Handler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	var in struct {
		DisplayName string `json:"displayName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}
	in.DisplayName = strings.TrimSpace(in.DisplayName)
	if in.DisplayName == "" || len([]rune(in.DisplayName)) > 100 {
		writeError(w, http.StatusBadRequest, "ชื่อต้องไม่ว่าง และยาวไม่เกิน 100 ตัวอักษร")
		return
	}
	member, err := h.Store.UpdateDisplayName(r.Context(), mw.CurrentMember(r).MemberID, in.DisplayName)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "ไม่พบบัญชีนี้ กรุณาเข้าสู่ระบบใหม่")
		return
	}
	if err != nil {
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, member)
}

// PUT /api/me/password 🔒  body { currentPassword, newPassword }
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "อ่าน JSON ไม่ออก")
		return
	}
	if len(in.NewPassword) < 6 || len(in.NewPassword) > 72 {
		writeError(w, http.StatusBadRequest, "รหัสผ่านใหม่ต้องยาว 6-72 ตัวอักษร")
		return
	}
	id := mw.CurrentMember(r).MemberID

	// ต้องยืนยันรหัสเดิมก่อน กันคนที่แอบใช้เครื่องที่ login ค้างไว้มาเปลี่ยนรหัส
	oldHash, err := h.Store.GetPasswordHash(r.Context(), id)
	if err != nil {
		serverError(w, err)
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(oldHash), []byte(in.CurrentPassword)) != nil {
		writeError(w, http.StatusBadRequest, "รหัสผ่านเดิมไม่ถูกต้อง")
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(in.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		serverError(w, err)
		return
	}
	if err := h.Store.UpdatePassword(r.Context(), id, string(newHash)); err != nil {
		serverError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
