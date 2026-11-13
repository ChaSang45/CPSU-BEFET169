// เจ้าของ: ChaSang45 — สร้าง/ตรวจ JWT และตรวจสิทธิ์ 401 / 403
package mw

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims = ข้อมูลที่ฝังในตั๋ว (token)
type Claims struct {
	MemberID int64  `json:"mid"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type ctxKey string

const claimsKey ctxKey = "claims"

// MakeToken ออกตั๋วอายุ 24 ชั่วโมง
func MakeToken(secret []byte, memberID int64, role string) (string, error) {
	claims := Claims{
		MemberID: memberID,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

// RequireAuth ต้อง login: ไม่มีตั๋ว / ตั๋วปลอม / หมดอายุ = 401
func RequireAuth(secret []byte, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenStr := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if tokenStr == "" || tokenStr == r.Header.Get("Authorization") {
			writeError(w, http.StatusUnauthorized, "กรุณาเข้าสู่ระบบ")
			return
		}

		claims := &Claims{}
		_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
			return secret, nil
		}, jwt.WithValidMethods([]string{"HS256"})) // รับเฉพาะ HS256 กันการปลอมชนิดลายเซ็น
		if err != nil {
			writeError(w, http.StatusUnauthorized, "ตั๋วไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่")
			return
		}

		ctx := context.WithValue(r.Context(), claimsKey, claims)
		next(w, r.WithContext(ctx))
	}
}

// RequireAdmin ต้อง login (401) และต้องเป็น admin (403)
func RequireAdmin(secret []byte, next http.HandlerFunc) http.HandlerFunc {
	return RequireAuth(secret, func(w http.ResponseWriter, r *http.Request) {
		if CurrentMember(r).Role != "admin" {
			writeError(w, http.StatusForbidden, "เฉพาะผู้ดูแลระบบเท่านั้น")
			return
		}
		next(w, r)
	})
}

// CurrentMember อ่านตัวตนจากตั๋ว (ใช้ได้เฉพาะใน handler ที่ครอบด้วย RequireAuth)
func CurrentMember(r *http.Request) *Claims {
	return r.Context().Value(claimsKey).(*Claims)
}
