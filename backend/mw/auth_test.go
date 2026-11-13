package mw

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

var secret = []byte("test-secret")

func okHandler(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) }

func callWith(t *testing.T, h http.HandlerFunc, token string) int {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	rec := httptest.NewRecorder()
	h(rec, req)
	return rec.Code
}

func TestRequireAuth(t *testing.T) {
	h := RequireAuth(secret, okHandler)

	if code := callWith(t, h, ""); code != http.StatusUnauthorized {
		t.Fatalf("ไม่มี token ต้องได้ 401 แต่ได้ %d", code)
	}
	if code := callWith(t, h, "abc.def.ghi"); code != http.StatusUnauthorized {
		t.Fatalf("token มั่ว ต้องได้ 401 แต่ได้ %d", code)
	}

	wrong, _ := MakeToken([]byte("other-secret"), 1, "member")
	if code := callWith(t, h, wrong); code != http.StatusUnauthorized {
		t.Fatalf("token คนละ secret ต้องได้ 401 แต่ได้ %d", code)
	}

	good, _ := MakeToken(secret, 1, "member")
	if code := callWith(t, h, good); code != http.StatusOK {
		t.Fatalf("token ถูกต้อง ต้องได้ 200 แต่ได้ %d", code)
	}
}

func TestRequireAdmin(t *testing.T) {
	h := RequireAdmin(secret, okHandler)

	if code := callWith(t, h, ""); code != http.StatusUnauthorized {
		t.Fatalf("ไม่ล็อกอิน ต้องได้ 401 แต่ได้ %d", code)
	}

	member, _ := MakeToken(secret, 1, "member")
	if code := callWith(t, h, member); code != http.StatusForbidden {
		t.Fatalf("member ต้องได้ 403 แต่ได้ %d", code)
	}

	admin, _ := MakeToken(secret, 2, "admin")
	if code := callWith(t, h, admin); code != http.StatusOK {
		t.Fatalf("admin ต้องได้ 200 แต่ได้ %d", code)
	}
}
